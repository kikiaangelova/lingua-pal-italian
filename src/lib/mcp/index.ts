import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProgressTool from "./tools/get-progress";
import listCompletedLessonsTool from "./tools/list-completed-lessons";
import listMistakesTool from "./tools/list-mistakes";
import listVocabularyTool from "./tools/list-vocabulary";
import recordMistakeTool from "./tools/record-mistake";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "speak-italian",
  title: "Speak Italian!",
  version: "0.1.0",
  instructions:
    "Tools for the Speak Italian learning app. Read the signed-in learner's XP, streak, completed lessons, learned vocabulary and recurring mistakes, and record new mistakes for Luca to revisit.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProgressTool,
    listCompletedLessonsTool,
    listVocabularyTool,
    listMistakesTool,
    recordMistakeTool,
  ],
});
