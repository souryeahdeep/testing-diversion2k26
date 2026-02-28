import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const AddTeamMemberDialog = ({
  isDialogOpen,
  handleCloseDialog,
  handleAddMember,
  isAddingMember,
  memberName,
  setMemberName,
  memberEmail,
  setMemberEmail,
  memberGithubId,
  setMemberGithubId,
  role,
  setRole,
}) => {
  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 w-[480px] max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub ID *
            </label>
            <input
              type="text"
              value={memberGithubId}
              onChange={(e) => setMemberGithubId(e.target.value)}
              placeholder="@username"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-0"
            >
              <option className="bg-black" value="">
                Select a role
              </option>
              <option className="bg-black" value="Senior Developer">
                Senior Developer
              </option>
              <option className="bg-black" value="Frontend Developer">
                Frontend Developer
              </option>
              <option className="bg-black" value="Backend Developer">
                Backend Developer
              </option>
              <option className="bg-black" value="DevOps Engineer">
                DevOps Engineer
              </option>
              <option className="bg-black" value="QA Engineer">
                QA Engineer
              </option>
              <option className="bg-black" value="UI/UX Designer">
                UI/UX Designer
              </option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <HoverBorderGradient
            as="button"
            onClick={handleAddMember}
            disabled={!memberName || !memberGithubId || !memberEmail || !role || isAddingMember}
            containerClassName="flex-1"
            className="bg-emerald-500 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingMember ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                Adding Member...
              </span>
            ) : (
              "Add Member"
            )}
          </HoverBorderGradient>
          <HoverBorderGradient
            as="button"
            onClick={handleCloseDialog}
            disabled={isAddingMember}
            containerClassName="flex-1"
            className="bg-zinc-800 text-zinc-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </HoverBorderGradient>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberDialog;
