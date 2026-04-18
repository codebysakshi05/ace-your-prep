import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Users, Mic, Briefcase, TrendingUp, Flame, Target, ArrowRight } from "lucide-react";
import { getUser, type MockUser } from "@/lib/auth";
import { getProgress, moduleStats, type ProgressEntry, type ModuleKey } from "@/lib/progress";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Ace It Up" }] }),
  component: Dashboard,
});

const MODULES: { key: ModuleKey; label: string; to: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { key: "aptitude", label: "Aptitude", to: "/modules/aptitude", icon: Brain, desc: "Timed MCQ practice" },
  { key: "gd", label: "Group Discussion", to: "/modules/gd", icon: Users, desc: "Topic-based responses" },
  { key: "communication", label: "Communication", to: "/modules/communication", icon: Mic, desc: "Daily speaking prompts" },
  { key: "interview", label: "Interview", to: "/modules/interview", icon: Briefcase, desc: "HR & technical Q&A" },
];

function Dashboard() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    setUser(getUser());
    setProgress(getProgress());
    const sync = () => setProgress(getProgress());
    window.addEventListener("aceitup-progress", sync);
    return () => window.removeEventListener("aceitup-progress", sync);
  }, []);

  const totalAttempts = progress.length;
  const overallAvg = totalAttempts ? Math.round(progress.reduce((a, b) => a + b.score, 0) / totalAttempts) : 0;
  const best = totalAttempts ? Math.max(...progress.map((p) => p.score)) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Hi {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your placement prep snapshot.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Avg Score" value={`${overallAvg}%`} />
        <StatCard icon={Flame} label="Total Attempts" value={String(totalAttempts)} />
        <StatCard icon={Target} label="Best Score" value={`${best}%`} />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Practice Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => {
            const s = moduleStats(progress, m.key);
            return (
              <Link key={m.key} to={m.to} className="group">
                <Card className="h-full shadow-card hover:border-accent/60 hover:-translate-y-1 transition-all duration-200">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-primary shadow-glow">
                        <m.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div>
                      <p className="font-semibold">{m.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                      <span className="text-muted-foreground">{s.attempts} attempts</span>
                      <span className="font-semibold text-accent">{s.avg}% avg</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent Activity</h2>
        <Card className="shadow-card">
          <CardContent className="p-0">
            {progress.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No attempts yet. Pick a module above to start practicing!
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {[...progress].reverse().slice(0, 6).map((p, i) => (
                  <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium capitalize">{p.module}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.detail ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(p.at).toLocaleDateString()}</span>
                      <span className="font-bold text-accent w-12 text-right">{p.score}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-secondary">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-extrabold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
