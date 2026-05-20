
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  location TEXT,
  status public.review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_status_created_at ON public.reviews (status, created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review
CREATE POLICY "Anyone can submit a review"
ON public.reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Anyone can read approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- MVP: open moderation read/update/delete for admin page (TODO: restrict before production)
CREATE POLICY "MVP open read for moderation"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "MVP open update for moderation"
ON public.reviews
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "MVP open delete for moderation"
ON public.reviews
FOR DELETE
TO anon, authenticated
USING (true);
