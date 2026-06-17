"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Music,
  ImageIcon,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { releaseMetadataSchema, type ReleaseMetadataInput } from "@/lib/validations";
import {
  ACCEPTED_AUDIO_FORMATS,
  ACCEPTED_AUDIO_MIME_TYPES,
  GENRES,
  cn,
} from "@/lib/utils";

interface UploadFormProps {
  defaultArtistName?: string;
  editReleaseId?: string;
}

function getAudioFormat(filename: string): "wav" | "flac" | "mp3" | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "wav") return "wav";
  if (ext === "flac") return "flac";
  if (ext === "mp3") return "mp3";
  return null;
}

export function UploadForm({ defaultArtistName = "", editReleaseId }: UploadFormProps) {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [featuringInput, setFeaturingInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(!!editReleaseId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReleaseMetadataInput>({
    resolver: zodResolver(releaseMetadataSchema),
    defaultValues: {
      title: "",
      artistName: defaultArtistName,
      featuringArtists: [],
      album: "",
      genre: undefined,
      releaseDate: "",
      isExplicit: false,
      upc: "",
      isrc: "",
    },
  });

  const isExplicit = watch("isExplicit");
  const featuringArtists = watch("featuringArtists") || [];
  const selectedGenre = watch("genre");

  useEffect(() => {
    if (!editReleaseId) return;

    async function loadDraft() {
      const supabase = createClient();
      const { data: release } = await supabase
        .from("releases")
        .select("*, tracks(*)")
        .eq("id", editReleaseId)
        .single();

      if (!release || release.status !== "draft") {
        setLoadingDraft(false);
        setError("Release not found or cannot be edited.");
        return;
      }

      const track = release.tracks?.[0];
      reset({
        title: release.title,
        artistName: track?.artist_name || defaultArtistName,
        featuringArtists: track?.featuring_artists || [],
        album: release.album || "",
        genre: (release.genre as ReleaseMetadataInput["genre"]) || undefined,
        releaseDate: release.release_date || "",
        isExplicit: track?.is_explicit || false,
        upc: release.upc || "",
        isrc: track?.isrc || "",
      });

      if (release.artwork_url) setArtworkPreview(release.artwork_url);
      setLoadingDraft(false);
    }

    loadDraft();
  }, [editReleaseId, defaultArtistName, reset]);

  const handleAudioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED_AUDIO_FORMATS.includes(ext)) {
      setError("Please upload a WAV, FLAC, or MP3 file.");
      return;
    }
    if (!ACCEPTED_AUDIO_MIME_TYPES.includes(file.type) && file.type !== "") {
      setError("Invalid audio file type.");
      return;
    }
    setError(null);
    setAudioFile(file);
  }, []);

  const handleArtworkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Artwork must be a JPG or PNG image.");
      return;
    }

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 3000 || img.height < 3000) {
        setError("Artwork must be at least 3000×3000 pixels.");
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setError(null);
      setArtworkFile(file);
      setArtworkPreview(objectUrl);
    };
    img.onerror = () => {
      setError("Could not read artwork image.");
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }, []);

  function addFeaturingArtist() {
    const name = featuringInput.trim();
    if (!name || featuringArtists.includes(name)) return;
    setValue("featuringArtists", [...featuringArtists, name]);
    setFeaturingInput("");
  }

  function removeFeaturingArtist(name: string) {
    setValue(
      "featuringArtists",
      featuringArtists.filter((a) => a !== name)
    );
  }

  async function uploadFile(
    supabase: ReturnType<typeof createClient>,
    bucket: string,
    path: string,
    file: File
  ): Promise<string | null> {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (uploadError) return null;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return bucket === "audio"
      ? (await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365)).data
          ?.signedUrl || path
      : data.publicUrl;
  }

  async function onSubmit(data: ReleaseMetadataInput) {
    setError(null);
    setUploadProgress(0);

    if (!editReleaseId && !audioFile) {
      setError("Please upload an audio file.");
      return;
    }
    if (!editReleaseId && !artworkFile && !artworkPreview) {
      setError("Please upload artwork (3000×3000 minimum).");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to upload.");
      return;
    }

    setUploadProgress(10);

    let artworkUrl: string | null = artworkPreview;
    let audioUrl: string | null = null;
    const releaseId = editReleaseId || crypto.randomUUID();
    const trackId = crypto.randomUUID();

    if (artworkFile) {
      const artworkPath = `${user.id}/${releaseId}/cover.${artworkFile.name.split(".").pop()}`;
      artworkUrl = await uploadFile(supabase, "artwork", artworkPath, artworkFile);
      if (!artworkUrl) {
        setError("Failed to upload artwork. Please try again.");
        return;
      }
      setUploadProgress(35);
    }

    if (audioFile) {
      const audioPath = `${user.id}/${releaseId}/${trackId}.${audioFile.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(audioPath, audioFile, { upsert: true });

      if (uploadError) {
        setError("Failed to upload audio file. Please try again.");
        return;
      }
      audioUrl = audioPath;
      setUploadProgress(55);
    }

    const releasePayload = {
      id: releaseId,
      user_id: user.id,
      title: data.title,
      album: data.album || null,
      genre: data.genre,
      release_date: data.releaseDate,
      artwork_url: artworkUrl,
      upc: data.upc || null,
      status: "draft" as const,
      updated_at: new Date().toISOString(),
    };

    if (editReleaseId) {
      const { error: updateError } = await supabase
        .from("releases")
        .update(releasePayload)
        .eq("id", editReleaseId);

      if (updateError) {
        setError("Failed to update release. Please try again.");
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("releases").insert(releasePayload);
      if (insertError) {
        setError("Failed to create release. Please try again.");
        return;
      }
    }

    setUploadProgress(75);

    let existingAudioUrl: string | null = null;
    let existingAudioFormat: "wav" | "flac" | "mp3" | null = null;

    if (editReleaseId && !audioFile) {
      const { data: existingTracks } = await supabase
        .from("tracks")
        .select("audio_url, audio_format")
        .eq("release_id", editReleaseId)
        .limit(1);

      if (existingTracks?.[0]) {
        existingAudioUrl = existingTracks[0].audio_url;
        existingAudioFormat = existingTracks[0].audio_format;
      }
    }

    const trackPayload = {
      release_id: releaseId,
      user_id: user.id,
      title: data.title,
      artist_name: data.artistName,
      featuring_artists: data.featuringArtists?.length ? data.featuringArtists : null,
      track_number: 1,
      audio_url: audioUrl ?? existingAudioUrl,
      audio_format: audioFile ? getAudioFormat(audioFile.name) : existingAudioFormat,
      isrc: data.isrc || null,
      is_explicit: data.isExplicit,
      updated_at: new Date().toISOString(),
    };

    if (editReleaseId) {
      const { data: existingTracks } = await supabase
        .from("tracks")
        .select("id")
        .eq("release_id", editReleaseId)
        .limit(1);

      if (existingTracks?.[0]) {
        await supabase.from("tracks").update(trackPayload).eq("id", existingTracks[0].id);
      } else {
        await supabase.from("tracks").insert({ ...trackPayload, id: trackId });
      }
    } else {
      await supabase.from("tracks").insert({ ...trackPayload, id: trackId });
    }

    setUploadProgress(100);
    setSuccess(true);

    setTimeout(() => {
      router.push("/dashboard/releases");
      router.refresh();
    }, 1500);
  }

  if (loadingDraft) {
    return (
      <Card glass>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-ascend-purple" />
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card glass>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-lg font-semibold">Upload saved as draft</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Redirecting to your releases...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="h-4 w-4 text-ascend-purple" />
              Audio File
            </CardTitle>
            <CardDescription>WAV, FLAC, or MP3</CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="audio-upload"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-8 cursor-pointer transition-colors hover:border-ascend-purple/50 hover:bg-white/[0.02]",
                audioFile && "border-ascend-purple/30 bg-ascend-purple/5"
              )}
            >
              <input
                id="audio-upload"
                type="file"
                accept={ACCEPTED_AUDIO_FORMATS.join(",")}
                className="sr-only"
                onChange={handleAudioChange}
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-3" />
              {audioFile ? (
                <>
                  <p className="font-medium text-sm">{audioFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-sm">Drop your audio file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </>
              )}
            </label>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-ascend-blue" />
              Artwork
            </CardTitle>
            <CardDescription>JPG or PNG, minimum 3000×3000 px</CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="artwork-upload"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-8 cursor-pointer transition-colors hover:border-ascend-blue/50 hover:bg-white/[0.02]",
                artworkPreview && "border-ascend-blue/30"
              )}
            >
              <input
                id="artwork-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="sr-only"
                onChange={handleArtworkChange}
              />
              {artworkPreview ? (
                <div className="relative h-32 w-32 rounded-lg overflow-hidden">
                  <Image src={artworkPreview} alt="Artwork preview" fill className="object-cover" />
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="font-medium text-sm">Upload cover art</p>
                  <p className="text-xs text-muted-foreground mt-1">3000×3000 minimum</p>
                </>
              )}
            </label>
          </CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="text-base">Release Metadata</CardTitle>
          <CardDescription>Information displayed on streaming platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Track title" {...register("title")} />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistName">Artist *</Label>
              <Input id="artistName" placeholder="Primary artist" {...register("artistName")} />
              {errors.artistName && (
                <p className="text-xs text-red-400">{errors.artistName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input id="album" placeholder="Album name (optional)" {...register("album")} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Featuring</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add featured artist"
                  value={featuringInput}
                  onChange={(e) => setFeaturingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeaturingArtist();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addFeaturingArtist}>
                  Add
                </Button>
              </div>
              {featuringArtists.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {featuringArtists.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeFeaturingArtist(name)}
                        className="hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Genre *</Label>
              <Select
                value={selectedGenre}
                onValueChange={(v) => setValue("genre", v as ReleaseMetadataInput["genre"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genre && <p className="text-xs text-red-400">{errors.genre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date *</Label>
              <Input id="releaseDate" type="date" {...register("releaseDate")} />
              {errors.releaseDate && (
                <p className="text-xs text-red-400">{errors.releaseDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upc">UPC</Label>
              <Input id="upc" placeholder="Optional UPC code" {...register("upc")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isrc">ISRC</Label>
              <Input id="isrc" placeholder="Optional ISRC code" {...register("isrc")} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] p-4 sm:col-span-2">
              <div>
                <Label htmlFor="explicit">Explicit Content</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mark if this release contains explicit lyrics
                </p>
              </div>
              <Switch
                id="explicit"
                checked={isExplicit}
                onCheckedChange={(v) => setValue("isExplicit", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isSubmitting && uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-400/10 border border-red-400/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : editReleaseId ? (
            "Update Draft"
          ) : (
            "Save as Draft"
          )}
        </Button>
      </div>
    </form>
  );
}
