"use client";
import { useState } from "react";

export default function CreateMeet({ handleCreateMeeting, handleScheduleMeeting }) {
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
    <div className="space-y-6 p-6 bg-zinc-900 min-h-screen">
      <h3 className="text-lg font-semibold text-white">
        Create or Join a Meeting
      </h3>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleCreateMeeting}
          className="flex-1 group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3"
        >
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="tracking-wide">Create Instant Meet</span>
        </button>

        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="flex-1 group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3"
        >
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="tracking-wide">{showScheduleForm ? "Cancel Schedule" : "Schedule Meet"}</span>
        </button>

        <button
          onClick={() => alert("Joining existing meet...")}
          className="flex-1 group relative bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3"
        >
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span className="tracking-wide">Join Existing Meet</span>
        </button>
      </div>

      {showScheduleForm && (
        <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-semibold text-white mb-4">Schedule a Meeting</h4>
          <form onSubmit={handleSubmitSchedule} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Topic *
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={meetingDetails.topic}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter meeting topic"
                required
              />
            </div>

            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Agenda
              </label>
              <textarea
                id="agenda"
                name="agenda"
                value={meetingDetails.agenda}
                onChange={handleInputChange}
                rows="3"
                className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter meeting agenda"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={meetingDetails.startTime}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={meetingDetails.duration}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="participants" className="block text-sm font-medium text-gray-300 mb-2">
                Participants (comma-separated emails)
              </label>
              <input
                type="text"
                id="participants"
                name="participants"
                value={meetingDetails.participants}
                onChange={handleInputChange}
                className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={isScheduling}
                className="flex-1 group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3"
              >
                {isScheduling ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="tracking-wide">Schedule Meeting</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="flex-1 group relative bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg px-4 py-3"
              >
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="tracking-wide">Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};