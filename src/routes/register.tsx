import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUser } from "@/lib/auth";
import { AuthShell } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Ace It Up" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || password.length < 6) {
      setErr("Fill all fields. Password must be 6+ characters.");
      return;
    }
    setUser({ name, email });
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Create your account" subtitle="Start your placement prep in seconds.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="mt-1.5" />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full bg-gradient-primary border-0 shadow-glow">Create account</Button>
        <p className="text-sm text-center text-muted-foreground">
          Already a member? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
