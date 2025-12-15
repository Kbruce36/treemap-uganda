import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Globe, Leaf, Map, Trophy, User, LogOut, Info, Mail, TreePine } from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  // Detect if we're in TreeMap section
  const isTreeMapSection = location.pathname.startsWith("/treemap") || location.pathname === "/auth";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // On sign out, redirect to treemap home
        if (event === "SIGNED_OUT") {
          navigate("/treemap", { replace: true });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      setSession(null);
      await supabase.auth.signOut();
    } catch {
      // Session already cleared
    }
    navigate("/treemap", { replace: true });
  };

  // SDG Hub navigation
  const sdgNavItems = [
    { path: "/", label: "Home", icon: Globe },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact", icon: Mail },
    { path: "/treemap", label: "TreeMap", icon: TreePine },
  ];

  // TreeMap navigation
  const treeMapNavItems = [
    { path: "/treemap", label: "Home", icon: Leaf },
    { path: "/treemap/map", label: "Map", icon: Map },
    { path: "/treemap/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/treemap/profile", label: "Profile", icon: User },
  ];

  const navItems = isTreeMapSection ? treeMapNavItems : sdgNavItems;

  return (
    <div className="min-h-screen flex flex-col gradient-subtle">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={isTreeMapSection ? "/treemap" : "/"} className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
                {isTreeMapSection ? (
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Globe className="w-6 h-6 text-primary-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {isTreeMapSection ? "TreeMap" : "SDG Hub"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isTreeMapSection ? "UNAU Kyambogo" : "Sustainable Development Goals"}
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {isTreeMapSection && session ? (
                <>
                  <Link to="/treemap/profile">
                    <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 ring-primary transition-all">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {session.user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : isTreeMapSection ? (
                <Link to="/auth">
                  <Button variant="default" size="sm">Sign In</Button>
                </Link>
              ) : (
                <Link to="/treemap">
                  <Button variant="default" size="sm">
                    <TreePine className="w-4 h-4 mr-2" />
                    TreeMap
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center justify-around mt-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          {isTreeMapSection ? (
            <p>© 2025 TreeMap UNAU Kyambogo. Making our planet greener, one tree at a time.</p>
          ) : (
            <p>© 2025 SDG Hub. Working together for a sustainable future.</p>
          )}
        </div>
      </footer>
    </div>
  );
};
