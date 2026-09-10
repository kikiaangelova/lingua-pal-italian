import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Ciao" },
      {
        name: "description",
        content:
          "Sign in or create a free Ciao account to save your Italian streak, XP and journey map across devices.",
      },
      { property: "og:title", content: "Sign in — Ciao" },
      {
        property: "og:description",
        content:
          "Sign in or create a free Ciao account to save your Italian streak, XP and journey map across devices.",
      },
      { property: "og:url", content: "https://tryitalian.com/login" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "canonical", href: "https://tryitalian.com/login" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { next?: string } =>
    typeof s.next === "string" ? { next: s.next } : {},
  component: LoginPage,
});

/** Only allow same-origin relative paths as a post-login destination. */
function safeNext(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const returnTo = safeNext(next);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (returnTo) window.location.href = returnTo;
      else navigate({ to: "/" });
    }
  }, [user, loading, navigate, returnTo]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: returnTo
              ? window.location.origin + returnTo
              : window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Benvenuto! Account created.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bentornato!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> Ciao!
        </span>
        <h1 className="mt-4 text-5xl font-semibold leading-tight text-foreground">
          Impara <em className="font-display italic text-primary">l'italiano.</em>
        </h1>
        <p className="mt-2 text-muted-foreground">Sign in to save your streak & progress.</p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 rounded-3xl border border-border/60 bg-card p-6"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="mb-4 flex rounded-full bg-muted p-1 text-sm font-medium">
          {(["login", "signup"] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              className={
                "flex-1 rounded-full px-3 py-2 transition " +
                (mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
              }
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <Field
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="Maria"
            type="text"
          />
        )}
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

        <button
          type="submit"
          disabled={busy}
          className="mt-2 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          {busy ? "Un momento…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> oppure <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={googleSignIn}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.6 14.7 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.07-1.1-.16-1.6H12z"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-xs italic text-muted-foreground">
        Buon viaggio nella lingua italiana 🇮🇹
      </p>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
      />
    </label>
  );
}