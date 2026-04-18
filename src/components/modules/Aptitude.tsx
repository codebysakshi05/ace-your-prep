import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { addProgress } from "@/lib/progress";
import { Brain, Clock, RotateCcw, Trophy } from "lucide-react";

type Q = { q: string; opts: string[]; ans: number };

const QUESTIONS: Q[] = [
  { q: "If a train travels 60 km in 1.5 hours, what is its speed?", opts: ["30 km/h", "40 km/h", "45 km/h", "90 km/h"], ans: 1 },
  { q: "Find the next number: 2, 6, 12, 20, ?", opts: ["28", "30", "32", "26"], ans: 1 },
  { q: "20% of 250 is?", opts: ["25", "40", "50", "75"], ans: 2 },
  { q: "If A:B = 2:3 and B:C = 4:5, then A:C is?", opts: ["8:15", "2:5", "4:5", "3:5"], ans: 0 },
  { q: "Average of 10, 20, 30, 40, 50 is?", opts: ["20", "25", "30", "35"], ans: 2 },
  { q: "Cost price 200, sold at 250. Profit % = ?", opts: ["20%", "25%", "30%", "50%"], ans: 1 },
  { q: "LCM of 12 and 18 is?", opts: ["24", "36", "48", "72"], ans: 1 },
  { q: "A clock shows 3:15. The angle between hands is?", opts: ["0°", "7.5°", "15°", "30°"], ans: 1 },
];

const TIME = 120; // seconds

export function Aptitude() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [time, setTime] = useState(TIME);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (time <= 0) return finish();
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, done]);

  const score = useMemo(
    () => answers.reduce((acc, a, i) => acc + (a === QUESTIONS[i].ans ? 1 : 0), 0),
    [answers],
  );

  function pick(opt: number) {
    const next = [...answers, opt];
    setAnswers(next);
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else finish(next);
  }

  function finish(final = answers) {
    const correct = final.reduce((acc, a, i) => acc + (a === QUESTIONS[i].ans ? 1 : 0), 0);
    const pct = Math.round((correct / QUESTIONS.length) * 100);
    addProgress({ module: "aptitude", score: pct, detail: `${correct}/${QUESTIONS.length}` });
    setDone(true);
  }

  function reset() {
    setIdx(0);
    setAnswers([]);
    setTime(TIME);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" /> Test complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <p className="text-6xl font-extrabold text-gradient">{pct}%</p>
            <p className="text-muted-foreground mt-2">{score} / {QUESTIONS.length} correct</p>
          </div>
          <Button onClick={reset} className="w-full bg-gradient-primary border-0">
            <RotateCcw className="w-4 h-4 mr-2" /> Retake test
          </Button>
        </CardContent>
      </Card>
    );
  }

  const cur = QUESTIONS[idx];
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-accent" /> Aptitude Test</CardTitle>
        <div className="flex items-center gap-2 text-sm font-mono px-3 py-1 rounded-full bg-secondary">
          <Clock className="w-4 h-4" /> {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Progress value={((idx) / QUESTIONS.length) * 100} />
        <p className="text-xs text-muted-foreground">Question {idx + 1} of {QUESTIONS.length}</p>
        <h3 className="text-lg font-semibold leading-snug">{cur.q}</h3>
        <div className="grid gap-2">
          {cur.opts.map((o, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className="text-left px-4 py-3 rounded-lg border border-border bg-secondary/40 hover:bg-secondary hover:border-accent transition-all"
            >
              <span className="font-mono text-accent mr-2">{String.fromCharCode(65 + i)}.</span> {o}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
