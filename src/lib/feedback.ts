// Lightweight rule-based text feedback (UI-only scaffold).
const FILLERS = ["um", "uh", "like", "you know", "actually", "basically", "literally", "kinda", "sorta"];
const WEAK = ["very", "really", "just", "thing", "stuff"];

export type Feedback = {
  score: number;
  wordCount: number;
  fillers: { word: string; count: number }[];
  weak: { word: string; count: number }[];
  suggestions: string[];
};

export function analyzeText(text: string): Feedback {
  const clean = text.trim();
  const words = clean.length ? clean.split(/\s+/) : [];
  const lower = ` ${clean.toLowerCase()} `;

  const fillers = FILLERS.map((w) => {
    const matches = lower.match(new RegExp(`\\s${w}\\s`, "g"));
    return { word: w, count: matches?.length ?? 0 };
  }).filter((f) => f.count > 0);

  const weak = WEAK.map((w) => {
    const matches = lower.match(new RegExp(`\\s${w}\\s`, "g"));
    return { word: w, count: matches?.length ?? 0 };
  }).filter((f) => f.count > 0);

  const suggestions: string[] = [];
  if (words.length < 40) suggestions.push("Try expanding your answer with examples or context (aim 80–150 words).");
  if (fillers.length) suggestions.push("Reduce filler words to sound more confident.");
  if (weak.length) suggestions.push("Replace vague words like 'very' or 'thing' with precise vocabulary.");
  if (!/[.!?]$/.test(clean)) suggestions.push("End sentences with proper punctuation.");
  if (clean && clean[0] !== clean[0].toUpperCase()) suggestions.push("Start sentences with a capital letter.");
  if (suggestions.length === 0) suggestions.push("Great structure — keep practicing for fluency!");

  // Score: penalize fillers/weak words and reward length up to 150.
  const lenScore = Math.min(words.length / 150, 1) * 60;
  const penalty = fillers.reduce((a, b) => a + b.count * 4, 0) + weak.reduce((a, b) => a + b.count * 2, 0);
  const score = Math.max(0, Math.min(100, Math.round(40 + lenScore - penalty)));

  return { score, wordCount: words.length, fillers, weak, suggestions };
}
