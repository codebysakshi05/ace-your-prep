import { createFileRoute } from "@tanstack/react-router";
import { GDPractice } from "@/components/modules/GDPractice";

export const Route = createFileRoute("/_app/modules/gd")({
  head: () => ({ meta: [{ title: "Group Discussion — Ace It Up" }] }),
  component: () => (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Group Discussion</h1>
        <p className="text-muted-foreground mt-1">Pick a topic, share your view, get instant feedback.</p>
      </div>
      <GDPractice />
    </div>
  ),
});
