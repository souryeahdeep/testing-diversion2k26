"use client";
import { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const IssueManager = ({ onCreateIssue, onPushToRepo }) => {
  const [activeView, setActiveView] = useState("issue"); // "issue" or "git"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [labels, setLabels] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdIssues, setCreatedIssues] = useState([]);

  // Repository names
  const issueRepoName = "CollegeSaathi"; // For Issue Manager
  const gitRepoName = "testing-diversion2k26"; // For Git Init
  const repoOwner = "souryeahdeep";
  const [commitMessage, setCommitMessage] = useState("");
  const [branchName, setBranchName] = useState("main");
  const [isPushing, setIsPushing] = useState(false);
  const [pushError, setPushError] = useState("");
  const [pushSuccess, setPushSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const payload = {
        platform: "github",
        title,
        description,
        repoName: issueRepoName,
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

      setSuccessMessage(
        `✓ Issue #${issue.number} created successfully!`
      );

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setFormError(error.message || "Unable to create issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePush = async (e) => {
    e.preventDefault();
    setPushError("");
    setPushSuccess("");
    if (!commitMessage) {
      setPushError("Commit message is required");
      return;
    }
    setIsPushing(true);
    try {
      const result = await onPushToRepo?.({ commitMessage, branchName });
      if (!result?.ok) {
        throw new Error(result?.error || "Push operation failed");
      }
      setPushSuccess(
        `✓ Successfully pushed ${result.data?.filesCount || ""} files to ${gitRepoName}!`
      );
      setCommitMessage("");
      setTimeout(() => setPushSuccess(""), 5000);
    } catch (error) {
      setPushError(error.message || "Unable to push to repository");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView("issue")}
          className={`flex-1 text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
            activeView === "issue"
              ? "bg-blue-600 text-white"
              : "bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10"
          }`}
        >
          Issue Manager
        </button>
        <button
          onClick={() => setActiveView("git")}
          className={`flex-1 text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
            activeView === "git"
              ? "bg-green-600 text-white"
              : "bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10"
          }`}
        >
          Git Init & Push
        </button>
      </div>

      {/* Issue Manager View */}
      {activeView === "issue" && (
        <>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
      </>
      )}

      {/* Git Init & Push View */}
      {activeView === "git" && (
        <>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-300">Target Repository</p>
          <div className="text-xs text-emerald-200">
            <p className="font-medium">
              <a
                href={`https://github.com/${repoOwner}/${gitRepoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {repoOwner}/{gitRepoName}
              </a>
            </p>
            <p className="text-emerald-300/70 mt-1">All workspace files will be pushed automatically</p>
          </div>
        </div>

        <form onSubmit={handlePush} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Branch Name</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="main"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Commit Message</label>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Initial commit"
              rows="3"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            ></textarea>
          </div>

          {pushSuccess && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
              {pushSuccess}
            </div>
          )}
          {pushError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
              {pushError}
            </div>
          )}

          <button
            type="submit"
            disabled={isPushing}
            className="w-full bg-gradient-to-r from-green-900 to-green-700 hover:from-green-900 hover:to-green-900 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPushing ? "Pushing to GitHub..." : "Push to Repository"}
          </button>
        </form>
        </>
      )}
    </div>
  );
};

export default IssueManager;
