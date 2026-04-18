// Server-only rule-based fallback for AI feedback.
const FILLERS = ["um", "uh", "like", "you know", "actually", "basically", "literally", "kinda", "sorta"];
const WEAK = ["very", "really", "just", "thing", "stuff"];

export type FallbackFeedback = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  wordCount: number;
};

export function ruleBasedFeedback(text: string): FallbackFeedback {
  const clean = text.trim();
  const words = clean.length ? clean.split(/\s+/) : [];
  const lower = ` ${clean.toLowerCase()} `;

  const fillers = FILLERS.flatMap((w) => {
    const matches = lower.match(new RegExp(`\\s${w}\\s`, "g"));
    return matches ? [{ word: w, count: matches.length }] : [];
  });
  const weak = WEAK.flatMap((w) => {
    const matches = lower.match(new RegExp(`\\s${w}\\s`, "g"));
    return matches ? [{ word: w, count: matches.length }] : [];
  });

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (words.length >= 80) strengths.push("Good answer length and depth.");
  if (/[.!?]$/.test(clean)) strengths.push("Properly punctuated sentences.");
  if (clean && clean[0] === clean[0].toUpperCase()) strengths.push("Clean sentence structure.");
  if (strengths.length === 0) strengths.push("You attempted the question — good first step.");

  if (words.length < 40) {
    weaknesses.push(`Answer is short (${words.length} words).`);
    suggestions.push("Expand with examples, context, or a STAR-style structure (aim 80–150 words).");
  }
  if (fillers.length) {
    weaknesses.push(`Uses filler words: ${fillers.map((f) => `${f.word}×${f.count}`).join(", ")}.`);
    suggestions.push("Replace fillers with brief pauses to sound more confident.");
  }
  if (weak.length) {
    weaknesses.push(`Vague language: ${weak.map((f) => `${f.word}×${f.count}`).join(", ")}.`);
    suggestions.push("Use precise, concrete vocabulary instead of vague words.");
  }
  if (!/[.!?]$/.test(clean)) suggestions.push("End sentences with proper punctuation.");
  if (suggestions.length === 0) suggestions.push("Keep practicing daily to build fluency.");

  const lenScore = Math.min(words.length / 150, 1) * 60;
  const penalty = fillers.reduce((a, b) => a + b.count * 4, 0) + weak.reduce((a, b) => a + b.count * 2, 0);
  const score = Math.max(0, Math.min(100, Math.round(40 + lenScore - penalty)));

  return { score, strengths, weaknesses, suggestions, wordCount: words.length };
}
