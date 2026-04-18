import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Feedback } from "@/lib/feedback";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export function FeedbackPanel({ feedback, emptyHint }: { feedback: Feedback | null; emptyHint: string }) {
  return (
    <Card className="shadow-card bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> AI Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {!feedback ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
            {emptyHint}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center py-4 rounded-xl bg-gradient-hero border border-border">
              <p className="text-5xl font-extrabold text-gradient">{feedback.score}</p>
              <p className="text-xs text-muted-foreground mt-1">overall score · {feedback.wordCount} words</p>
            </div>

            {feedback.fillers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Filler words</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.fillers.map((f) => (
                    <span key={f.word} className="text-xs px-2.5 py-1 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                      {f.word} ×{f.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {feedback.weak.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Vague language</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.weak.map((f) => (
                    <span key={f.word} className="text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/30">
                      {f.word} ×{f.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Suggestions</p>
              <ul className="space-y-2">
                {feedback.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    {s.startsWith("Great") ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                    )}
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
