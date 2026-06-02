import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LeaderboardSchema = z
  .object({
    score: z.number().int().min(0).max(999999).optional(),
  })
  .optional();

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
      if (isRunnerScoresMissing(error)) {
        throw new Error(getRunnerScoresNotReadyMessage());
      }
      throw new Error("Failed to save score.");
    }

    return { score };
  });

export const listRunnerLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeaderboardSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: scores, error } = await supabaseAdmin
      .from("runner_scores")
      .select("id, name, score, created_at")
      .eq("status", "approved")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("[listRunnerLeaderboard] read error", error);
      if (isRunnerScoresMissing(error)) {
        return {
          scores: [],
          currentRank: 1,
          totalRiders: 1,
          recordsReady: false,
          message: getRunnerScoresNotReadyMessage(),
        };
      }
      throw new Error("Failed to load leaderboard.");
    }

    if (typeof data?.score !== "number") {
      return {
        scores: scores ?? [],
        currentRank: 1,
        totalRiders: Math.max(1, scores?.length ?? 0),
        recordsReady: true,
      };
    }

    const [activeCountResult, betterCountResult] = await Promise.all([
      supabaseAdmin
        .from("runner_scores")
        .select("id", { count: "exact", head: true })
        .neq("status", "rejected"),
      supabaseAdmin
        .from("runner_scores")
        .select("id", { count: "exact", head: true })
        .neq("status", "rejected")
        .gt("score", data.score),
    ]);

    if (activeCountResult.error || betterCountResult.error) {
      console.error("[listRunnerLeaderboard] stats error", {
        active: activeCountResult.error,
        better: betterCountResult.error,
      });
      if (
        isRunnerScoresMissing(activeCountResult.error) ||
        isRunnerScoresMissing(betterCountResult.error)
      ) {
        return {
          scores: scores ?? [],
          currentRank: 1,
          totalRiders: 1,
          recordsReady: false,
          message: getRunnerScoresNotReadyMessage(),
        };
      }
      throw new Error("Failed to load runner score stats.");
    }

    return {
      scores: scores ?? [],
      currentRank: (betterCountResult.count ?? 0) + 1,
      totalRiders: (activeCountResult.count ?? 0) + 1,
      recordsReady: true,
    };
  });

function isRunnerScoresMissing(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message ?? ""} ${candidate.details ?? ""}`.toLowerCase();
  return (
    candidate.code === "42P01" || candidate.code === "PGRST205" || text.includes("runner_scores")
  );
}

function getRunnerScoresNotReadyMessage() {
  return "Runner records are not ready yet. Apply the runner_scores migration in Lovable Cloud.";
}
