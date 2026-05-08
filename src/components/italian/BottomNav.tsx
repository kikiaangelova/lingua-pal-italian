import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Mic, GraduationCap, ScrollText, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/learn", label: "Vocab", icon: BookOpen },
  { to: "/speak", label: "Speak", icon: Mic },
  { to: "/grammar", label: "Grammar", icon: GraduationCap },
  { to: "/read", label: "Stories", icon: ScrollText },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active =
            it.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(it.to);
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                aria-label={it.label}
                aria-current={active ? "page" : undefined}
                className={
                  "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition active:scale-95 " +
                  (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
                }
              >
                {active && (
                  <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />
                )}
                <Icon className="h-5 w-5" />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}