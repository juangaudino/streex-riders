CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (key, value)
VALUES ('ticker_style', 'boarding')
ON CONFLICT (key) DO NOTHING;

CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

