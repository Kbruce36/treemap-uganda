import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Instagram, LayoutDashboard, LogOut, Mail, Menu, Phone, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CHAPTER } from "@/data/chapter";
import { SDGS } from "@/data/sdgs";
import { applicationsAreOpen, useIsAdmin, useSiteSettings, useChapterContact } from "@/hooks/use-site";
import { Logo } from "@/components/site/Brand";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/projects", label: "Projects" },
  { path: "/map", label: "Tree Map" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/dashboard", label: "GreenBot" },
];

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const SdgStripe = ({ className }: { className?: string }) => (
  <div className={cn("flex h-1.5 w-full", className)} aria-hidden>
    {SDGS.map((s) => (
      <span key={s.number} className="flex-1" style={{ backgroundColor: s.color }} />
    ))}
  </div>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session, isAdmin } = useIsAdmin();
  const { data: settings } = useSiteSettings();
  const contact = useChapterContact();
  const appsOpen = applicationsAreOpen(settings);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Session already gone; nothing else to clean up.
    }
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative rounded-md px-3 py-2 text-sm font-semibold transition-colors",
      isActive ? "text-primary after:absolute after:inset-x-3 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-secondary" : "text-foreground/70 hover:text-primary"
    );

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      {appsOpen && settings && (
        <Link
          to="/apply"
          className="group block bg-brand-gold text-primary transition-colors hover:bg-brand-gold/90"
        >
          <div className="container flex items-center justify-center gap-2 py-2 text-center text-sm font-semibold">
            <span className="font-display font-extrabold uppercase tracking-wide">{settings.applications_title}</span>
            {!/\bopen\b/i.test(settings.applications_title) && <span className="hidden sm:inline">applications are open</span>}
            {settings.applications_deadline && (
              <span className="hidden md:inline">
                · deadline {format(new Date(settings.applications_deadline), "d MMM yyyy")}
              </span>
            )}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      )}

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === "/"} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {appsOpen && (
              <Button asChild size="sm" className="hidden bg-secondary font-bold hover:bg-brand-green-dark sm:inline-flex">
                <Link to="/apply">Apply to lead</Link>
              </Button>
            )}

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 ring-2 ring-secondary/40 transition hover:ring-secondary">
                    <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                      {session.user.email?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                    {session.user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" /> My trees & profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> GreenBot dashboard
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="outline" className="border-primary/30 font-semibold text-primary">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-4 py-3 font-display text-base font-bold",
                          isActive ? "bg-primary text-primary-foreground" : "text-primary hover:bg-muted"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  {appsOpen && (
                    <Link
                      to="/apply"
                      onClick={() => setMobileOpen(false)}
                      className="mt-3 rounded-lg bg-secondary px-4 py-3 text-center font-display font-bold text-white"
                    >
                      Apply to lead
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto bg-brand-navy-deep text-white">
        <SdgStripe />
        <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm text-white/70">
              {CHAPTER.name}, {CHAPTER.chapter}. A student-run chapter affiliated to the World
              Federation of United Nations Associations.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img src="/images/brand/kyu-logo.png" alt="Kyambogo University" className="h-12 w-auto rounded bg-white p-1" />
              <p className="text-xs text-white/60">Registered student association at Kyambogo University</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-gold">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><Link className="hover:text-white" to="/about">About the chapter</Link></li>
              <li><Link className="hover:text-white" to="/projects">Projects & impact</Link></li>
              <li><Link className="hover:text-white" to="/map">UNAU TreeMap</Link></li>
              <li><Link className="hover:text-white" to="/leaderboard">Leaderboard</Link></li>
              <li><Link className="hover:text-white" to="/dashboard">GreenBot</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-gold">Get involved</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li><Link className="hover:text-white" to="/about#join">Become a member</Link></li>
              <li><Link className="hover:text-white" to="/auth">Map your trees</Link></li>
              <li>
                <Link className="hover:text-white" to="/apply">
                  Executive applications{" "}
                  <span className={cn("ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold", appsOpen ? "bg-secondary text-white" : "bg-white/10 text-white/60")}>
                    {appsOpen ? "OPEN" : "CLOSED"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-gold">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${contact.email}`}>
                  <Mail className="h-4 w-4 text-secondary" /> {contact.email}
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 hover:text-white" href={contact.phoneHref}>
                  <Phone className="h-4 w-4 text-secondary" /> {contact.phone}
                </a>
              </li>
              <li className="text-white/60">{CHAPTER.address}</li>
            </ul>
            <div className="mt-5 flex gap-2">
              <a
                href={contact.instagram.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Instagram ${contact.instagram.handle}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-secondary"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={contact.x.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`X ${contact.x.handle}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-secondary"
              >
                <XIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} UNAU Kyambogo University Chapter. All rights reserved.</p>
            <p className="font-display font-bold uppercase tracking-[0.2em] text-white/60">{CHAPTER.tagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
