"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AllStoresToggle,
  CheckRow,
  ChoicePills,
  FieldGroup,
  FileDropzone,
  InlineTip,
  OptionalAccordion,
  ReleaseSummaryCard,
  StepPanel,
  StoreGrid,
  TagList,
  UploadStepNav,
  YesNoChoice,
} from "@/components/dashboard/upload-form-ui";
import { WaveformBars } from "@/components/dashboard/waveform-bars";
import { createClient } from "@/lib/supabase/client";
import {
  buildTrackTitlePreview,
  DEFAULT_SELECTED_STORES,
  getReleaseTypeHint,
  getReleaseTypeLabel,
  getTrackCountLabel,
  LEGAL_CHECKBOXES,
  LANGUAGES,
  MAX_TRACK_COUNT,
  UPLOAD_STORES,
} from "@/lib/constants/upload";
import {
  releaseDistributionSchema,
  releaseMetadataSchema,
  type ReleaseMetadataInput,
} from "@/lib/validations";
import type { ReleaseWithTracks } from "@/types";
import {
  ACCEPTED_AUDIO_FORMATS,
  ACCEPTED_AUDIO_LABEL,
  ACCEPTED_AUDIO_SUBTITLE,
  GENRES,
  getAudioFormatFromFilename,
  isAcceptedAudioExtension,
  type AudioFormat,
} from "@/lib/utils";

interface UploadFormProps {
  defaultArtistName?: string;
  editReleaseId?: string;
  artistHasSpotify?: boolean;
  artistHasApple?: boolean;
}

function getAudioFormat(filename: string): AudioFormat | null {
  return getAudioFormatFromFilename(filename);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

type TrackDraft = {
  clientId: string;
  dbId?: string;
  title: string;
  audioFile: File | null;
  existingAudioUrl?: string | null;
  existingAudioFormat?: AudioFormat | null;
};

function createTrackDraft(partial?: Partial<TrackDraft>): TrackDraft {
  return {
    clientId: crypto.randomUUID(),
    title: "",
    audioFile: null,
    ...partial,
  };
}

export function UploadForm({
  defaultArtistName = "",
  editReleaseId,
  artistHasSpotify = false,
  artistHasApple = false,
}: UploadFormProps) {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackDraft[]>([createTrackDraft()]);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [featuringInput, setFeaturingInput] = useState("");
  const [songwriterInput, setSongwriterInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<"draft" | "released">("draft");
  const [loadingDraft, setLoadingDraft] = useState(!!editReleaseId);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

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
      trackCount: 1,
      artistName: defaultArtistName,
      featuringArtists: [],
      songwriterNames: [],
      album: "",
      genre: undefined,
      secondaryGenre: "",
      releaseDate: todayIsoDate(),
      releaseTiming: "asap",
      language: "en",
      recordLabel: defaultArtistName,
      previouslyReleased: false,
      selectedPlatforms: [...DEFAULT_SELECTED_STORES],
      isExplicit: false,
      upc: "",
      isrc: "",
      hasExistingIsrc: false,
      showFeaturedInTitle: false,
      versionType: "normal",
      versionInfo: "",
      isCoverSong: false,
      isInstrumental: false,
      usesAi: false,
      previewStart: "auto",
      socialMonetization: false,
      artistOnSpotify: artistHasSpotify,
      artistOnApple: artistHasApple,
      artistOnYoutube: true,
      artistOnInstagram: true,
      artistOnFacebook: true,
      confirmAuthorized: false,
      confirmNoUnauthorizedArtists: false,
      confirmNoPromoServices: false,
      confirmTerms: false,
      confirmYoutube: false,
    },
  });

  const watched = watch();
  const trackCount = Math.min(MAX_TRACK_COUNT, Math.max(1, Number(watched.trackCount) || 1));
  const featuringArtists = watched.featuringArtists || [];
  const songwriterNames = watched.songwriterNames || [];
  const selectedPlatforms = watched.selectedPlatforms || [];

  const trackPreview = useMemo(() => {
    const primaryTitle =
      trackCount === 1 ? watched.title : tracks[0]?.title || watched.title;
    return buildTrackTitlePreview({
      title: primaryTitle,
      featuringArtists,
      showFeaturedInTitle: watched.showFeaturedInTitle,
      versionType: watched.versionType,
      versionInfo: watched.versionInfo,
    });
  }, [
    trackCount,
    watched.title,
    tracks,
    featuringArtists,
    watched.showFeaturedInTitle,
    watched.versionType,
    watched.versionInfo,
  ]);

  const trackTitles = tracks.slice(0, trackCount).map((t) => t.title);

  const releaseDateLabel =
    watched.releaseTiming === "asap" ? "ASAP" : watched.releaseDate || "Pick a date";

  const hasYoutube = selectedPlatforms.includes("youtube_music");
  const allStoresEnabled =
    selectedPlatforms.length === DEFAULT_SELECTED_STORES.length;

  function setTrackCount(count: number) {
    const next = Math.min(MAX_TRACK_COUNT, Math.max(1, count));
    setValue("trackCount", next, { shouldValidate: true });
    setTracks((prev) => {
      if (prev.length === next) return prev;
      if (prev.length < next) {
        return [
          ...prev,
          ...Array.from({ length: next - prev.length }, () => createTrackDraft()),
        ];
      }
      return prev.slice(0, next);
    });
  }

  function updateTrack(index: number, patch: Partial<TrackDraft>) {
    setTracks((prev) =>
      prev.map((track, i) => (i === index ? { ...track, ...patch } : track))
    );
  }

  function validateStep(targetStep: number): string | null {
    if (targetStep >= 1) {
      if (!watched.artistName?.trim()) return "Enter your artist name.";
      if (!editReleaseId && !artworkFile && !artworkPreview) return "Upload your cover art.";

      if (trackCount === 1) {
        if (!watched.title?.trim()) return "Enter your song title.";
        const track = tracks[0];
        if (!editReleaseId && !track?.audioFile && !track?.existingAudioUrl) {
          return "Upload your audio file.";
        }
      } else {
        if (!watched.title?.trim()) return "Enter your release / album title.";
        for (let i = 0; i < trackCount; i++) {
          const track = tracks[i];
          if (!track?.title?.trim()) return `Enter a title for track ${i + 1}.`;
          if (!editReleaseId && !track?.audioFile && !track?.existingAudioUrl) {
            return `Upload audio for track ${i + 1}.`;
          }
        }
      }
    }
    if (targetStep >= 2) {
      if (!watched.genre) return "Select a primary genre.";
      if (!watched.language) return "Select a language.";
      if (watched.releaseTiming === "scheduled" && !watched.releaseDate) {
        return "Pick a release date.";
      }
    }
    if (targetStep >= 3) {
      if (selectedPlatforms.length === 0) return "Select at least one store.";
    }
    if (targetStep >= 4) {
      if (!watched.isCoverSong && songwriterNames.length === 0) {
        return "Add at least one songwriter legal name.";
      }
    }
    return null;
  }

  function goNext() {
    const err = validateStep(step + 1);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setAllStores(enabled: boolean) {
    setValue("selectedPlatforms", enabled ? [...DEFAULT_SELECTED_STORES] : ["spotify", "apple_music", "youtube_music"]);
  }

  useEffect(() => {
    if (!editReleaseId) return;
    const releaseId: string = editReleaseId;

    async function loadDraft() {
      const supabase = createClient();
      const { data: releaseData } = await supabase
        .from("releases")
        .select("*, tracks(*)")
        .eq("id", releaseId)
        .single();

      const release = releaseData as ReleaseWithTracks | null;
      if (!release || release.status !== "draft") {
        setLoadingDraft(false);
        setError("Release not found or cannot be edited.");
        return;
      }

      const meta = (release.metadata || {}) as Record<string, unknown>;
      const sortedTracks = [...(release.tracks || [])].sort(
        (a, b) => a.track_number - b.track_number
      );
      const count = Math.max(1, sortedTracks.length || Number(meta.trackCount) || 1);
      const primary = sortedTracks[0];
      const trackMeta = (primary?.metadata || {}) as Record<string, unknown>;

      setTracks(
        Array.from({ length: count }, (_, i) => {
          const existing = sortedTracks[i];
          return createTrackDraft({
            dbId: existing?.id,
            title: existing?.title || "",
            existingAudioUrl: existing?.audio_url,
            existingAudioFormat: existing?.audio_format,
          });
        })
      );

      reset({
        title: count === 1 ? primary?.title || release.title : release.title,
        trackCount: count,
        artistName: primary?.artist_name || defaultArtistName,
        featuringArtists: primary?.featuring_artists || [],
        songwriterNames: (trackMeta.songwriterNames as string[]) || [],
        album: release.album || "",
        genre: (release.genre as ReleaseMetadataInput["genre"]) || undefined,
        secondaryGenre: (meta.secondaryGenre as string) || "",
        releaseDate: release.release_date || todayIsoDate(),
        releaseTiming: (meta.releaseTiming as ReleaseMetadataInput["releaseTiming"]) || "asap",
        language: (meta.language as string) || "en",
        recordLabel: (meta.recordLabel as string) || defaultArtistName,
        previouslyReleased: Boolean(meta.previouslyReleased),
        selectedPlatforms:
          (meta.selectedPlatforms as string[]) || [...DEFAULT_SELECTED_STORES],
        isExplicit: primary?.is_explicit || false,
        upc: release.upc || "",
        isrc: primary?.isrc || "",
        hasExistingIsrc: Boolean(primary?.isrc),
        showFeaturedInTitle: Boolean(trackMeta.showFeaturedInTitle),
        versionType: (trackMeta.versionType as ReleaseMetadataInput["versionType"]) || "normal",
        versionInfo: (trackMeta.versionInfo as string) || "",
        isCoverSong: Boolean(trackMeta.isCoverSong),
        isInstrumental: Boolean(trackMeta.isInstrumental),
        usesAi: Boolean(trackMeta.usesAi),
        previewStart: (trackMeta.previewStart as ReleaseMetadataInput["previewStart"]) || "auto",
        socialMonetization: Boolean(meta.socialMonetization),
      });

      if (release.artwork_url) setArtworkPreview(release.artwork_url);
      setLoadingDraft(false);
    }

    loadDraft();
  }, [editReleaseId, defaultArtistName, reset]);

  const togglePlatform = useCallback(
    (id: string, enabled: boolean) => {
      const next = enabled
        ? [...new Set([...selectedPlatforms, id])]
        : selectedPlatforms.filter((p) => p !== id);
      setValue("selectedPlatforms", next, { shouldValidate: true });
    },
    [selectedPlatforms, setValue]
  );

  const handleTrackAudioChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAcceptedAudioExtension(file.name)) {
      setError(`Please upload a ${ACCEPTED_AUDIO_LABEL} file.`);
      return;
    }
    setError(null);
    updateTrack(index, { audioFile: file });
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
    img.src = objectUrl;
  }, []);

  function addFeaturingArtist() {
    const name = featuringInput.trim();
    if (!name || featuringArtists.includes(name)) return;
    setValue("featuringArtists", [...featuringArtists, name]);
    setFeaturingInput("");
  }

  function addSongwriter() {
    const name = songwriterInput.trim();
    if (!name || songwriterNames.includes(name)) return;
    setValue("songwriterNames", [...songwriterNames, name]);
    setSongwriterInput("");
  }

  async function uploadFile(
    supabase: ReturnType<typeof createClient>,
    bucket: string,
    path: string,
    file: File
  ) {
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (uploadError) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(data: ReleaseMetadataInput, distribute = false) {
    setError(null);
    setUploadProgress(0);

    if (distribute) {
      const legal = releaseDistributionSchema.safeParse(data);
      if (!legal.success) {
        setError(legal.error.errors[0]?.message || "Complete all required fields.");
        return;
      }
    }

    const count = Math.min(MAX_TRACK_COUNT, Math.max(1, Number(data.trackCount) || 1));
    const activeTracks = tracks.slice(0, count);

    if (!editReleaseId && !artworkFile && !artworkPreview) {
      setError("Please upload artwork (3000×3000 minimum).");
      return;
    }

    for (let i = 0; i < count; i++) {
      const track = activeTracks[i];
      if (!editReleaseId && !track?.audioFile && !track?.existingAudioUrl) {
        setError(count === 1 ? "Please upload an audio file." : `Please upload audio for track ${i + 1}.`);
        return;
      }
      if (count > 1 && !track?.title?.trim()) {
        setError(`Enter a title for track ${i + 1}.`);
        return;
      }
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
    const releaseId = editReleaseId || crypto.randomUUID();
    let artworkUrl: string | null = artworkPreview;

    if (artworkFile) {
      const artworkPath = `${user.id}/${releaseId}/cover.${artworkFile.name.split(".").pop()}`;
      artworkUrl = await uploadFile(supabase, "artwork", artworkPath, artworkFile);
      if (!artworkUrl) {
        setError("Failed to upload artwork.");
        return;
      }
      setUploadProgress(20);
    }

    const releaseDate =
      data.releaseTiming === "asap" ? todayIsoDate() : data.releaseDate || todayIsoDate();

    const releaseTitle = data.title;

    const releaseMetadata = {
      trackCount: count,
      selectedPlatforms: data.selectedPlatforms,
      previouslyReleased: data.previouslyReleased,
      recordLabel: data.recordLabel || data.artistName,
      language: data.language,
      secondaryGenre: data.secondaryGenre || null,
      releaseTiming: data.releaseTiming,
      socialMonetization: data.socialMonetization,
      platformProfiles: {
        spotify: data.artistOnSpotify,
        apple: data.artistOnApple,
        youtube: data.artistOnYoutube,
        instagram: data.artistOnInstagram,
        facebook: data.artistOnFacebook,
      },
    };

    const releasePayload = {
      id: releaseId,
      user_id: user.id,
      title: releaseTitle,
      album: count > 1 ? data.title : data.album || null,
      genre: data.genre,
      release_date: releaseDate,
      scheduled_date:
        data.releaseTiming === "scheduled" ? `${releaseDate}T00:00:00.000Z` : null,
      artwork_url: artworkUrl,
      upc: data.upc || null,
      metadata: releaseMetadata,
      status: "draft" as const,
      updated_at: new Date().toISOString(),
    };

    if (editReleaseId) {
      const { error: updateError } = await supabase
        .from("releases")
        .update(releasePayload)
        .eq("id", editReleaseId);
      if (updateError) {
        setError("Failed to update release.");
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("releases").insert(releasePayload);
      if (insertError) {
        setError("Failed to create release.");
        return;
      }
    }

    setUploadProgress(35);

    if (editReleaseId) {
      const keptIds = activeTracks.map((t) => t.dbId).filter(Boolean) as string[];
      const { data: existingTrackRows } = await supabase
        .from("tracks")
        .select("id")
        .eq("release_id", releaseId);
      const toDelete = (existingTrackRows || [])
        .map((row) => row.id)
        .filter((id) => !keptIds.includes(id));
      if (toDelete.length > 0) {
        await supabase.from("tracks").delete().in("id", toDelete);
      }
    }

    const trackMetadata = {
      showFeaturedInTitle: data.showFeaturedInTitle,
      versionType: data.versionType,
      versionInfo: data.versionInfo || null,
      isCoverSong: data.isCoverSong,
      songwriterNames: data.songwriterNames || [],
      isInstrumental: data.isInstrumental,
      usesAi: data.usesAi,
      previewStart: data.previewStart,
      previewStartSeconds: data.previewStartSeconds || null,
      displayTitle: trackPreview,
    };

    const progressPerTrack = 50 / Math.max(count, 1);

    for (let i = 0; i < count; i++) {
      const track = activeTracks[i];
      const trackId = track.dbId || crypto.randomUUID();
      let audioUrl: string | null = track.existingAudioUrl ?? null;
      let audioFormat: AudioFormat | null = track.existingAudioFormat ?? null;

      if (track.audioFile) {
        const audioPath = `${user.id}/${releaseId}/${trackId}.${track.audioFile.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("audio")
          .upload(audioPath, track.audioFile, { upsert: true });
        if (uploadError) {
          setError(`Failed to upload audio for track ${i + 1}.`);
          return;
        }
        audioUrl = audioPath;
        audioFormat = getAudioFormat(track.audioFile.name);
      }

      const trackTitle = count === 1 ? data.title : track.title.trim();
      const trackPayload = {
        release_id: releaseId,
        user_id: user.id,
        title: trackTitle,
        artist_name: data.artistName,
        featuring_artists: featuringArtists.length ? featuringArtists : null,
        track_number: i + 1,
        audio_url: audioUrl,
        audio_format: audioFormat,
        isrc: i === 0 && data.hasExistingIsrc ? data.isrc || null : null,
        is_explicit: data.isExplicit,
        metadata: trackMetadata,
        updated_at: new Date().toISOString(),
      };

      if (track.dbId) {
        await supabase.from("tracks").update(trackPayload).eq("id", track.dbId);
      } else {
        await supabase.from("tracks").insert({ ...trackPayload, id: trackId });
      }

      setUploadProgress(35 + Math.round((i + 1) * progressPerTrack));
    }

    setUploadProgress(90);

    if (distribute) {
      const distributeResponse = await fetch(`/api/releases/${releaseId}/submit`, {
        method: "POST",
      });
      const distributeResult = await distributeResponse.json().catch(() => ({}));
      if (!distributeResponse.ok) {
        setError(distributeResult.error || "Uploaded, but could not send to stores.");
        return;
      }
      if (distributeResult.warning) setError(distributeResult.warning);
    }

    setSuccessMode(distribute ? "released" : "draft");
    setSuccess(true);
    setUploadProgress(100);
    setTimeout(() => {
      router.push("/dashboard/releases");
      router.refresh();
    }, 2000);
  }

  if (loadingDraft) {
    return (
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] py-24 upload-card-glow">
        <div className="pointer-events-none absolute inset-0 upload-aurora opacity-50" />
        <div className="relative flex flex-col items-center justify-center gap-6 px-6 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-ascend-purple" />
          <div>
            <p className="font-semibold">Loading your release</p>
            <p className="mt-1 text-sm text-muted-foreground">Pulling up your draft…</p>
          </div>
          <WaveformBars className="h-12 w-48" animated />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] py-24 upload-card-glow animate-step-in">
        <div className="pointer-events-none absolute inset-0 upload-aurora" />
        <div className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-green-400/15 blur-3xl animate-glow-pulse" />

        <div className="relative flex flex-col items-center justify-center px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-green-400/20 blur-xl animate-glow-pulse" />
            <CheckCircle2 className="relative h-16 w-16 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold">
            {successMode === "released" ? (
              <>
                Sent to stores <span className="gradient-text">live</span>
              </>
            ) : (
              "Saved as draft"
            )}
          </h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            {successMode === "released"
              ? "Your release is on its way to every store you selected. Time to celebrate."
              : "Finish anytime and hit Release to Stores when you're ready to go live."}
          </p>
          {successMode === "released" && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-ascend-purple/30 bg-ascend-purple/10 px-4 py-2 text-xs font-medium text-ascend-purple">
              <Rocket className="h-3.5 w-3.5" />
              Distribution in progress
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="pointer-events-none absolute -inset-x-4 top-0 h-full upload-aurora opacity-30" />

      <div className="relative">
        <UploadStepNav current={step} onStepClick={setStep} />

      <form onSubmit={handleSubmit((data) => onSubmit(data, true))} className="space-y-6">
        <div key={step} className="animate-step-in">
        {step === 0 && (
          <StepPanel
            title="Your music"
            description="Choose how many songs you're releasing, then add your files and titles."
          >
            <FieldGroup
              label="Number of songs"
              hint={getReleaseTypeHint(trackCount)}
            >
              <Select
                value={String(trackCount)}
                onValueChange={(v) => setTrackCount(Number(v))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: MAX_TRACK_COUNT }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {getTrackCountLabel(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-ascend-purple/25 bg-ascend-purple/10 px-3 py-1 text-sm font-semibold text-ascend-purple">
                {getReleaseTypeLabel(trackCount)}
              </p>
            </FieldGroup>

            <FieldGroup label="Cover art" required error={stepError?.includes("cover") ? stepError : undefined}>
              <FileDropzone
                id="artwork-upload"
                accept="image/jpeg,image/png"
                onChange={handleArtworkChange}
                title="Drop artwork here"
                subtitle="3000×3000 JPG or PNG"
                accent="blue"
                preview={
                  artworkPreview ? (
                    <div className="relative h-36 w-36 rounded-xl overflow-hidden">
                      <Image src={artworkPreview} alt="Cover" fill className="object-cover" />
                    </div>
                  ) : undefined
                }
              />
            </FieldGroup>

            {trackCount === 1 ? (
              <>
                <FieldGroup
                  label="Song title"
                  htmlFor="title"
                  required
                  hint="No featured artists or years in the title."
                  error={errors.title?.message}
                >
                  <Input id="title" className="h-11 text-base" placeholder="e.g. Midnight Drive" {...register("title")} />
                </FieldGroup>

                <FieldGroup label="Upload your audio file" required error={stepError?.includes("audio") ? stepError : undefined}>
                  <FileDropzone
                    id="audio-upload-0"
                    accept={ACCEPTED_AUDIO_FORMATS.join(",")}
                    onChange={(e) => handleTrackAudioChange(0, e)}
                    title="Drop audio here"
                    subtitle={ACCEPTED_AUDIO_SUBTITLE}
                    fileName={tracks[0]?.audioFile?.name}
                    accent="purple"
                  />
                </FieldGroup>
              </>
            ) : (
              <>
                <FieldGroup
                  label="Release title"
                  htmlFor="title"
                  required
                  hint="Album or EP name — not individual track titles."
                  error={errors.title?.message}
                >
                  <Input id="title" className="h-11 text-base" placeholder="e.g. Night Sessions" {...register("title")} />
                </FieldGroup>

                <div className="space-y-4">
                  {tracks.slice(0, trackCount).map((track, index) => (
                    <div
                      key={track.clientId}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 space-y-4 transition-colors hover:border-ascend-purple/20"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ascend-purple/15 text-xs text-ascend-purple">
                          {index + 1}
                        </span>
                        Track {index + 1}
                      </p>
                      <FieldGroup
                        label="Track title"
                        required
                        error={stepError?.includes(`track ${index + 1}`) ? stepError : undefined}
                      >
                        <Input
                          className="h-11"
                          placeholder={`Track ${index + 1} title`}
                          value={track.title}
                          onChange={(e) => updateTrack(index, { title: e.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup
                        label="Upload your audio file"
                        required
                        error={stepError?.includes(`track ${index + 1}`) ? stepError : undefined}
                      >
                        <FileDropzone
                          id={`audio-upload-${index}`}
                          accept={ACCEPTED_AUDIO_FORMATS.join(",")}
                          onChange={(e) => handleTrackAudioChange(index, e)}
                          title="Drop audio here"
                          subtitle={ACCEPTED_AUDIO_SUBTITLE}
                          fileName={track.audioFile?.name}
                          accent="purple"
                        />
                      </FieldGroup>
                    </div>
                  ))}
                </div>
              </>
            )}

            <FieldGroup
              label="Artist name"
              htmlFor="artistName"
              required
              hint="Stage or band name only — no emojis or other artists."
              error={errors.artistName?.message}
            >
              <Input
                id="artistName"
                className="h-11 text-base"
                placeholder="e.g. iiheartvisa"
                {...register("artistName")}
              />
            </FieldGroup>

            {(artistHasSpotify || artistHasApple) && (
              <InlineTip>
                Your existing Spotify / Apple Music profile will be used for this release.
              </InlineTip>
            )}
          </StepPanel>
        )}

        {step === 1 && (
          <StepPanel
            title="Release details"
            description={`Tell stores when and how to list your ${getReleaseTypeLabel(trackCount).toLowerCase()}.`}
          >
            <FieldGroup label="Primary genre" required error={errors.genre?.message}>
              <Select
                value={watched.genre}
                onValueChange={(v) => setValue("genre", v as ReleaseMetadataInput["genre"])}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FieldGroup label="Language">
                <Select value={watched.language} onValueChange={(v) => setValue("language", v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup label="Record label" hint="Defaults to your artist name.">
                <Input className="h-11" placeholder="Label name" {...register("recordLabel")} />
              </FieldGroup>
            </div>

            <FieldGroup label="When should it go live?">
              <ChoicePills
                value={watched.releaseTiming}
                onChange={(v) => setValue("releaseTiming", v)}
                options={[
                  { value: "asap", label: "ASAP" },
                  { value: "scheduled", label: "Pick a date" },
                ]}
              />
              {watched.releaseTiming === "scheduled" && (
                <Input type="date" className="h-11 mt-3 max-w-xs" {...register("releaseDate")} />
              )}
            </FieldGroup>

            <FieldGroup label="Previously released?">
              <YesNoChoice
                value={watched.previouslyReleased}
                onChange={(v) => setValue("previouslyReleased", v)}
              />
            </FieldGroup>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel
            title="Choose stores"
            description="Most artists release everywhere. You can customize if needed."
          >
            <AllStoresToggle
              enabled={allStoresEnabled}
              onChange={setAllStores}
              storeCount={UPLOAD_STORES.length}
            />

            <OptionalAccordion title="Customize store list (optional)">
              <StoreGrid selectedIds={selectedPlatforms} onToggle={togglePlatform} />
            </OptionalAccordion>

            {errors.selectedPlatforms && (
              <p className="text-xs text-red-400">{errors.selectedPlatforms.message}</p>
            )}
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel
            title="Review & release"
            description="Confirm credits, check the summary, and send it live."
          >
            <ReleaseSummaryCard
              trackPreview={trackPreview}
              artistName={watched.artistName}
              releaseDateLabel={releaseDateLabel}
              storeCount={selectedPlatforms.length}
              artworkPreview={artworkPreview}
              genre={watched.genre}
              trackCount={trackCount}
              trackTitles={trackTitles}
              releaseTitle={trackCount > 1 ? watched.title : undefined}
            />

            <FieldGroup label="Is this a cover song?">
              <YesNoChoice
                value={watched.isCoverSong}
                onChange={(v) => setValue("isCoverSong", v)}
                noLabel="Original"
                yesLabel="Cover"
              />
            </FieldGroup>

            {!watched.isCoverSong && (
              <FieldGroup
                label="Songwriter legal name"
                required
                hint="Real name — we need this for original songs."
                error={errors.songwriterNames?.message || (stepError?.includes("songwriter") ? stepError : undefined)}
              >
                <div className="flex gap-2">
                  <Input
                    className="h-11"
                    placeholder="Full legal name"
                    value={songwriterInput}
                    onChange={(e) => setSongwriterInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSongwriter())}
                  />
                  <Button type="button" variant="secondary" className="shrink-0" onClick={addSongwriter}>
                    Add
                  </Button>
                </div>
                <TagList items={songwriterNames} onRemove={(name) => setValue("songwriterNames", songwriterNames.filter((n) => n !== name))} />
              </FieldGroup>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FieldGroup label="Explicit lyrics?">
                <YesNoChoice value={watched.isExplicit} onChange={(v) => setValue("isExplicit", v)} />
              </FieldGroup>
              <FieldGroup label="Instrumental?">
                <YesNoChoice
                  value={watched.isInstrumental}
                  onChange={(v) => setValue("isInstrumental", v)}
                  noLabel="Has lyrics"
                  yesLabel="Instrumental"
                />
              </FieldGroup>
            </div>

            <OptionalAccordion title="More options — featured artists, version, ISRC, AI">
              <FieldGroup label="Featured artists" hint="Add collaborators; optional in song title.">
                <div className="flex gap-2">
                  <Input
                    placeholder="Featured artist name"
                    value={featuringInput}
                    onChange={(e) => setFeaturingInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeaturingArtist())}
                  />
                  <Button type="button" variant="secondary" onClick={addFeaturingArtist}>
                    Add
                  </Button>
                </div>
                <TagList
                  items={featuringArtists}
                  onRemove={(name) =>
                    setValue("featuringArtists", featuringArtists.filter((a) => a !== name))
                  }
                />
              </FieldGroup>

              <FieldGroup label="Show featured artists in title?">
                <YesNoChoice
                  value={watched.showFeaturedInTitle}
                  onChange={(v) => setValue("showFeaturedInTitle", v)}
                />
              </FieldGroup>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                <span className="text-muted-foreground">Stores will show: </span>
                <span className="font-medium">{trackPreview}</span>
              </div>

              <FieldGroup label="Version">
                <ChoicePills
                  value={watched.versionType}
                  onChange={(v) => setValue("versionType", v)}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "radio_edit", label: "Radio edit" },
                    { value: "other", label: "Other" },
                  ]}
                />
                {watched.versionType === "other" && (
                  <Input className="mt-2" placeholder="e.g. Acoustic" {...register("versionInfo")} />
                )}
              </FieldGroup>

              <FieldGroup label="Have your own ISRC?">
                <YesNoChoice
                  value={watched.hasExistingIsrc}
                  onChange={(v) => setValue("hasExistingIsrc", v)}
                  noLabel="Assign for me"
                  yesLabel="I have one"
                />
                {watched.hasExistingIsrc && (
                  <Input className="mt-2" placeholder="ISRC code" {...register("isrc")} />
                )}
              </FieldGroup>

              <FieldGroup label="Uses AI-generated audio or lyrics?">
                <YesNoChoice value={watched.usesAi} onChange={(v) => setValue("usesAi", v)} />
              </FieldGroup>

              <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
                <div>
                  <p className="text-sm font-medium">Social media monetization</p>
                  <p className="text-xs text-muted-foreground mt-0.5">YouTube, TikTok, Instagram, Facebook</p>
                </div>
                <Switch
                  checked={watched.socialMonetization}
                  onCheckedChange={(v) => setValue("socialMonetization", v)}
                />
              </div>
            </OptionalAccordion>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium">Before you release</p>
              {LEGAL_CHECKBOXES.map((item) => (
                <CheckRow
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  checked={Boolean(watched[item.id as keyof ReleaseMetadataInput])}
                  onChange={(v) =>
                    setValue(item.id as keyof ReleaseMetadataInput, v as never, {
                      shouldValidate: true,
                    })
                  }
                />
              ))}
              {hasYoutube && (
                <CheckRow
                  id="confirmYoutube"
                  label="I understand my music will be delivered to YouTube Music."
                  checked={Boolean(watched.confirmYoutube)}
                  onChange={(v) => setValue("confirmYoutube", v)}
                />
              )}
            </div>
          </StepPanel>
        )}
        </div>

        {(stepError || error) && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400 animate-step-in">
            {stepError || error}
          </div>
        )}

        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <Progress value={uploadProgress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uploading your release</span>
              <span className="font-mono text-ascend-purple">{uploadProgress}%</span>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => (step === 0 ? router.back() : goBack())}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {step === 3 && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleSubmit((data) => onSubmit(data, false))}
              >
                Save as draft
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                size="lg"
                className="min-w-[140px] bg-gradient-to-r from-ascend-purple to-ascend-blue hover:opacity-90 shadow-[0_0_30px_-8px_rgba(139,92,246,0.6)]"
                onClick={goNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[180px] bg-gradient-to-r from-ascend-purple via-ascend-blue to-ascend-cyan hover:opacity-90 shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Releasing…
                  </>
                ) : (
                  "Release to stores"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
