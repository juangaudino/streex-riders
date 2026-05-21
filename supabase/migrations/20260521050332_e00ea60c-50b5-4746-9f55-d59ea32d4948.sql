
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  pickup text NOT NULL,
  destination text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  passengers integer NOT NULL CHECK (passengers BETWEEN 1 AND 8),
  notes text,
  price numeric(10,2),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','quoted','confirmed','declined','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "MVP open read for booking flow"
  ON public.bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "MVP open update for booking flow"
  ON public.bookings FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "MVP open delete for moderation"
  ON public.bookings FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_bookings_status_created ON public.bookings(status, created_at DESC);
