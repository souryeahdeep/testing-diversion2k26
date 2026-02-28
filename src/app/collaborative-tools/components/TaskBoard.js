import { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const TaskBoard = ({
  tasksState,
  setIsTaskDialogOpen,
  onGenerateTasks,
  isGeneratingTasks,
  onAddSuggestionTasks,
}) => {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewFileName, setReviewFileName] = useState("");
  const [issueError, setIssueError] = useState("");
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [createdIssues, setCreatedIssues] = useState([]);
  const [openIssueNumber, setOpenIssueNumber] = useState(null);
  const [taskImportMessage, setTaskImportMessage] = useState("");

  const extractExcelText = async (file) => {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    return workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_csv(sheet);
    })
      .join("\n\n")
      .trim();
  };

  const handleReviewFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIssueError("");
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
      setIssueError(error.message || "Failed to parse review file");
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

      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

      if (suggestions.length > 0) {
        const toDoTasks = suggestions.map((suggestion, index) => ({
          id: Date.now() + index,
          title: suggestion,
          priority: "Medium",
          status: "To Do",
          assignee: "",
          category: "Issue Fix",
        }));
        onAddSuggestionTasks?.(toDoTasks);
        setTaskImportMessage(
          `${toDoTasks.length} suggestion${toDoTasks.length > 1 ? "s" : ""} added to To Do.`
        );
      }

      setCreatedIssues((prev) =>
        prev.map((item) =>
          item.number === issue.number
            ? {
                ...item,
                suggestions,
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

  const handleCreateIssueFromReview = async () => {
    if (!issueTitle) {
      setIssueError("Issue title is required.");
      return;
    }

    setIsCreatingIssue(true);
    setIssueError("");

    try {
      const issue = {
        number: Date.now(),
        title: issueTitle,
        body: issueDescription || "",
      };
      setCreatedIssues((prev) => [
        {
          number: issue.number,
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

      setIssueTitle("");
      setIssueDescription("");
      setReviewText("");
      setReviewFileName("");
    } catch (error) {
      setIssueError(error.message || "Unable to create issue");
    } finally {
      setIsCreatingIssue(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Task Board</h3>
        <div className="flex gap-2">
          <HoverBorderGradient
            as="button"
            onClick={onGenerateTasks}
            disabled={isGeneratingTasks}
            className="bg-purple-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGeneratingTasks ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <span>🤖</span>
                Generate Tasks
              </>
            )}
          </HoverBorderGradient>
          <HoverBorderGradient
            as="button"
            onClick={() => setIsTaskDialogOpen(true)}
            className="bg-emerald-500 text-black text-sm font-medium"
          >
            + Add Task
          </HoverBorderGradient>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="mb-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
        <p className="text-xs text-purple-300">
          💡 <span className="font-semibold">AI Task Generation:</span> Click &quot;Generate Tasks&quot; to automatically scan your repository and create actionable tasks using AI. Make sure to provide repository description in the UML tab first.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-3">
        <h4 className="text-sm font-semibold">Issue Solver & Fix Suggestions</h4>
        {taskImportMessage && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
            {taskImportMessage}
          </div>
        )}
        <input
          type="text"
          value={issueTitle}
          onChange={(e) => setIssueTitle(e.target.value)}
          placeholder="Issue title"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
        />
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          placeholder="Describe the issue context"
          rows="3"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
        ></textarea>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Paste user review text, or upload .txt/.csv/.xlsx below"
          rows="4"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
        ></textarea>
        <div className="flex items-center gap-3">
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
        {issueError && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {issueError}
          </div>
        )}
        <HoverBorderGradient
          as="button"
          onClick={handleCreateIssueFromReview}
          disabled={isCreatingIssue || isParsingFile}
          className="bg-emerald-500 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingIssue ? "Creating Issue..." : "Create Issue"}
        </HoverBorderGradient>

        {createdIssues.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/80">
              Created Issues (click to view fix suggestions)
            </p>
            {createdIssues.map((issue) => (
              <div key={issue.number} className="rounded-md border border-white/10 bg-black/20 p-3">
                <button
                  type="button"
                  onClick={() => handleIssueToggle(issue)}
                  className="w-full text-left"
                >
                  <p className="text-sm font-medium">#{issue.number} {issue.title}</p>
                  <p className="text-xs text-foreground/60 mt-1">Click to view fix suggestions</p>
                </button>
                {openIssueNumber === issue.number && (
                  <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-2">
                    <p className="text-xs font-semibold mb-1">Fix Suggestions</p>
                    {issue.suggestionsLoading && (
                      <p className="text-xs text-foreground/70">Generating suggestions...</p>
                    )}
                    {!issue.suggestionsLoading && issue.suggestionsError && (
                      <p className="text-xs text-red-300">{issue.suggestionsError}</p>
                    )}
                    {!issue.suggestionsLoading &&
                      !issue.suggestionsError &&
                      issue.suggestions.length > 0 && (
                        <ul className="space-y-1 text-xs text-foreground/90">
                          {issue.suggestions.map((suggestion, index) => (
                            <li key={`${issue.number}-${index}`}>• {suggestion}</li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold mb-4 text-center text-red-400">
            To Do
          </h4>
          <div className="space-y-3">
            {(tasksState || [])
              .filter((t) => t && t.status === "To Do")
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-800 border border-white/10 rounded-lg p-3 space-y-2"
                >
                  <p className="font-medium text-sm">{task.title}</p>
                  {task.category && (
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        task.priority === "High"
                          ? "bg-red-500/20 text-red-400"
                          : task.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-foreground/60">{task.assignee || "Unassigned"}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold mb-4 text-center text-yellow-400">
            In Progress
          </h4>
          <div className="space-y-3">
            {(tasksState || [])
              .filter((t) => t && t.status === "In Progress")
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-800 border border-white/10 rounded-lg p-3 space-y-2"
                >
                  <p className="font-medium text-sm">{task.title}</p>
                  {task.category && (
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        task.priority === "High"
                          ? "bg-red-500/20 text-red-400"
                          : task.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-foreground/60">{task.assignee || "Unassigned"}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-semibold mb-4 text-center text-green-400">
            Done
          </h4>
          <div className="space-y-3">
            {(tasksState || [])
              .filter((t) => t && t.status === "Done")
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-800 border border-white/10 rounded-lg p-3 space-y-2"
                >
                  <p className="font-medium text-sm line-through text-foreground/60">
                    {task.title}
                  </p>
                  {task.category && (
                    <span className="text-xs text-blue-400/60 bg-blue-500/10 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        task.priority === "High"
                          ? "bg-red-500/20 text-red-400"
                          : task.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-foreground/60">{task.assignee || "Unassigned"}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
