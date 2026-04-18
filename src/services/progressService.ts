// Progress service — reads attempts and module_scores from Supabase.
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ModuleKey = Database["public"]["Enums"]["module_key"];
export type Attempt = Database["public"]["Tables"]["attempts"]["Row"];
export type ModuleScore = Database["public"]["Tables"]["module_scores"]["Row"];

export const progressService = {
  async listAttempts(limit = 50): Promise<Attempt[]> {
    const { data, error } = await supabase
      .from("attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async listModuleScores(): Promise<ModuleScore[]> {
    const { data, error } = await supabase.from("module_scores").select("*");
    if (error) throw error;
    return data ?? [];
  },

  async getOverallStats() {
    const [attempts, scores] = await Promise.all([
      this.listAttempts(200),
      this.listModuleScores(),
    ]);
    const totalAttempts = attempts.length;
    const overallAvg = totalAttempts
      ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / totalAttempts)
      : 0;
    const best = totalAttempts ? Math.max(...attempts.map((a) => a.score)) : 0;
    return { totalAttempts, overallAvg, best, attempts, scores };
  },

  // Group attempts into the last 7 days for the trend chart.
  weeklyTrend(attempts: Attempt[]): { day: string; score: number; count: number }[] {
    const now = new Date();
    const days: { day: string; date: Date; scores: number[] }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d,
        scores: [],
      });
    }
    for (const a of attempts) {
      const at = new Date(a.created_at);
      const bucket = days.find((d) => {
        const next = new Date(d.date);
        next.setDate(next.getDate() + 1);
        return at >= d.date && at < next;
      });
      if (bucket) bucket.scores.push(a.score);
    }
    return days.map((d) => ({
      day: d.day,
      score: d.scores.length ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
      count: d.scores.length,
    }));
  },
};
