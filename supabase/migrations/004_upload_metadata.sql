-- Extended release metadata for DistroKid-style upload flow

ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
