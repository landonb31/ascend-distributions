import { createAdminClient } from "@/lib/supabase/admin";
import { generateIsrc, generateUpc, normalizeIsrc, normalizeUpc } from "@/lib/distribution/identifiers";
import type { ReleasePackage } from "@/lib/distribution/types";
import type { Release, Track } from "@/types";

import type { AudioFormat } from "@/lib/utils";

function extensionForFormat(format: AudioFormat) {
  return format;
}

async function downloadStorageFile(bucket: string, path: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(`Could not download ${bucket}/${path}: ${error?.message || "unknown"}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const fileName = path.split("/").pop() || "file";
  return { buffer, fileName };
}

async function downloadArtwork(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download artwork (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";

  return {
    buffer,
    fileName: `cover.${extension}`,
    url,
  };
}

export async function loadReleasePackage(releaseId: string): Promise<ReleasePackage> {
  const admin = createAdminClient();

  const { data: release, error: releaseError } = await admin
    .from("releases")
    .select("*")
    .eq("id", releaseId)
    .single();

  if (releaseError || !release) {
    throw new Error("Release not found");
  }

  const { data: tracks, error: tracksError } = await admin
    .from("tracks")
    .select("*")
    .eq("release_id", releaseId)
    .order("track_number", { ascending: true });

  if (tracksError || !tracks?.length) {
    throw new Error("Release has no tracks");
  }

  const { data: owner } = await admin
    .from("users")
    .select("email")
    .eq("id", release.user_id)
    .single();

  const typedRelease = release as Release;
  const typedTracks = tracks as Track[];

  let upc = normalizeUpc(typedRelease.upc);
  if (!upc) {
    upc = generateUpc(typedRelease.id);
    await admin.from("releases").update({ upc }).eq("id", releaseId);
    typedRelease.upc = upc;
  }

  const audioFiles = [];
  for (const track of typedTracks) {
    if (!track.audio_url || !track.audio_format) {
      throw new Error(`Track "${track.title}" is missing audio`);
    }

    let isrc = normalizeIsrc(track.isrc);
    if (!isrc) {
      isrc = generateIsrc(`${releaseId}:${track.id}`);
      await admin.from("tracks").update({ isrc }).eq("id", track.id);
      track.isrc = isrc;
    }

    const downloaded = await downloadStorageFile("audio", track.audio_url);
    audioFiles.push({
      trackId: track.id,
      path: track.audio_url,
      buffer: downloaded.buffer,
      format: track.audio_format,
      fileName: `${track.id}.${extensionForFormat(track.audio_format)}`,
    });
  }

  let artwork: ReleasePackage["artwork"];
  if (typedRelease.artwork_url) {
    artwork = await downloadArtwork(typedRelease.artwork_url);
  }

  return {
    release: typedRelease,
    tracks: typedTracks,
    ownerEmail: owner?.email || "",
    audioFiles,
    artwork,
  };
}
