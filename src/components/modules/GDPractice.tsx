import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeText } from "@/lib/feedback";
import { addProgress } from "@/lib/progress";
import { Users, Sparkles } from "lucide-react";
import { FeedbackPanel } from "@/components/FeedbackPanel";

const TOPICS = [
  "Is remote work the future of employment?",
  "Should AI replace human teachers in classrooms?",
  "Social media: boon or bane for Gen Z?",
  "Is a startup career better than a corporate job for freshers?",
  "Should college education be free for all?",
];

export function GDPractice() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [text, setText] = useState("");
  const [fb, setFb] = useState<ReturnType<typeof analyzeText> | null>(null);

  function submit() {
    const result = analyzeText(text);
    setFb(result);
    addProgress({ module: "gd", score: result.score, detail: topic });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-accent" /> Group Discussion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Pick a topic</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    topic === t ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border hover:border-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Your response</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your view with structure: stance, reasons, example, conclusion."
              rows={10}
              className="mt-2 resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
          </div>
          <Button onClick={submit} disabled={!text.trim()} className="w-full bg-gradient-primary border-0">
            <Sparkles className="w-4 h-4 mr-2" /> Get AI feedback
          </Button>
        </CardContent>
      </Card>

      <FeedbackPanel feedback={fb} emptyHint="Submit your answer to receive instant feedback." />
    </div>
  );
}
