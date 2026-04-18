import { createFileRoute } from "@tanstack/react-router";
import { Aptitude } from "@/components/modules/Aptitude";

export const Route = createFileRoute("/_app/modules/aptitude")({
  head: () => ({ meta: [{ title: "Aptitude — Ace It Up" }] }),
  component: () => (
    <div className="max-w-3xl mx-auto space-y-4">
      <ModuleHeader title="Aptitude Practice" subtitle="Timed multiple-choice questions to sharpen your problem-solving." />
      <Aptitude />
    </div>
  ),
});

function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
