import { createFileRoute } from "@tanstack/react-router";
import { Communication } from "@/components/modules/Communication";

export const Route = createFileRoute("/_app/modules/communication")({
  head: () => ({ meta: [{ title: "Communication — Ace It Up" }] }),
  component: () => (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Communication</h1>
        <p className="text-muted-foreground mt-1">Daily speaking prompts with grammar & clarity feedback.</p>
      </div>
      <Communication />
    </div>
  ),
});
