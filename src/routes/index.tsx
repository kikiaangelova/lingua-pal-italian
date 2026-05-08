import { createFileRoute } from "@tanstack/react-router";
import { ItalianApp } from "@/components/italian/ItalianApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ciao — Learn Italian Beautifully" },
      {
        name: "description",
        content:
          "Learn Italian with elegant flashcards, themed vocabulary, and quick daily practice. Buongiorno!",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <ItalianApp />;
}
