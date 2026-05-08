import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Mic, GraduationCap, ScrollText, Sparkles } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/learn", label: "Vocab", icon: BookOpen },
  { to: "/speak", label: "Speak", icon: Mic },
  { to: "/tutor", label: "Luca", icon: Sparkles },
  { to: "/grammar", label: "Grammar", icon: GraduationCap },
  { to: "/read", label: "Read", icon: ScrollText },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 animate-[float_6s_ease-in-out_infinite] rounded-full border border-white/30 bg-white/20 px-2 py-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <div className="flex items-stretch justify-between gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active =
            it.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={
                "group flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-110 " +
                (active
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-foreground/70 hover:text-foreground")
              }
            >
              <Icon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}