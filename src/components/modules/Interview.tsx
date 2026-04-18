import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeText } from "@/lib/feedback";
import { addProgress } from "@/lib/progress";
import { Briefcase, Sparkles, ChevronRight } from "lucide-react";
import { FeedbackPanel } from "@/components/FeedbackPanel";

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
  const [text, setText] = useState("");
  const [fb, setFb] = useState<ReturnType<typeof analyzeText> | null>(null);

  const list = tab === "hr" ? HR : TECH;
  const q = list[idx];

  function submit() {
    const result = analyzeText(text);
    setFb(result);
    addProgress({ module: "interview", score: result.score, detail: `${tab.toUpperCase()}: ${q}` });
  }

  function next() {
    setIdx((i) => (i + 1) % list.length);
    setText("");
    setFb(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-accent" /> Mock Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="inline-flex rounded-lg border border-border p-1">
            {(["hr", "tech"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setIdx(0); setText(""); setFb(null); }}
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

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Use STAR for behavioral, structured reasoning for technical."
            rows={8}
            className="resize-none"
          />

          <div className="flex gap-2">
            <Button onClick={submit} disabled={!text.trim()} className="flex-1 bg-gradient-primary border-0">
              <Sparkles className="w-4 h-4 mr-2" /> Submit answer
            </Button>
            <Button onClick={next} variant="outline">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <FeedbackPanel feedback={fb} emptyHint="Answer the question, then we'll evaluate structure & language." />
    </div>
  );
}
