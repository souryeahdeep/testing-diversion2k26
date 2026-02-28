"use client";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const ContributorSidebar = ({ collaborators, setIsDialogOpen }) => {
  return (
    <aside className="w-80 border-r border-white/10 bg-white/5 p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Team Members</h2>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search contributors..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-foreground/50 focus:border-emerald-400 focus:outline-none focus:ring-0"
          />
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 text-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Collaborators List */}
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 p-3"
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-black">
                  {collaborator.avatar}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                    collaborator.online ? "bg-green-400" : "bg-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {collaborator.name}
                </p>
                <p className="text-xs text-foreground/60">
                  {collaborator.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Members Button */}
        <HoverBorderGradient
          as="button"
          onClick={() => setIsDialogOpen(true)}
          containerClassName="w-full"
          className="group relative w-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:to-blue-500/30 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="tracking-wide">Add Team Member</span>
          <svg
            className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </HoverBorderGradient>
      </div>
    </aside>
  );
};

export default ContributorSidebar;
