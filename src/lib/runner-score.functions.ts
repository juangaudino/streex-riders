import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const EmptySchema = z.object({}).optional();

const SubmitRunnerScoreSchema = z.object({
  name: z.string().trim().min(1).max(24),
  score: z.number().int().min(0).max(999999),
});

export const submitRunnerScore = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitRunnerScoreSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: score, error } = await supabaseAdmin
      .from("runner_scores")
      .insert({
        name: data.name,
        score: data.score,
        status: "pending",
      })
      .select("id, name, score, status, created_at")
      .single();

    if (error || !score) {
      console.error("[submitRunnerScore] insert error", error);
      throw new Error("Failed to save score.");
    }

    return { score };
  });

export const listRunnerLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmptySchema.parse(input))
  .handler(async () => {
    const { data: scores, error } = await supabaseAdmin
      .from("runner_scores")
      .select("id, name, score, created_at")
      .eq("status", "approved")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("[listRunnerLeaderboard] read error", error);
      throw new Error("Failed to load leaderboard.");
    }

    return { scores: scores ?? [] };
  });
