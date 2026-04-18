import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { clearUser, getUser, type MockUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [user, setUser] = useState<MockUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getUser());
    const sync = () => setUser(getUser());
    window.addEventListener("aceitup-auth", sync);
    return () => window.removeEventListener("aceitup-auth", sync);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-primary">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold">Ace It Up</span>
      </div>
      <div className="hidden md:block text-sm text-muted-foreground">
        Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-bold text-primary-foreground">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              {user.name}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearUser();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button size="sm" className="bg-gradient-primary text-primary-foreground border-0">
              Sign in
            </Button>
          </Link>
        )}
        <button className="md:hidden p-2 rounded-md hover:bg-secondary" aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
