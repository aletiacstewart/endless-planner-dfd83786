CREATE POLICY "Users view own journal photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users upload own journal photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users update own journal photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users delete own journal photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);