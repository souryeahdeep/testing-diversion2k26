import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const MainPanel = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="flex-1 flex flex-col">
     

      {/* Main Panel Tabs */}
      <div className="flex-1 p-6">
        <div className="h-full">
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-white/10">
            <nav className="flex space-x-4">
              <HoverBorderGradient
                as="button"
                onClick={() => setActiveTab("activity")}
                className={`text-sm font-medium ${
                  activeTab === "activity"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-foreground/60"
                }`}
              >
                Activity Feed
              </HoverBorderGradient>
              <HoverBorderGradient
                as="button"
                onClick={() => setActiveTab("tasks")}
                className={`text-sm font-medium ${
                  activeTab === "tasks"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-foreground/60"
                }`}
              >
                Tasks
              </HoverBorderGradient>
              <HoverBorderGradient
                as="button"
                onClick={() => setActiveTab("uml")}
                className={`text-sm font-medium ${
                  activeTab === "uml"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-foreground/60"
                }`}
              >
                UML Diagram Generator
              </HoverBorderGradient>
              <HoverBorderGradient
                as="button"
                onClick={() => setActiveTab("issue-manager")}
                className={`text-sm font-medium ${
                  activeTab === "issue-manager"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-foreground/60"
                }`}
              >
                Issue Manager
              </HoverBorderGradient>
            </nav>
          </div>

          {/* Tab Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
