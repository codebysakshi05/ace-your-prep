import { createFileRoute } from "@tanstack/react-router";
import { Interview } from "@/components/modules/Interview";

export const Route = createFileRoute("/_app/modules/interview")({
  head: () => ({ meta: [{ title: "Interview — Ace It Up" }] }),
  component: () => (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Mock Interview</h1>
        <p className="text-muted-foreground mt-1">Practice HR and technical questions in interview style.</p>
      </div>
      <Interview />
    </div>
  ),
});
