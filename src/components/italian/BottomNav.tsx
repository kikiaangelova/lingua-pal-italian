import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Mic, GraduationCap, ScrollText, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/learn", label: "Vocab", icon: BookOpen },
  { to: "/speak", label: "Speak", icon: Mic },
  { to: "/grammar", label: "Grammar", icon: GraduationCap },
  { to: "/read", label: "Read", icon: ScrollText },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active =
            it.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs transition " +
                (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className={"h-5 w-5 " + (active ? "scale-110" : "")} />
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}