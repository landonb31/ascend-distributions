-- Expand accepted track audio formats
ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_audio_format_check;

ALTER TABLE tracks
  ADD CONSTRAINT tracks_audio_format_check
  CHECK (audio_format IN ('wav', 'mp3', 'm4a', 'flac', 'aiff', 'wma'));

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/flac',
  'audio/x-flac',
  'audio/aiff',
  'audio/x-aiff',
  'audio/x-ms-wma',
  'audio/wma',
  'video/x-ms-wma',
  'application/octet-stream'
]
WHERE id = 'audio';
