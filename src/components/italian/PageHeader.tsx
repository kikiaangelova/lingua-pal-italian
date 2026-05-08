import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  crumbs = [],
}: {
  title?: string;
  crumbs?: Crumb[];
}) {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={goBack}
          aria-label="Back"
          className="inline-flex h-11 min-w-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-muted active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        {title ? (
          <div className="truncate px-2 text-sm font-medium text-muted-foreground">
            {title}
          </div>
        ) : (
          <div />
        )}
        <Link
          to="/"
          aria-label="Home"
          className="inline-flex h-11 min-w-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-muted active:scale-95"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>
      {crumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <span aria-hidden>›</span>
              {c.to ? (
                <Link to={c.to} className="hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}