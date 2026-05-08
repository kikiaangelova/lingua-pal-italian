import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, Flame, Trophy, BookCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProgress, levelFor, fetchLearnedWords, fetchCompletedLessons, fetchCompletedStories } from "@/lib/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const EMOJIS = ["🇮🇹", "🍕", "☕", "🍝", "🌻", "🎨", "🍷", "🛵", "🏛️"];

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🇮🇹");
  const [stats, setStats] = useState({ xp: 0, streak: 0, words: 0, lessons: 0, stories: 0 });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_emoji")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.display_name ?? "");
        setEmoji(data?.avatar_emoji ?? "🇮🇹");
      });
    Promise.all([
      fetchProgress(user.id),
      fetchLearnedWords(user.id),
      fetchCompletedLessons(user.id),
      fetchCompletedStories(user.id),
    ]).then(([p, w, l, s]) => {
      setStats({
        xp: p?.xp ?? 0,
        streak: p?.streak ?? 0,
        words: w.length,
        lessons: l.length,
        stories: s.length,
      });
    });
  }, [user]);

  if (!user) return null;

  const lvl = levelFor(stats.xp);

  const save = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name, avatar_emoji: emoji })
      .eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Saved!");
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        Il tuo <em className="font-display italic text-primary">profilo</em>
      </h1>

      <section
        className="mt-6 rounded-3xl border border-border/60 bg-card p-6"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-4xl">
            {emoji}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{lvl.current.name}</p>
            <p className="font-display text-2xl font-semibold">{name || user.email}</p>
            <p className="text-sm text-muted-foreground">{stats.xp} XP total</p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Display name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-foreground outline-none focus:border-primary"
          />
        </label>

        <div className="mt-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Avatar</span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={
                  "h-12 w-12 rounded-xl border text-2xl transition " +
                  (emoji === e ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40")
                }
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <Save className="h-4 w-4" /> Save
        </button>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Flame className="h-4 w-4 text-primary" />} label="Streak" value={`${stats.streak}d`} />
        <Stat icon={<Trophy className="h-4 w-4 text-secondary" />} label="Words" value={String(stats.words)} />
        <Stat icon={<BookCheck className="h-4 w-4 text-foreground" />} label="Lessons" value={String(stats.lessons)} />
      </section>

      <button
        onClick={async () => {
          await signOut();
          navigate({ to: "/login" });
        }}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-card p-4 text-center"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-center justify-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}