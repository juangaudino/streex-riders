-- Lock down admin data now that admin pages use server functions with the
-- Supabase service role through Lovable/TanStack server runtime.

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

