import {
  ACCEPTED_AUDIO_LABEL,
  getAudioFormatFromFilename,
  isAcceptedAudioUpload,
  type AudioFormat,
} from "@/lib/utils";
import { apiError, apiSuccess, getAuthContext } from "@/lib/api";

const MAX_AUDIO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_ARTWORK_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_ARTWORK_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getAudioFormat(filename: string): AudioFormat | null {
  return getAudioFormatFromFilename(filename);
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) {
      return apiError("File and type are required");
    }

    if (type !== "audio" && type !== "artwork") {
      return apiError("Type must be 'audio' or 'artwork'");
    }

    if (type === "audio") {
      const format = getAudioFormat(file.name);

      if (!format || !isAcceptedAudioUpload(file.name, file.type)) {
        return apiError(`Invalid audio format. Accepted: ${ACCEPTED_AUDIO_LABEL}`);
      }

      if (file.size > MAX_AUDIO_SIZE) {
        return apiError("Audio file exceeds 500MB limit");
      }
    } else {
      if (!ACCEPTED_ARTWORK_TYPES.includes(file.type)) {
        return apiError("Invalid artwork format. Accepted: JPG, PNG, WebP");
      }

      if (file.size > MAX_ARTWORK_SIZE) {
        return apiError("Artwork file exceeds 10MB limit");
      }
    }

    const bucket = type === "audio" ? "audio" : "artwork";
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return apiError("Failed to upload file", 500);
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return apiSuccess({
      url: urlData.publicUrl,
      path,
      bucket,
      ...(type === "audio" && { format: getAudioFormat(file.name) }),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Failed to upload file", 500);
  }
}
