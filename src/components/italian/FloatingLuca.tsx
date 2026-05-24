import { Link, useLocation } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function FloatingLuca() {
  const loc = useLocation();
  if (loc.pathname.startsWith("/tutor") || loc.pathname === "/login") return null;
  return (
    <Link
      to="/tutor"
      aria-label="Chat with Luca, your AI Italian tutor"
      className="fixed right-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-primary-foreground transition active:scale-95 hover:scale-105"
      style={{
        bottom: "calc(80px + env(safe-area-inset-bottom))",
        background: "var(--gradient-warm)",
        boxShadow: "var(--shadow-warm)",
      }}
    >
      <span className="relative grid h-6 w-6 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
        <Sparkles className="relative h-4 w-4" />
      </span>
      Ask Luca
    </Link>
  );
}