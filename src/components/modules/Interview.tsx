import { useState } from "react";
import { Briefcase, ChevronRight } from "lucide-react";
import { TextPracticeCard } from "./TextPracticeCard";
import { Button } from "@/components/ui/button";

const HR = [
  "Tell me about yourself.",
  "Why should we hire you?",
  "Describe a challenge you overcame.",
  "Where do you see yourself in 5 years?",
  "What are your biggest strengths and weaknesses?",
];
const TECH = [
  "Explain the difference between SQL and NoSQL databases.",
  "What is the time complexity of binary search? Why?",
  "Describe how HTTPS works at a high level.",
  "What are React hooks? Name three you use often.",
  "Explain OOP pillars with a real-world example.",
];

export function Interview() {
  const [tab, setTab] = useState<"hr" | "tech">("hr");
  const [idx, setIdx] = useState(0);
  const list = tab === "hr" ? HR : TECH;
  const q = list[idx];

  return (
    <TextPracticeCard
      module="interview"
      title="Mock Interview"
      icon={<Briefcase className="w-5 h-5 text-accent" />}
      prompt={`${tab.toUpperCase()}: ${q}`}
      setPrompt={() => {}}
      before={
        <>
          <div className="inline-flex rounded-lg border border-border p-1">
            {(["hr", "tech"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setIdx(0); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  tab === t ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "hr" ? "HR" : "Technical"}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-5">
            <p className="text-xs text-muted-foreground">Question {idx + 1} / {list.length}</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{q}</p>
          </div>

          <Button onClick={() => setIdx((i) => (i + 1) % list.length)} variant="outline" size="sm">
            Next question <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </>
      }
    />
  );
}
