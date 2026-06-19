-- Storage buckets and policies for Ascend Distributions

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('audio', 'audio', false, 104857600, ARRAY[
    'audio/wav', 'audio/x-wav', 'audio/wave',
    'audio/mpeg', 'audio/mp3',
    'audio/mp4', 'audio/x-m4a', 'audio/m4a',
    'audio/flac', 'audio/x-flac',
    'audio/aiff', 'audio/x-aiff',
    'audio/x-ms-wma', 'audio/wma', 'video/x-ms-wma',
    'application/octet-stream'
  ]),
  ('artwork', 'artwork', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Audio bucket policies
CREATE POLICY "Users can upload own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artwork bucket policies
CREATE POLICY "Users can upload own artwork"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artwork' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artwork is publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artwork');

CREATE POLICY "Users can delete own artwork"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artwork' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket policies
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
