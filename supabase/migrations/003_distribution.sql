-- Distribution pipeline for store delivery (FUGA and future providers)

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'release_live';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'distribution_failed';

ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS external_product_id TEXT,
  ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMPTZ;

CREATE TYPE distribution_job_status AS ENUM (
  'pending',
  'processing',
  'delivered',
  'failed'
);

CREATE TYPE platform_delivery_status AS ENUM (
  'pending',
  'submitted',
  'processing',
  'live',
  'failed',
  'rejected'
);

CREATE TABLE public.distribution_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'fuga',
  status distribution_job_status NOT NULL DEFAULT 'pending',
  external_product_id TEXT,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  metadata JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.platform_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  distribution_job_id UUID REFERENCES public.distribution_jobs(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  external_dsp_id TEXT,
  status platform_delivery_status NOT NULL DEFAULT 'pending',
  live_url TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_distribution_jobs_release_id ON public.distribution_jobs(release_id);
CREATE INDEX idx_distribution_jobs_status ON public.distribution_jobs(status, created_at);
CREATE INDEX idx_platform_deliveries_release_id ON public.platform_deliveries(release_id);
CREATE INDEX idx_platform_deliveries_status ON public.platform_deliveries(status);
CREATE UNIQUE INDEX idx_platform_deliveries_release_platform
  ON public.platform_deliveries(release_id, platform);

CREATE TRIGGER distribution_jobs_updated_at
  BEFORE UPDATE ON public.distribution_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER platform_deliveries_updated_at
  BEFORE UPDATE ON public.platform_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.distribution_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own distribution jobs"
  ON public.distribution_jobs FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can view own platform deliveries"
  ON public.platform_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.releases r
      WHERE r.id = platform_deliveries.release_id
        AND (r.user_id = auth.uid() OR is_admin())
    )
  );

-- Service role / admin API routes handle inserts and updates.
