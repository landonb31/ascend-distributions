import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { FugaClient } from "@/lib/distribution/fuga/client";
import { DEFAULT_PLATFORMS, getFugaConfig } from "@/lib/distribution/config";
import { generateIsrc, generateUpc, normalizeIsrc, normalizeUpc } from "@/lib/distribution/identifiers";
import type {
  DistributionProvider,
  DistributionResult,
  ReleasePackage,
} from "@/lib/distribution/types";

const PLATFORM_DSP_NAMES: Record<string, string> = {
  Spotify: "spotify",
  "Apple Music": "apple",
  "YouTube Music": "youtube",
  "Amazon Music": "amazon",
  Tidal: "tidal",
  Deezer: "deezer",
};

function extractId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  if (obj.id) return String(obj.id);
  if (obj.asset && typeof obj.asset === "object" && (obj.asset as { id?: string }).id) {
    return String((obj.asset as { id: string }).id);
  }
  return null;
}

export class FugaDistributionProvider implements DistributionProvider {
  name = "fuga";

  async distribute(_jobId: string, pkg: ReleasePackage): Promise<DistributionResult> {
    const config = getFugaConfig();
    const client = FugaClient.fromEnv();
    await client.login();

    const tempDir = mkdtempSync(join(tmpdir(), "ascend-dist-"));
    const cleanupPaths: string[] = [];

    try {
      const upc =
        normalizeUpc(pkg.release.upc) || generateUpc(pkg.release.id);
      const releaseDate = pkg.release.release_date || new Date().toISOString().slice(0, 10);

      const artistName = pkg.tracks[0]?.artist_name || "Unknown Artist";
      const fugaArtist = await this.findOrCreateArtist(client, artistName);

      const productPayload = {
        name: pkg.release.title,
        upc,
        catalog_number: pkg.release.id.slice(0, 12),
        release_date: releaseDate,
        genre: config.defaultSubgenreId,
        label: Number(config.labelId),
        parental_advisory: pkg.tracks.some((t) => t.is_explicit),
        artists: [{ id: Number(fugaArtist), primary: true }],
        metadata_language: "en",
      };

      const productResp = await client.post("/products", productPayload);
      if (!productResp.success) {
        throw new Error(productResp.error?.message || "Failed to create FUGA product");
      }

      const productId = extractId(productResp.data);
      if (!productId) {
        throw new Error("FUGA product created without id");
      }

      if (!normalizeUpc(pkg.release.upc)) {
        await client.post(`/products/${productId}/barcode`);
      }

      const isrcMap: Record<string, string> = {};
      const assetIds: string[] = [];

      for (const [index, track] of pkg.tracks.entries()) {
        const isrc =
          normalizeIsrc(track.isrc) || generateIsrc(`${pkg.release.id}:${track.id}`);
        isrcMap[track.id] = isrc;

        const assetResp = await client.post("/assets", {
          name: track.title,
          isrc,
          genre: config.defaultSubgenreId,
          parental_advisory: track.is_explicit,
          artists: [{ id: Number(fugaArtist), primary: true }],
        });

        if (!assetResp.success) {
          throw new Error(assetResp.error?.message || `Failed to create asset for ${track.title}`);
        }

        const assetId = extractId(assetResp.data);
        if (!assetId) {
          throw new Error(`FUGA asset missing id for ${track.title}`);
        }

        const audioFile = pkg.audioFiles.find((f) => f.trackId === track.id);
        if (!audioFile) {
          throw new Error(`Missing audio file for track ${track.title}`);
        }

        const audioPath = join(tempDir, audioFile.fileName);
        writeFileSync(audioPath, audioFile.buffer);
        cleanupPaths.push(audioPath);

        await client.uploadBuffer(audioFile.buffer, audioFile.fileName, {
          id: assetId,
          type: "audio",
          overwrite_all: true,
          clear_all_encodings: true,
        });

        const attachResp = await client.post(`/products/${productId}/assets`, {
          id: assetId,
          sequence: index + 1,
        });

        if (!attachResp.success) {
          throw new Error(attachResp.error?.message || `Failed to attach asset ${track.title}`);
        }

        assetIds.push(assetId);
      }

      if (pkg.artwork) {
        const artworkPath = join(tempDir, pkg.artwork.fileName);
        writeFileSync(artworkPath, pkg.artwork.buffer);
        cleanupPaths.push(artworkPath);

        await client.uploadBuffer(pkg.artwork.buffer, pkg.artwork.fileName, {
          id: productId,
          type: "image",
        });
      }

      const publishResp = await client.post(`/products/${productId}/publish`);
      if (!publishResp.success) {
        throw new Error(publishResp.error?.message || "Failed to publish FUGA product");
      }

      const dsps = config.deliveryDsps.map((dsp) => ({ dsp: Number(dsp) }));

      if (dsps.length > 0) {
        const editResp = await client.put(`/products/${productId}/delivery_instructions/edit`, [
          ...dsps.map((entry) => ({
            ...entry,
            release_date: releaseDate,
            include_territories: ["WW"],
          })),
        ]);

        if (!editResp.success) {
          throw new Error(editResp.error?.message || "Failed to configure FUGA delivery");
        }

        const deliverResp = await client.post(
          `/products/${productId}/delivery_instructions/deliver`,
          dsps
        );

        if (!deliverResp.success) {
          throw new Error(deliverResp.error?.message || "Failed to deliver to DSPs");
        }
      }

      const platformDeliveries = DEFAULT_PLATFORMS.map((platform) => ({
        platform,
        externalDspId: PLATFORM_DSP_NAMES[platform],
        status: "submitted" as const,
      }));

      return {
        externalProductId: productId,
        upc,
        isrcs: isrcMap,
        platformDeliveries,
      };
    } finally {
      for (const path of cleanupPaths) {
        try {
          unlinkSync(path);
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  private async findOrCreateArtist(client: FugaClient, name: string) {
    const list = await client.get<{ artist?: Array<{ id: number; name: string }> }>("/artists", {
      page: 0,
      page_size: 50,
      search: name,
    });

    if (list.success && list.data?.artist?.length) {
      const exact = list.data.artist.find(
        (artist) => artist.name.toLowerCase() === name.toLowerCase()
      );
      if (exact) return String(exact.id);
    }

    const created = await client.post("/artists", { name });
    if (!created.success) {
      throw new Error(created.error?.message || "Failed to create FUGA artist");
    }

    const artistId = extractId(created.data);
    if (!artistId) {
      throw new Error("FUGA artist created without id");
    }

    return artistId;
  }
}

export function getDistributionProvider() {
  return new FugaDistributionProvider();
}
