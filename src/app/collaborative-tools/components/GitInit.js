"use client";
import { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const GitInit = ({ onPushToRepo }) => {
  // Hardcoded repository for GitInit
  const repoName = "testing-diversion2k26";
  const repoOwner = "souryeahdeep";
  
  const [commitMessage, setCommitMessage] = useState("");
  const [branchName, setBranchName] = useState("main");
  const [isPushing, setIsPushing] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPushing(true);
    setFormError("");
    setSuccessMessage("");

    try {
      if (!commitMessage) {
        throw new Error("Commit message is required");
      }

      const payload = {
        commitMessage,
        branchName,
      };

      const result = await onPushToRepo?.(payload);

      if (!result?.ok) {
        throw new Error(result?.error || "Push operation failed");
      }

      setSuccessMessage(
        `✓ Successfully pushed ${result.data?.filesCount || ''} files to ${repoName}!`
      );
      
      // Reset form
      setCommitMessage("");
      
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setFormError(error.message || "Unable to push to repository");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Git Init & Push</h3>

      {/* Target Repository Info */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-300">📦 Target Repository</p>
        <div className="text-xs text-emerald-200">
          <p className="font-medium">
            <a 
              href={`https://github.com/${repoOwner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {repoOwner}/{repoName}
            </a>
          </p>
          <p className="text-emerald-300/70 mt-1">All workspace files will be pushed automatically</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          disabled={isPushing}
          className="w-full group relative bg-gradient-to-r from-green-900 to-green-700 hover:from-green-900 hover:to-green-900 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPushing ? "Pushing to GitHub..." : "Push to Repository"}
        </button>
      </form>
    </div>
  );
};

export default GitInit;
