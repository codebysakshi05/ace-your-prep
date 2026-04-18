import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Brain, Users, Mic, Briefcase, Sparkles } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/modules/aptitude", label: "Aptitude", icon: Brain },
  { to: "/modules/gd", label: "Group Discussion", icon: Users },
  { to: "/modules/communication", label: "Communication", icon: Mic },
  { to: "/modules/interview", label: "Interview", icon: Briefcase },
] as const;

export function Sidebar() {
  const { location } = useRouterState();

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <Link to="/dashboard" className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary shadow-glow">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="font-bold tracking-tight">Ace It Up</p>
          <p className="text-[11px] text-muted-foreground">Placement Prep</p>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border p-4 bg-sidebar-accent/40">
        <p className="text-xs font-semibold">Pro tip</p>
        <p className="text-xs text-muted-foreground mt-1">Practice 20 min daily to ace your placements.</p>
      </div>
    </aside>
  );
}
