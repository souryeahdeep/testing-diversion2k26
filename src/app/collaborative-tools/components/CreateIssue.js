"use client";
import { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const CreateIssue = ({ onCreateIssue }) => {
  const [platform, setPlatform] = useState("github");
  const [repoVisibility, setRepoVisibility] = useState("public");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoName, setRepoName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewFileName, setReviewFileName] = useState("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdIssues, setCreatedIssues] = useState([]);
  const [openIssueNumber, setOpenIssueNumber] = useState(null);

  const extractExcelText = async (file) => {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const joined = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_csv(sheet);
    }).join("\n\n");
    return joined.trim();
  };

  const handleReviewFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormError("");
    setIsParsingFile(true);

    try {
      const fileName = file.name || "uploaded-review";
      const lower = fileName.toLowerCase();
      let parsed = "";

      if (lower.endsWith(".txt") || lower.endsWith(".csv")) {
        parsed = await file.text();
      } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        parsed = await extractExcelText(file);
      } else {
        throw new Error("Unsupported file type. Use .txt, .csv, .xlsx, or .xls");
      }

      setReviewFileName(fileName);
      setReviewText(parsed);
    } catch (error) {
      setFormError(error.message || "Failed to parse review file");
    } finally {
      setIsParsingFile(false);
    }
  };

  const fetchSuggestions = async (issue) => {
    if (issue.suggestions?.length || issue.suggestionsLoading) return;

    setCreatedIssues((prev) =>
      prev.map((item) =>
        item.number === issue.number
          ? { ...item, suggestionsLoading: true, suggestionsError: "" }
          : item
      )
    );

    try {
      const response = await fetch("/api/generate-fix-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueTitle: issue.title,
          issueDescription: issue.body,
          reviewText: issue.reviewText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch suggestions");
      }

      setCreatedIssues((prev) =>
        prev.map((item) =>
          item.number === issue.number
            ? {
                ...item,
                suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
                suggestionsLoading: false,
                suggestionsModel: data.model || "unknown",
              }
            : item
        )
      );
    } catch (error) {
      setCreatedIssues((prev) =>
        prev.map((item) =>
          item.number === issue.number
            ? {
                ...item,
                suggestionsLoading: false,
                suggestionsError: error.message || "Unable to load suggestions",
              }
            : item
        )
      );
    }
  };

  const handleIssueToggle = async (issue) => {
    const nextOpen = openIssueNumber === issue.number ? null : issue.number;
    setOpenIssueNumber(nextOpen);
    if (nextOpen === issue.number) {
      await fetchSuggestions(issue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const reviewSection = reviewText?.trim()
        ? `\n\n---\n### User Review\n${reviewText.trim()}`
        : "";

      const payload = {
        platform,
        repoVisibility,
        title,
        description: `${description || ""}${reviewSection}`.trim(),
        repoName,
        assignee,
        reviewText,
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
          body: issue.body || "",
          reviewText,
          suggestions: [],
          suggestionsLoading: false,
          suggestionsError: "",
          suggestionsModel: "",
        },
        ...prev,
      ]);

      setTitle("");
      setDescription("");
      setAssignee("");
      setReviewText("");
      
      const repoType = repoVisibility === "private" ? "private" : "public";
      setSuccessMessage(`✓ Issue #${issue.number} created successfully in ${repoType} repository!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
      setReviewFileName("");
    } catch (error) {
      setFormError(error.message || "Unable to create issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Create a New Issue</h3>
      
      {/* Token Requirements Info */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-300">🔑 GitHub Token Requirements</p>
        <div className="text-xs text-blue-200 space-y-1">
          <p><strong>Public Repositories:</strong> Works with minimal token scopes (public_repo)</p>
          <p><strong>Private Repositories:</strong> Token MUST include <code className="bg-black/30 px-1 rounded">repo</code> scope</p>
          <p className="text-blue-300/80">→ Without proper scope, you&apos;ll receive 404 or 403 errors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
          >
            <option className="bg-black" value="github">
              GitHub
            </option>
            <option className="bg-black" value="bitbucket">
              Bitbucket
            </option>
          </select>
        </div>
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
              ⚠️ Private repos require a token with <code className="bg-black/30 px-1 rounded">repo</code> scope (not just <code className="bg-black/30 px-1 rounded">public_repo</code>). Otherwise you&apos;ll get 404/403 errors.
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Repository name</label>
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
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter issue title"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue"
            rows="4"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">User Review Input</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Paste user review text here, or upload a .txt/.csv/.xlsx file below"
            rows="5"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          ></textarea>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="file"
              accept=".txt,.csv,.xlsx,.xls"
              onChange={handleReviewFileChange}
              className="text-xs text-foreground/70 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
            />
            {isParsingFile && <span className="text-xs text-foreground/70">Parsing file...</span>}
            {reviewFileName && !isParsingFile && (
              <span className="text-xs text-emerald-300">Loaded: {reviewFileName}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Assignee (GitHub username)
          </label>
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="github-username"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          />
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
        <HoverBorderGradient
          as="button"
          type="submit"
          disabled={isSubmitting || isParsingFile}
          containerClassName="w-full"
          className="bg-emerald-500 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Issue..." : "Create Issue"}
        </HoverBorderGradient>
      </form>

      {createdIssues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/90">
            Created Issues (click to view fix suggestions)
          </h4>
          {createdIssues.map((issue) => (
            <div key={issue.number} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <button
                type="button"
                onClick={() => handleIssueToggle(issue)}
                className="w-full text-left"
              >
                <p className="text-sm font-medium">#{issue.number} {issue.title}</p>
                <p className="text-xs text-emerald-300 mt-1">{issue.html_url}</p>
              </button>

              {openIssueNumber === issue.number && (
                <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-semibold text-foreground/80 mb-2">Fix Suggestions</p>
                  {issue.suggestionsLoading && (
                    <p className="text-xs text-foreground/70">Generating suggestions...</p>
                  )}
                  {!issue.suggestionsLoading && issue.suggestionsError && (
                    <p className="text-xs text-red-300">{issue.suggestionsError}</p>
                  )}
                  {!issue.suggestionsLoading && !issue.suggestionsError && issue.suggestions.length > 0 && (
                    <ul className="space-y-1 text-xs text-foreground/90">
                      {issue.suggestions.map((suggestion, index) => (
                        <li key={`${issue.number}-${index}`}>• {suggestion}</li>
                      ))}
                    </ul>
                  )}
                  {!issue.suggestionsLoading &&
                    !issue.suggestionsError &&
                    issue.suggestions.length === 0 && (
                      <p className="text-xs text-foreground/70">No suggestions available.</p>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateIssue;
