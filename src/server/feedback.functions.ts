// Server functions — feedback engine. Calls Lovable AI Gateway with structured tool-calling,
// falls back to rule-based logic on rate-limit / error.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ruleBasedFeedback } from "./feedback.server";

const InputSchema = z.object({
  module: z.enum(["gd", "communication", "interview"]),
  prompt: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
});

export type FeedbackResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  source: "ai" | "fallback";
  wordCount: number;
};

const SYSTEM_PROMPTS: Record<string, string> = {
  gd: "You are an expert placement coach evaluating a student's response in a Group Discussion. Judge structure, clarity, reasoning, and language.",
  communication: "You are a communication coach evaluating a student's spoken-style response. Judge clarity, grammar, fluency, and confidence.",
  interview: "You are a senior interviewer evaluating a candidate's answer. Judge structure (STAR for behavioral, logical reasoning for technical), depth, and language.",
};

export const getFeedback = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<FeedbackResult> => {
    const wordCount = data.answer.trim().split(/\s+/).filter(Boolean).length;
    const apiKey = process.env.LOVABLE_API_KEY;

    if (!apiKey) {
      const fb = ruleBasedFeedback(data.answer);
      return { ...fb, source: "fallback" };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPTS[data.module] },
            {
              role: "user",
              content: `Prompt/Question: ${data.prompt}\n\nCandidate's answer:\n"""${data.answer}"""\n\nEvaluate it.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "submit_evaluation",
                description: "Return a structured evaluation of the candidate's answer.",
                parameters: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100, description: "Overall score 0-100." },
                    strengths: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4, description: "Specific things the candidate did well." },
                    weaknesses: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4, description: "Concrete weaknesses to address." },
                    suggestions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4, description: "Actionable improvement suggestions." },
                  },
                  required: ["score", "strengths", "weaknesses", "suggestions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "submit_evaluation" } },
        }),
      });

      if (!res.ok) {
        if (res.status === 429 || res.status === 402) {
          console.warn(`AI gateway ${res.status} — falling back to rule-based feedback.`);
          const fb = ruleBasedFeedback(data.answer);
          return { ...fb, source: "fallback" };
        }
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        const fb = ruleBasedFeedback(data.answer);
        return { ...fb, source: "fallback" };
      }

      const json = await res.json();
      const call = json?.choices?.[0]?.message?.tool_calls?.[0];
      const argsRaw = call?.function?.arguments;
      if (!argsRaw) {
        const fb = ruleBasedFeedback(data.answer);
        return { ...fb, source: "fallback" };
      }
      const parsed = JSON.parse(argsRaw) as {
        score: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
      };
      return {
        score: Math.max(0, Math.min(100, Math.round(parsed.score))),
        strengths: parsed.strengths.slice(0, 4),
        weaknesses: parsed.weaknesses.slice(0, 4),
        suggestions: parsed.suggestions.slice(0, 4),
        source: "ai",
        wordCount,
      };
    } catch (err) {
      console.error("Feedback function error:", err);
      const fb = ruleBasedFeedback(data.answer);
      return { ...fb, source: "fallback" };
    }
  });
