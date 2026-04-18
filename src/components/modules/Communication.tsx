import { useState } from "react";
import { Mic, Calendar } from "lucide-react";
import { TextPracticeCard } from "./TextPracticeCard";

const PROMPTS = [
  "Describe your dream career in 90 seconds.",
  "Talk about a book or movie that changed how you think.",
  "Explain a complex topic to a 10-year-old.",
  "If you could solve one problem in the world, what and why?",
  "Pitch yourself in 60 seconds — your elevator pitch.",
];

export function Communication() {
  const today = new Date().getDay() % PROMPTS.length;
  const [prompt, setPrompt] = useState(PROMPTS[today]);
  return (
    <TextPracticeCard
      module="communication"
      title="Communication Practice"
      icon={<Mic className="w-5 h-5 text-accent" />}
      prompt={prompt}
      setPrompt={setPrompt}
      promptOptions={PROMPTS}
      before={
        <div className="rounded-xl bg-gradient-hero border border-border p-5">
          <div className="flex items-center gap-2 text-xs text-accent font-semibold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> Today's prompt
          </div>
          <p className="mt-2 text-lg font-semibold leading-snug">{prompt}</p>
        </div>
      }
    />
  );
}
