"use client";
import { useState } from "react";

const ActivityFeed = ({ activityFeedItems, handleCreateMeeting, handleScheduleMeeting }) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    topic: "",
    agenda: "",
    startTime: "",
    duration: 60,
    participants: "",
  });
  const [isScheduling, setIsScheduling] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!meetingDetails.topic || !meetingDetails.startTime) {
      alert("Please fill in the meeting topic and start time");
      return;
    }

    setIsScheduling(true);
    try {
      await handleScheduleMeeting(meetingDetails);
      // Reset form
      setMeetingDetails({
        topic: "",
        agenda: "",
        startTime: "",
        duration: 60,
        participants: "",
      });
      setShowScheduleForm(false);
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="fl1ex ite1ms-center justify-between">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Recent Activity</h3>
        <span className="text-xs text-foreground/50">
          {activityFeedItems?.length || 0} activities
        </span>
      </div>

      {/* Compact Meeting Section */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
        <h4 className="text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Quick Meeting Actions</h4>
        <div className="flex gap-2">
          <button
            onClick={handleCreateMeeting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold h-12 px-4 rounded-md transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Instant Meet
          </button>

          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white text-sm font-semibold h-12 px-4 rounded-md transition-all duration-200 flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
          >
            {showScheduleForm ? "Cancel" : "Schedule"}
          </button>
        </div>

        {/* Compact Schedule Form */}
        {showScheduleForm && (
          <form onSubmit={handleSubmitSchedule} className="space-y-3 pt-3 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="topic"
                value={meetingDetails.topic}
                onChange={handleInputChange}
                className="col-span-2 rounded-lg bg-black/30 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
                placeholder="Meeting topic *"
                required
              />
              <input
                type="datetime-local"
                name="startTime"
                value={meetingDetails.startTime}
                onChange={handleInputChange}
                className="rounded-lg bg-black/30 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
                required
              />
              <select
                name="duration"
                value={meetingDetails.duration}
                onChange={handleInputChange}
                className="rounded-lg bg-black/30 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
              >
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
              <textarea
                name="agenda"
                value={meetingDetails.agenda}
                onChange={handleInputChange}
                rows="3"
                className="col-span-2 rounded-lg bg-black/30 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none shadow-sm"
                placeholder="Agenda (optional)"
              />
              <input
                type="text"
                name="participants"
                value={meetingDetails.participants}
                onChange={handleInputChange}
                className="col-span-2 rounded-lg bg-black/30 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
                placeholder="Participants (emails, comma-separated)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isScheduling}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 px-4 rounded-md transition-all duration-200 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                {isScheduling ? "Scheduling..." : "Schedule Meeting"}
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-sm font-semibold py-2.5 px-4 rounded-md transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
          
      {/* Activity Feed List */}
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
