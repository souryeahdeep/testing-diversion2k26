"use client";
import { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const IssueManager = ({ onCreateIssue }) => {
  const [repoVisibility, setRepoVisibility] = useState("public");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoName, setRepoName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [labels, setLabels] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdIssues, setCreatedIssues] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const payload = {
        repoVisibility,
        title,
        description,
        repoName,
        assignee: assignee || undefined,
        labels: labels ? labels.split(",").map(l => l.trim()) : undefined,
      };

      const result = await onCreateIssue?.(payload);

      if (!result?.ok) {
        throw new Error(result?.error || "Issue creation failed");
      }

      const issue = result.data;
      setCreatedIssues((prev) => [
        {
          number: issue.number,
          html_url: issue.html_url,
          title: issue.title,
          state: issue.state,
        },
        ...prev,
      ]);

      setTitle("");
      setDescription("");
      setAssignee("");
      setLabels("");

      const repoType = repoVisibility === "private" ? "private" : "public";
      setSuccessMessage(
        `✓ Issue #${issue.number} created successfully in ${repoType} repository!`
      );

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setFormError(error.message || "Unable to create issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Issue Manager</h3>

      {/* Token Requirements Info */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-300">🔑 GitHub Token Requirements</p>
        <div className="text-xs text-blue-200 space-y-1">
          <p><strong>Public Repositories:</strong> Token with <code className="bg-black/30 px-1 rounded">public_repo</code> scope</p>
          <p><strong>Private Repositories:</strong> Token with full <code className="bg-black/30 px-1 rounded">repo</code> scope</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Repository Visibility</label>
          <select
            value={repoVisibility}
            onChange={(e) => setRepoVisibility(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
          >
            <option className="bg-black" value="public">
              Public Repository
            </option>
            <option className="bg-black" value="private">
              Private Repository
            </option>
          </select>
          {repoVisibility === "private" && (
            <div className="mt-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2 text-xs text-yellow-300">
              ⚠️ Private repos require token with full <code className="bg-black/30 px-1 rounded">repo</code> scope
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Repository Name</label>
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="e.g. my-repo"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Issue Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Issue Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue"
            rows="6"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Assignee <span className="text-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="github-username"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Labels <span className="text-foreground/50">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, enhancement"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {successMessage && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
            {successMessage}
          </div>
        )}
        {formError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {formError}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative bg-black text-emerald-400 text-base font-medium px-8 py-3 rounded-full flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-padding hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            style={{
              background: 'linear-gradient(black, black) padding-box, linear-gradient(90deg, #10b981, #14b8a6, #3b82f6) border-box'
            }}
          >
            {isSubmitting ? "Creating Issue..." : "Create Issue"}
          </button>
        </div>
      </form>

      {createdIssues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/90">Recently Created Issues</h4>
          {createdIssues.map((issue) => (
            <div key={issue.number} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">#{issue.number} {issue.title}</p>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-300 hover:text-emerald-400 mt-1 inline-block"
                  >
                    View on GitHub →
                  </a>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  {issue.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueManager;
