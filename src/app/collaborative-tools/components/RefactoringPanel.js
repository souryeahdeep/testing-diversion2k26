import Link from "next/link";
import { ROUTES } from "../../../routes";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const RefactoringPanel = ({ refactoringSuggestions }) => {
  return (
    <aside className="w-96 border-l border-white/10 bg-white/5 p-6">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">AI Refactoring Suggestions</h2>

        <div className="space-y-4">
          {refactoringSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium">{suggestion.file}</h4>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      suggestion.complexity === "High"
                        ? "bg-red-500/20 text-red-400"
                        : suggestion.complexity === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {suggestion.complexity}
                  </span>
                </div>

                <p className="text-sm text-foreground/80">
                  {suggestion.suggestion}
                </p>

                <div className="space-y-2 text-xs">
                  <p>
                    <span className="text-foreground/60">Original Author:</span>
                    <span className="ml-1 font-medium text-emerald-400">
                      {suggestion.originalAuthor}
                    </span>
                  </p>
                  <p>
                    <span className="text-foreground/60">Reviewers:</span>
                    <span className="ml-1">
                      {suggestion.reviewers.join(", ")}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <HoverBorderGradient
                    as="button"
                    className="bg-emerald-500/20 text-emerald-400 text-xs font-medium"
                  >
                    Accept
                  </HoverBorderGradient>
                  <HoverBorderGradient
                    as="button"
                    className="bg-white/10 text-foreground/80 text-xs font-medium"
                  >
                    Discuss
                  </HoverBorderGradient>
                  <HoverBorderGradient
                    as="button"
                    className="bg-red-500/20 text-red-400 text-xs font-medium"
                  >
                    Dismiss
                  </HoverBorderGradient>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
          <h4 className="text-sm font-medium text-violet-400">
            Smart Collaboration
          </h4>
          <p className="mt-2 text-xs text-foreground/80">
            AI automatically routes refactoring suggestions to original code
            authors first, escalates complex changes to senior developers, and
            tracks collaboration patterns.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          className="inline-block text-sm text-emerald-400 hover:underline"
          href={ROUTES.home}
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
};

export default RefactoringPanel;
