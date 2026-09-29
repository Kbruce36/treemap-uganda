import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  TreeDeciduous,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/use-site";
import { SdgStripe } from "@/components/Layout";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/applications", label: "Applications", icon: Inbox },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/team", label: "Team", icon: UsersRound },
  { to: "/admin/trees", label: "Trees", icon: TreeDeciduous },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const useNoIndex = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = "Admin · UNAU Kyambogo";
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);
};

const AdminSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error("Sign-in failed. Check your email and password.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy-deep p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl">
        <SdgStripe />
        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div className="text-center">
            <img src="/images/brand/unau-logo-sm.png" alt="" className="mx-auto h-16 w-auto" />
            <h1 className="mt-4 font-display text-2xl font-black text-primary">Chapter admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with your admin account.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-primary font-bold" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </Button>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-primary">
            ← Back to the website
          </Link>
        </form>
      </div>
    </div>
  );
};

const AdminNav = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="flex flex-col gap-1">
    {ADMIN_NAV.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            isActive ? "bg-white text-primary shadow" : "text-white/75 hover:bg-white/10 hover:text-white"
          )
        }
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </NavLink>
    ))}
  </nav>
);

const AdminLayout = () => {
  useNoIndex();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isAdmin, loading } = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => undefined);
    queryClient.clear();
    navigate("/admin", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-navy-deep">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!session) return <AdminSignIn />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md rounded-3xl bg-card p-8 text-center shadow-card ring-1 ring-border">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-black text-primary">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as <strong>{session.user.email}</strong>, but this account isn't a chapter admin. Ask an
            existing admin to grant you access.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/">Back to site</Link>
            </Button>
            <Button onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-8 p-5">
      <Link to="/admin" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
        <img src="/images/brand/unau-logo-sm.png" alt="" className="h-10 w-auto rounded-full bg-white p-0.5" />
        <div className="leading-tight">
          <p className="font-display font-extrabold text-white">UNAU Kyambogo</p>
          <p className="text-xs text-white/60">Admin</p>
        </div>
      </Link>
      <AdminNav onNavigate={() => setMenuOpen(false)} />
      <div className="mt-auto space-y-2">
        <Link to="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <ArrowUpRight className="h-4 w-4" /> View website
        </Link>
        <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="truncate px-3 text-xs text-white/40">{session.user.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-brand-navy-deep lg:block">{sidebar}</aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-brand-navy-deep px-4 lg:hidden">
          <span className="font-display font-extrabold text-white">UNAU Admin</span>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Open admin menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] border-0 bg-brand-navy-deep p-0">
              <SheetTitle className="sr-only">Admin menu</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
