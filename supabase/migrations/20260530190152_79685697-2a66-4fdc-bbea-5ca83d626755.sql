-- Lock down admin tables
DROP POLICY IF EXISTS "MVP open read for booking flow" ON public.bookings;
DROP POLICY IF EXISTS "MVP open update for booking flow" ON public.bookings;
DROP POLICY IF EXISTS "MVP open delete for moderation" ON public.bookings;

DROP POLICY IF EXISTS "MVP open read for moderation" ON public.reviews;
DROP POLICY IF EXISTS "MVP open update for moderation" ON public.reviews;
DROP POLICY IF EXISTS "MVP open delete for moderation" ON public.reviews;

DROP POLICY IF EXISTS "Anyone can submit a booking" ON public.bookings;
CREATE POLICY "Anyone can submit a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- App settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (key, value)
VALUES ('ticker_style', 'boarding')
ON CONFLICT (key) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (true);