"use client";
import { useState, useEffect } from "react";
import plantumlEncoder from "plantuml-encoder";
import ContributorSidebar from "./components/ContributorSidebar";
import MainPanel from "./components/MainPanel";
import RefactoringPanel from "./components/RefactoringPanel";
import AddTaskDialog from "./components/AddTaskDialog";
import AddTeamMemberDialog from "./components/AddTeamMemberDialog";
import ActivityFeed from "./components/ActivityFeed";
import TaskBoard from "./components/TaskBoard";
import UMLDiagramGenerator from "./components/UMLDiagramGenerator";
import CreateMeet from "./components/CreateMeet";
import GitInit from "./components/GitInit";
import IssueManager from "./components/IssueManager";

const collaborators = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "AJ",
    online: true,
    role: "Senior Developer",
  },
  {
    id: 2,
    name: "Bob Chen",
    avatar: "BC",
    online: true,
    role: "Frontend Developer",
  },
  {
    id: 3,
    name: "Carol Davis",
    avatar: "CD",
    online: false,
    role: "Backend Developer",
  },
  {
    id: 4,
    name: "David Wilson",
    avatar: "DW",
    online: true,
    role: "DevOps Engineer",
  },
];

const activityFeedItems = [
 
];

const tasks = [
  {
    id: 1,
    title: "Fix authentication bug",
    assignee: "Carol Davis",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 2,
    title: "Add unit tests for API",
    assignee: "Bob Chen",
    status: "To Do",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Update documentation",
    assignee: "Alice Johnson",
    status: "Done",
    priority: "Low",
  },
  {
    id: 4,
    title: "Refactor legacy code",
    assignee: "David Wilson",
    status: "To Do",
    priority: "High",
  },
];

const refactoringSuggestions = [
  {
    id: 1,
    file: "auth/UserService.js",
    suggestion: "Extract authentication logic into separate service",
    complexity: "Medium",
    originalAuthor: "Carol Davis",
    reviewers: ["Alice Johnson"],
  },
  {
    id: 2,
    file: "utils/DataProcessor.js",
    suggestion: "Simplify nested conditional statements",
    complexity: "Low",
    originalAuthor: "Bob Chen",
    reviewers: ["David Wilson"],
  },
];

export default function CollaborativeToolsPage() {
  const [activeTab, setActiveTab] = useState("activity");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [collaboratorsList, setCollaboratorsList] = useState(collaborators);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberGithubId, setMemberGithubId] = useState("");
  const [role, setRole] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [activityFeed, setActivityFeed] = useState(activityFeedItems);
  const [tasksState, setTasksState] = useState(tasks);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskStatus, setNewTaskStatus] = useState("To Do");

  // UML Diagram Generator state
  const [repositoryDescription, setRepositoryDescription] = useState("");
  const [plantUmlImage, setPlantUmlImage] = useState("");
  const [isGeneratingPlantUml, setIsGeneratingPlantUml] = useState(false);
  const [plantUmlError, setPlantUmlError] = useState("");
  const [shouldAutoGenerateFromUrl, setShouldAutoGenerateFromUrl] =
    useState(false);
  // UML Diagram Generator state

  // ↓ Add these missing ones
  const [generatedUML, setGeneratedUML] = useState("");
  const [isGeneratingUML, setIsGeneratingUML] = useState(false);
  const [umlError, setUmlError] = useState("");
  const [aiInsights, setAiInsights] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // Helper function to add activity
  const addActivity = (user, action, target) => {
    const newActivity = {
      id: Date.now(),
      user,
      action,
      target,
      time: "Just now",
    };
    setActivityFeed((prev) => [newActivity, ...prev]);
  };
  const handleCreateIssue = async ({
    platform,
    title,
    description,
    repoName,
    assignee,
    reviewText,
    labels,
    repoVisibility,
  }) => {
    try {
      const res = await fetch("/api/github/createIssue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body: description,
          repoName,
          assignee,
          reviewText,
          labels,
          repoVisibility,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const details = data?.error || "Unknown error";
        return { ok: false, error: `Issue creation failed: ${details}` };
      }

      // Log activity
      addActivity(assignee || "Unassigned", "created issue", `"${title}" in ${repoName}`);

      return {
        ok: true,
        data,
        meta: {
          platform,
          repoName,
          assignee,
        },
      };
    } catch (err) {
      console.error("Create issue request failed", err);
      return {
        ok: false,
        error: "Issue creation failed. Check console for details.",
      };
    }
  };

  const handlePushToRepo = async ({
    commitMessage,
    branchName,
  }) => {
    try {
      const res = await fetch("/api/github/pushWorkspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commitMessage,
          branchName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const details = data?.error || "Unknown error";
        return { ok: false, error: `Push failed: ${details}` };
      }

      // Log activity
      addActivity("System", "pushed workspace to", `testing-diversion2k26 (${data.filesCount} files)`);

      return { ok: true, data };
    } catch (err) {
      console.error("Push to repo request failed", err);
      return {
        ok: false,
        error: "Push failed. Check console for details.",
      };
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const res = await fetch("/api/zoom", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const { join_url } = await res.json();
      
      // Log activity
      addActivity("System", "created instant meeting", "Zoom Meeting");
      
      window.open(join_url, "_blank");
    } catch (error) {
      console.error("Failed to create meeting:", error);
      alert("Failed to create meeting. See console for details.");
    }
  };

  const handleScheduleMeeting = async (meetingDetails) => {
    try {
      const res = await fetch("/api/zoom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingDetails),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      
      const data = await res.json();

      // Log activity
      const meetingTime = new Date(meetingDetails.startTime).toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        month: 'short',
        day: 'numeric'
      });
      addActivity("System", "scheduled meeting", `"${meetingDetails.topic}" for ${meetingTime}`);

      alert(
        `Meeting scheduled successfully!\n\n` +
        `Topic: ${meetingDetails.topic}\n` +
        `Start Time: ${new Date(meetingDetails.startTime).toLocaleString()}\n` +
        `Duration: ${meetingDetails.duration} minutes\n\n` +
        `A notification has been sent to Slack!\n\n` +
        `Join URL: ${data.join_url}`
      );
      
      // Optionally open the join URL
      if (confirm("Would you like to open the meeting URL?")) {
        window.open(data.join_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      alert(`Failed to schedule meeting: ${error.message}`);
      throw error;
    }
  };

  useEffect(() => {
    async function sendData() {
      const res = await fetch("/api/repository", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log(data);
      setRepositoryDescription(data.repositoryDescription);
    }
    sendData();
  }, []);

  const handleAddMember = async () => {
    setIsAddingMember(true);
    try {
      // Send to API which will trigger Slack notification
      const response = await fetch("/api/team/addMember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: memberName,
          githubId: memberGithubId,
          email: memberEmail,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add member");
      }

      // Create new member object
      const newMember = {
        id: collaboratorsList.length + 1,
        name: memberName,
        avatar: memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        online: true,
        role: role,
        email: memberEmail,
        githubId: memberGithubId,
      };

      // Add to collaborators list
      setCollaboratorsList([...collaboratorsList, newMember]);

      // Log activity
      addActivity(memberName, "joined the team as", role);

      // Show success notification
      alert(`✅ Team Member Added Successfully!\n\nName: ${memberName}\nGitHub ID: ${memberGithubId}\nEmail: ${memberEmail}\nRole: ${role}\n\n📢 Notification sent to Slack #social channel!`);

      // Reset form and close dialog
      setMemberName("");
      setMemberEmail("");
      setMemberGithubId("");
      setRole("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add member:", error);
      alert(`❌ Failed to add team member: ${error.message}`);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleCloseDialog = () => {
    setMemberName("");
    setMemberEmail("");
    setMemberGithubId("");
    setRole("");
    setIsDialogOpen(false);
  };

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskAssignee) return;

    const newTask = {
      id: tasksState.length + 1,
      title: newTaskTitle,
      assignee: newTaskAssignee,
      status: newTaskStatus,
      priority: newTaskPriority,
    };

    setTasksState([...tasksState, newTask]);

    // Log activity
    addActivity(newTaskAssignee, "was assigned task", `"${newTaskTitle}"`);

    // Reset form and close dialog
    setNewTaskTitle("");
    setNewTaskAssignee("");
    setNewTaskPriority("Medium");
    setNewTaskStatus("To Do");
    setIsTaskDialogOpen(false);
  };

  const handleCloseTaskDialog = () => {
    setNewTaskTitle("");
    setNewTaskAssignee("");
    setNewTaskPriority("Medium");
    setNewTaskStatus("To Do");
    setIsTaskDialogOpen(false);
  };

  const generatePlantUmlPng = async (description) => {
    if (!description) {
      setPlantUmlError("Repository description is empty.");
      return;
    }

    setIsGeneratingPlantUml(true);
    setPlantUmlError("");
    setPlantUmlImage("");

    try {
      const encoded = plantumlEncoder.encode(description);
      const imageUrl = `http://www.plantuml.com/plantuml/png/${encoded}`;

      // To avoid CORS issues in a browser environment, we can't directly fetch
      // and display the image from the PlantUML server if it doesn't send the right headers.
      // A common workaround is to just use the URL in an <img> tag.
      // If we needed to process the image data (e.g., save to a file server-side),
      // we would fetch it from a backend proxy.
      setPlantUmlImage(imageUrl);
    } catch (error) {
      console.error("Error generating PlantUML PNG:", error);
      setPlantUmlError(
        "Failed to generate PlantUML diagram. Check the console for details.",
      );
    } finally {
      setIsGeneratingPlantUml(false);
    }
  };

  const handleGenerateUML = async (description) => {
    setIsGeneratingUML(true);
    setUmlError("");
    setAiInsights("");
    setAiModel("");
    try {
      const response = await fetch("/api/generate-uml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate UML");
      setGeneratedUML(data.uml); // expects { uml: "mermaid code..." }
      setAiInsights(data.insights || ""); // AI-generated insights
      setAiModel(data.model || "openrouter/auto"); // Model used
    } catch (err) {
      setUmlError(err.message);
    } finally {
      setIsGeneratingUML(false);
    }
  };

  const handleGenerateTasks = async () => {
    if (!repositoryDescription) {
      alert("Please provide a repository description first. Go to the UML tab to add it.");
      return;
    }

    setIsGeneratingTasks(true);
    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryDescription }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }

      // Add generated tasks to existing tasks
      const newTasks = data.tasks.map((task, index) => ({
        ...task,
        id: tasksState.length + index + 1,
      }));

      setTasksState([...tasksState, ...newTasks]);

      // Log activity
      addActivity("AI Assistant", "generated", `${data.count} new tasks`);

      alert(`✅ Successfully generated ${data.count} tasks using AI!`);
    } catch (error) {
      console.error("Failed to generate tasks:", error);
      alert(`Failed to generate tasks: ${error.message}`);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const handleAddSuggestionTasks = (newTasks) => {
    if (!Array.isArray(newTasks) || newTasks.length === 0) return;
    setTasksState((prev) => [...prev, ...newTasks]);

    // Log activity
    addActivity("Issue Solver", "added", `${newTasks.length} suggested fix tasks`);
  };

  const renderMermaidDiagram = (code) => {
    return (
      <pre className="rounded-lg bg-black/20 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
        <code className="text-green-400">{code}</code>
      </pre>
    );
  };

  useEffect(() => {
    if (repositoryDescription && shouldAutoGenerateFromUrl) {
      generatePlantUmlPng(repositoryDescription);
    }
  }, [repositoryDescription, shouldAutoGenerateFromUrl]);

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      <ContributorSidebar
        collaborators={collaboratorsList}
        setIsDialogOpen={setIsDialogOpen}
      />
      <MainPanel activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === "activity" && (
            <ActivityFeed activityFeedItems={activityFeed} />
          )}
          {activeTab === "tasks" && (
            <TaskBoard
              tasksState={tasksState}
              setIsTaskDialogOpen={setIsTaskDialogOpen}
              onGenerateTasks={handleGenerateTasks}
              isGeneratingTasks={isGeneratingTasks}
              onAddSuggestionTasks={handleAddSuggestionTasks}
            />
          )}
          {activeTab === "refactoring" && (
            <RefactoringPanel suggestions={refactoringSuggestions} />
          )}
          {activeTab === "uml" && (
            <UMLDiagramGenerator
              repositoryDescription={repositoryDescription}
              setRepositoryDescription={setRepositoryDescription}
              plantUmlImage={plantUmlImage}
              isGeneratingPlantUml={isGeneratingPlantUml}
              plantUmlError={plantUmlError}
              generatePlantUmlPng={() =>
                generatePlantUmlPng(repositoryDescription)
              }
              isGeneratingUML={isGeneratingUML}
              umlError={umlError}
              generatedUML={generatedUML}
              renderMermaidDiagram={renderMermaidDiagram}
              handleGenerateUML={() => handleGenerateUML(repositoryDescription)}
              aiInsights={aiInsights}
              aiModel={aiModel}
            />
          )}
          {activeTab === "create-meet" && (
            <CreateMeet 
              handleCreateMeeting={handleCreateMeeting}
              handleScheduleMeeting={handleScheduleMeeting}
            />
          )}
          {activeTab === "git-init" && (
            <GitInit onPushToRepo={handlePushToRepo} />
          )}
          {activeTab === "issue-manager" && (
            <IssueManager onCreateIssue={handleCreateIssue} />
          )}
        </div>
      </MainPanel>
      <AddTaskDialog
        isTaskDialogOpen={isTaskDialogOpen}
        handleCloseTaskDialog={handleCloseTaskDialog}
        handleAddTask={handleAddTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        newTaskAssignee={newTaskAssignee}
        setNewTaskAssignee={setNewTaskAssignee}
        newTaskPriority={newTaskPriority}
        setNewTaskPriority={setNewTaskPriority}
        newTaskStatus={newTaskStatus}
        setNewTaskStatus={setNewTaskStatus}
        collaborators={collaboratorsList}
      />
      <AddTeamMemberDialog
        isDialogOpen={isDialogOpen}
        handleCloseDialog={handleCloseDialog}
        handleAddMember={handleAddMember}
        isAddingMember={isAddingMember}
        memberName={memberName}
        setMemberName={setMemberName}
        memberEmail={memberEmail}
        setMemberEmail={setMemberEmail}
        memberGithubId={memberGithubId}
        setMemberGithubId={setMemberGithubId}
        role={role}
        setRole={setRole}
      />
    </main>
  );
}
