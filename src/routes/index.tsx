import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Users, Mic, Briefcase, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ace It Up — AI Placement Prep for Students" },
      { name: "description", content: "Crack campus placements with AI-powered aptitude, GD, communication, and interview practice." },
      { property: "og:title", content: "Ace It Up — AI Placement Prep" },
      { property: "og:description", content: "Practice with instant AI feedback. Track real progress." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Ace It Up</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/register"><Button size="sm" className="bg-gradient-primary border-0">Get started</Button></Link>
        </div>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border text-xs mb-6">
          <Sparkles className="w-3 h-3 text-accent" /> AI-powered placement preparation
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Land your dream job with <span className="text-gradient">Ace It Up</span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice aptitude tests, group discussions, communication and mock interviews — with instant AI feedback that tracks your real progress every day.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register">
            <Button size="lg" className="bg-gradient-primary border-0 shadow-glow">
              Start practicing free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login"><Button size="lg" variant="outline">I already have an account</Button></Link>
        </div>

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {[
            { icon: Brain, title: "Aptitude", desc: "Timed MCQ tests with instant scoring." },
            { icon: Users, title: "Group Discussion", desc: "Topics graded by AI feedback." },
            { icon: Mic, title: "Communication", desc: "Daily prompts to sharpen fluency." },
            { icon: Briefcase, title: "Interview", desc: "HR + technical mock Q&A." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:border-accent/60 hover:-translate-y-0.5 transition-all shadow-card">
              <div className="grid place-items-center w-10 h-10 rounded-lg bg-gradient-primary mb-3">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="font-semibold">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="w-4 h-4 text-accent" /> Real progress. Real AI feedback. Built for placements.
        </div>
      </section>
    </div>
  );
}
