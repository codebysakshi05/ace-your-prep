import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeText } from "@/lib/feedback";
import { addProgress } from "@/lib/progress";
import { Mic, Sparkles, Calendar } from "lucide-react";
import { FeedbackPanel } from "@/components/FeedbackPanel";

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
  const [text, setText] = useState("");
  const [fb, setFb] = useState<ReturnType<typeof analyzeText> | null>(null);

  function submit() {
    const result = analyzeText(text);
    setFb(result);
    addProgress({ module: "communication", score: result.score, detail: prompt });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5 text-accent" /> Communication Practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-gradient-hero border border-border p-5">
            <div className="flex items-center gap-2 text-xs text-accent font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> Today's prompt
            </div>
            <p className="mt-2 text-lg font-semibold leading-snug">{prompt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  prompt === p ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border hover:border-accent"
                }`}
              >
                {p.slice(0, 28)}…
              </button>
            ))}
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your spoken-style response. We'll analyze grammar, fillers, and clarity."
            rows={9}
            className="resize-none"
          />
          <Button onClick={submit} disabled={!text.trim()} className="w-full bg-gradient-primary border-0">
            <Sparkles className="w-4 h-4 mr-2" /> Analyze response
          </Button>
        </CardContent>
      </Card>

      <FeedbackPanel feedback={fb} emptyHint="Speak naturally, then submit. We'll grade clarity & fluency." />
    </div>
  );
}
