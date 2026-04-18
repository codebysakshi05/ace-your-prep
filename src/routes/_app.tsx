import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getUser()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
