CREATE TABLE IF NOT EXISTS public.runner_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  score integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT runner_scores_name_length CHECK (char_length(trim(name)) BETWEEN 1 AND 24),
  CONSTRAINT runner_scores_score_range CHECK (score >= 0 AND score <= 999999),
  CONSTRAINT runner_scores_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

GRANT SELECT ON public.runner_scores TO anon, authenticated;
GRANT ALL ON public.runner_scores TO service_role;

ALTER TABLE public.runner_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved runner scores" ON public.runner_scores;
CREATE POLICY "Public can read approved runner scores"
ON public.runner_scores
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

DROP POLICY IF EXISTS "Service role can manage runner scores" ON public.runner_scores;
CREATE POLICY "Service role can manage runner scores"
ON public.runner_scores
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS runner_scores_public_leaderboard_idx
ON public.runner_scores (score DESC, created_at ASC)
WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS runner_scores_admin_status_idx
ON public.runner_scores (status, created_at DESC);