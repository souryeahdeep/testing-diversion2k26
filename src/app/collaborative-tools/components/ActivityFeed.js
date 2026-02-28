const ActivityFeed = ({ activityFeedItems }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <span className="text-xs text-foreground/50">
          {activityFeedItems?.length || 0} activities
        </span>
      </div>
      <div className="space-y-3">
        {(!activityFeedItems || activityFeedItems.length === 0) ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-foreground/50">
              No recent activity. Start by adding team members, creating tasks, or scheduling meetings!
            </p>
          </div>
        ) : (
          activityFeedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-medium text-emerald-400">
                    {item.user}
                  </span>
                  <span className="text-foreground/80"> {item.action} </span>
                  <span className="font-medium">{item.target}</span>
                </p>
                <span className="text-xs text-foreground/50 whitespace-nowrap ml-3">
                  {item.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
