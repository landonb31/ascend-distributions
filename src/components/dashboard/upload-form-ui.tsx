"use client";

import Image from "next/image";
import {
  Check,
  Disc3,
  FileAudio,
  Globe,
  ImageIcon,
  Lightbulb,
  Music2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UPLOAD_STORES } from "@/lib/constants/upload";
import { cn } from "@/lib/utils";

export const UPLOAD_STEPS = [
  { id: 0, label: "Your music" },
  { id: 1, label: "Details" },
  { id: 2, label: "Stores" },
  { id: 3, label: "Review" },
] as const;

export function UploadStepNav({
  current,
  onStepClick,
}: {
  current: number;
  onStepClick?: (step: number) => void;
}) {
  const progress = ((current + 1) / UPLOAD_STEPS.length) * 100;

  return (
    <nav aria-label="Upload progress" className="mb-10">
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ascend-purple via-ascend-blue to-ascend-cyan transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
        {UPLOAD_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const clickable = onStepClick && index < current;

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(index)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-300",
                  active &&
                    "border-ascend-purple/40 bg-gradient-to-br from-ascend-purple/15 to-ascend-blue/5 shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)]",
                  done &&
                    "border-green-400/25 bg-green-400/[0.06] hover:border-green-400/40",
                  !done &&
                    !active &&
                    "border-white/[0.08] bg-white/[0.02]",
                  clickable && "cursor-pointer",
                  !clickable && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                    done && "border-green-400/40 bg-green-400/15 text-green-400",
                    active &&
                      "border-ascend-purple bg-ascend-purple/25 text-ascend-purple shadow-[0_0_20px_-4px_rgba(139,92,246,0.8)]",
                    !done && !active && "border-white/10 bg-white/[0.03] text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium transition-colors",
                      active ? "text-foreground" : "text-muted-foreground",
                      done && "text-green-300/90"
                    )}
                  >
                    {step.label}
                  </span>
                  {active && (
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-ascend-purple/80">
                      In progress
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StepPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card glass className="relative overflow-hidden border-white/10 upload-card-glow">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ascend-purple/60 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-ascend-purple/10 blur-3xl" />

      <CardHeader className="relative space-y-2 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ascend-purple/80">
          <Sparkles className="h-3.5 w-3.5" />
          Step
        </div>
        <CardTitle className="text-xl sm:text-2xl tracking-tight">
          <span className="gradient-text">{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="relative space-y-8 pt-4">{children}</CardContent>
    </Card>
  );
}

export function FieldGroup({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-ascend-purple ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function YesNoChoice({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-w-[4.5rem]",
          !value ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {noLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-w-[4.5rem]",
          value ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {yesLabel}
      </button>
    </div>
  );
}

export function ChoicePills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-ascend-purple/50 bg-ascend-purple/15 text-foreground"
              : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FileDropzone({
  id,
  accept,
  onChange,
  icon: _Icon = FileAudio,
  title,
  subtitle,
  fileName,
  preview,
  accent = "purple",
}: {
  id: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  fileName?: string | null;
  preview?: React.ReactNode;
  accent?: "purple" | "blue";
}) {
  const hasFile = Boolean(fileName || preview);
  const accentRing =
    accent === "blue"
      ? "hover:border-ascend-blue/60 border-ascend-blue/40 shadow-[0_0_40px_-12px_rgba(59,130,246,0.5)]"
      : "hover:border-ascend-purple/60 border-ascend-purple/40 shadow-[0_0_40px_-12px_rgba(139,92,246,0.5)]";
  const IconComponent = accent === "blue" ? ImageIcon : FileAudio;

  return (
    <label
      htmlFor={id}
      className={cn(
        "group relative flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300",
        "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:scale-[1.01] upload-dropzone-glow",
        hasFile && accentRing
      )}
    >
      <input id={id} type="file" accept={accept} className="sr-only" onChange={onChange} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-ascend-purple/5 via-transparent to-ascend-cyan/5" />
      </div>

      {preview ? (
        <div className="relative z-10">{preview}</div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={cn(
              "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300",
              hasFile
                ? "border-green-400/30 bg-green-400/10 text-green-400"
                : "border-white/10 bg-white/[0.04] text-muted-foreground group-hover:border-ascend-purple/30 group-hover:text-ascend-purple"
            )}
          >
            {hasFile ? <Check className="h-7 w-7" /> : <IconComponent className="h-7 w-7" />}
          </div>
          <p className="font-semibold text-center">{fileName || title}</p>
          {!fileName && (
            <p className="mt-1.5 max-w-[240px] text-center text-xs text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
          {!hasFile && (
            <span className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors group-hover:border-ascend-purple/30 group-hover:text-ascend-purple">
              Click or drop
            </span>
          )}
        </div>
      )}
    </label>
  );
}

export function InlineTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl border border-ascend-purple/15 bg-ascend-purple/5 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
      <Lightbulb className="h-4 w-4 shrink-0 text-ascend-purple" />
      <span>{children}</span>
    </div>
  );
}

export function CheckRow({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors",
        checked
          ? "border-ascend-purple/30 bg-ascend-purple/5"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded accent-ascend-purple"
      />
      <span className="text-sm leading-relaxed">{label}</span>
    </label>
  );
}

export function StoreGrid({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string, enabled: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {UPLOAD_STORES.map((store) => {
        const checked = selectedIds.includes(store.id);
        return (
          <label
            key={store.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3.5 py-3 cursor-pointer transition-colors",
              checked
                ? "border-ascend-purple/35 bg-ascend-purple/8"
                : "border-white/[0.08] hover:border-white/15"
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onToggle(store.id, e.target.checked)}
              className="h-4 w-4 rounded accent-ascend-purple"
            />
            <span className="text-sm">{store.name}</span>
          </label>
        );
      })}
    </div>
  );
}

export function AllStoresToggle({
  enabled,
  onChange,
  storeCount,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  storeCount: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        "w-full rounded-2xl border p-5 text-left transition-all",
        enabled
          ? "border-ascend-purple/40 bg-gradient-to-br from-ascend-purple/15 to-ascend-blue/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            enabled ? "bg-ascend-purple/25 text-ascend-purple" : "bg-white/5 text-muted-foreground"
          )}
        >
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-base">Release to all major stores</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Spotify, Apple Music, TikTok, YouTube, Amazon, and {storeCount - 5}+ more — recommended
            for most artists.
          </p>
        </div>
        <div
          className={cn(
            "ml-auto mt-1 h-6 w-11 shrink-0 rounded-full transition-colors relative",
            enabled ? "bg-ascend-purple" : "bg-white/15"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </div>
      </div>
    </button>
  );
}

export function ReleaseSummaryCard({
  trackPreview,
  artistName,
  releaseDateLabel,
  storeCount,
  artworkPreview,
  genre,
  trackCount = 1,
  trackTitles = [],
  releaseTitle,
}: {
  trackPreview: string;
  artistName: string;
  releaseDateLabel: string;
  storeCount: number;
  artworkPreview: string | null;
  genre?: string;
  trackCount?: number;
  trackTitles?: string[];
  releaseTitle?: string;
}) {
  const releaseType = trackCount <= 1 ? "Single" : trackCount <= 6 ? "EP" : "Album";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 space-y-4 upload-card-glow">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ascend-purple/15 blur-2xl" />

      <div className="relative flex items-center gap-2 text-sm font-medium text-ascend-purple">
        <Music2 className="h-4 w-4" />
        Release preview
      </div>

      <div className="relative flex gap-5">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-2xl vinyl-ring opacity-60 blur-sm animate-spin-slow" />
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-lg shadow-black/40">
            {artworkPreview ? (
              <Image src={artworkPreview} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc3 className="h-8 w-8 text-muted-foreground animate-spin-slow" />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="text-lg font-bold truncate">
            {trackCount > 1 ? releaseTitle || "Release title" : trackPreview || "Song title"}
          </p>
          <p className="text-sm text-muted-foreground truncate">{artistName || "Artist"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-ascend-purple/25 bg-ascend-purple/10 px-2.5 py-0.5 text-[11px] font-semibold text-ascend-purple">
              {releaseType}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground">
              {trackCount} track{trackCount === 1 ? "" : "s"}
            </span>
            {genre && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {genre}
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground">
              {releaseDateLabel}
            </span>
          </div>
        </div>
      </div>

      {trackCount > 1 && trackTitles.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Track list</p>
          {trackTitles.map((t, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              <span className="truncate">{t || `Track ${i + 1}`}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5 text-ascend-cyan" />
        {storeCount} stores locked in
      </div>
    </div>
  );
}

export function OptionalAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Accordion type="single" collapsible className="rounded-2xl border border-white/10 px-4">
      <AccordionItem value="optional" className="border-0">
        <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
          {title}
        </AccordionTrigger>
        <AccordionContent className="space-y-6 pb-4">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function TagList({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (item: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"
        >
          {name}
          <button type="button" onClick={() => onRemove(name)} className="text-muted-foreground hover:text-foreground">
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
