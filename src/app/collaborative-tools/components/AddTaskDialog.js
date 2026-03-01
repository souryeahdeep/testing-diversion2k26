const AddTaskDialog = ({
  isTaskDialogOpen,
  handleCloseTaskDialog,
  handleAddTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskAssignee,
  setNewTaskAssignee,
  newTaskPriority,
  setNewTaskPriority,
  newTaskStatus,
  setNewTaskStatus,
  newTaskDescription,
  setNewTaskDescription,
  newTaskDeadline,
  setNewTaskDeadline,
  collaborators,
}) => {
  if (!isTaskDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 w-130 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-foreground/50">(optional)</span>
            </label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description"
              rows="4"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Assign To</label>
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
            >
              <option value="">Select a member</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Deadline <span className="text-foreground/50">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle || !newTaskAssignee}
            className="flex-1 bg-black text-emerald-400 text-sm font-medium px-6 py-2.5 rounded-full border-2 border-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            style={{
              background: 'linear-gradient(black, black) padding-box, linear-gradient(90deg, #10b981, #14b8a6, #3b82f6) border-box'
            }}
          >
            ✓ Add Task
          </button>
          <button
            onClick={handleCloseTaskDialog}
            className="flex-1 bg-zinc-800 text-zinc-300 text-sm font-medium px-6 py-2.5 rounded-full border-2 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-300"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskDialog;
