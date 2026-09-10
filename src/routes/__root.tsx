import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/italian/BottomNav";
import { FloatingLuca } from "@/components/italian/FloatingLuca";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ciao — Learn Italian" },
      {
        name: "description",
        content:
          "Learn Italian the playful way — daily vocab decks, bite-size grammar, mini-stories, speaking practice, and Luca, your AI tutor that remembers what you need.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Ciao — Learn Italian" },
      {
        property: "og:description",
        content:
          "Learn Italian the playful way — daily vocab decks, bite-size grammar, mini-stories, speaking practice, and Luca, your AI tutor that remembers what you need.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ciao — Learn Italian" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Ciao — Learn Italian" },
      {
        name: "twitter:description",
        content:
          "Learn Italian the playful way — daily vocab decks, bite-size grammar, mini-stories, speaking practice, and Luca, your AI tutor that remembers what you need.",
      },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cab44ede-3ed9-435a-9333-18e69750acbf/id-preview-e86100cc--0ed5562d-40db-4986-b268-b91a036205e2.lovable.app-1778217778531.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cab44ede-3ed9-435a-9333-18e69750acbf/id-preview-e86100cc--0ed5562d-40db-4986-b268-b91a036205e2.lovable.app-1778217778531.png" },
      { name: "google-site-verification", content: "D5F9aMmDHFCkabIsPYPkaT0uVb65knCEmOMXdYpAm_Q" },
      { name: "google-site-verification", content: "QA1H8TcdeRlAuhh26t7tmcgLHzLNdY55x8ry6LevQro" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://cdn.gpteng.co", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Ciao — Learn Italian",
          url: "https://tryitalian.com",
          description:
            "Learn Italian the playful way — daily vocab decks, bite-size grammar, mini-stories, speaking practice, and an AI tutor.",
          inLanguage: ["en", "it"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Ciao",
          url: "https://tryitalian.com",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const onLogin = loc.pathname === "/login";
  return (
    <div
      className="min-h-screen"
      style={{
        paddingBottom:
          !loading && !onLogin ? "calc(72px + env(safe-area-inset-bottom))" : 0,
      }}
    >
      <Outlet />
      {!loading && !onLogin ? <BottomNav /> : null}
      {!loading && !onLogin ? <FloatingLuca /> : null}
    </div>
  );
}
