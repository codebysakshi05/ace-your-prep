import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUser } from "@/lib/auth";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Ace It Up" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setErr("Please fill all fields"); return; }
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({ name, email });
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your prep journey.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full bg-gradient-primary border-0 shadow-glow">Sign in</Button>
        <p className="text-sm text-center text-muted-foreground">
          New here? <Link to="/register" className="text-accent hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-hero relative">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold">Ace It Up</span>
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Crack placements with <span className="text-gradient">AI on your side.</span></h2>
          <p className="mt-3 text-muted-foreground max-w-md">Aptitude · Group Discussions · Communication · Mock Interviews — all in one calm, focused workspace.</p>
        </div>
        <div className="text-xs text-muted-foreground">© Ace It Up</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary"><Sparkles className="w-5 h-5 text-primary-foreground" /></div>
            <span className="font-bold">Ace It Up</span>
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
