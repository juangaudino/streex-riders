-- Lock down storage.objects for the public 'images' bucket.
-- Allow public reads (bucket is public), but restrict writes/updates/deletes to the service role only.

CREATE POLICY "Public can read images bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'images');

CREATE POLICY "Service role can insert into images bucket"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Service role can update images bucket"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Service role can delete from images bucket"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'images');
