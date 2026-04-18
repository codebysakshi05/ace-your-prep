// Shared text-based module (used by GD, Communication, Interview).
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { feedbackService, type FeedbackResult } from "@/services/feedbackService";
import { moduleService } from "@/services/moduleService";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Sparkles, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ModuleKey = Database["public"]["Enums"]["module_key"];

export function TextPracticeCard({
  module,
  title,
  icon,
  prompt,
  setPrompt,
  promptOptions,
  before,
}: {
  module: Exclude<ModuleKey, "aptitude">;
  title: string;
  icon: React.ReactNode;
  prompt: string;
  setPrompt: (s: string) => void;
  promptOptions?: string[];
  before?: React.ReactNode;
}) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [fb, setFb] = useState<FeedbackResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  // Reset timer when prompt changes.
  useEffect(() => { setStartedAt(Date.now()); setFb(null); setText(""); }, [prompt]);

  async function submit() {
    if (!text.trim() || !user) return;
    const timeSpentMs = Date.now() - startedAt;
    setBusy(true);
    setFb(null);
    try {
      const result = await feedbackService.analyze({ module, prompt, answer: text });
      setFb(result);
      await moduleService.saveAttempt({
        userId: user.id,
        module,
        score: result.score,
        detail: prompt,
        prompt,
        answer: text,
        feedback: result,
        topic: module,
        timeSpentMs,
      });
      toast.success(`Scored ${result.score}/100 · saved to progress`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Feedback failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {before}
          {promptOptions && (
            <div className="flex flex-wrap gap-2">
              {promptOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    prompt === p ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border hover:border-accent"
                  }`}
                >
                  {p.length > 32 ? p.slice(0, 30) + "…" : p}
                </button>
              ))}
            </div>
          )}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your answer. AI will score structure, clarity, grammar, and fluency."
            rows={9}
            className="resize-none"
          />
          <p className="text-[11px] text-muted-foreground">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
          <Button onClick={submit} disabled={!text.trim() || busy} className="w-full bg-gradient-primary border-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {busy ? "Analyzing…" : "Get AI feedback"}
          </Button>
        </CardContent>
      </Card>

      <FeedbackPanel feedback={fb} loading={busy} emptyHint="Submit your answer to receive instant AI feedback." />
    </div>
  );
}
