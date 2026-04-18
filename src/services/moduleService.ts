// Module service — saves attempts to backend.
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ModuleKey = Database["public"]["Enums"]["module_key"];

export type SaveAttemptInput = {
  userId: string;
  module: ModuleKey;
  score: number;
  detail?: string | null;
  prompt?: string | null;
  answer?: string | null;
  feedback?: unknown;
};

export const moduleService = {
  async saveAttempt(input: SaveAttemptInput) {
    const { data, error } = await supabase
      .from("attempts")
      .insert({
        user_id: input.userId,
        module: input.module,
        score: input.score,
        detail: input.detail ?? null,
        prompt: input.prompt ?? null,
        answer: input.answer ?? null,
        feedback: (input.feedback as Database["public"]["Tables"]["attempts"]["Insert"]["feedback"]) ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listModuleAttempts(module: ModuleKey, limit = 10) {
    const { data, error } = await supabase
      .from("attempts")
      .select("*")
      .eq("module", module)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
