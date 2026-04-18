// Feedback service — calls server function.
import { getFeedback } from "@/server/feedback.functions";

export type FeedbackResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  source: "ai" | "fallback";
  wordCount: number;
};

export const feedbackService = {
  async analyze(input: { module: "gd" | "communication" | "interview"; prompt: string; answer: string }): Promise<FeedbackResult> {
    return await getFeedback({ data: input });
  },
};
