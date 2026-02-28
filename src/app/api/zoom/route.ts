import { NextResponse } from "next/server";

async function sendSlackWebhook(message: string) {
  const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  const result = await response.text();
  console.log("Slack status:", response.status);
  console.log("Slack response:", result);

  return response.ok;
}

async function getZoomAccessToken() {
  const { 
    ZOOM_ACCOUNT_ID, 
    ZOOM_CLIENT_ID, 
    ZOOM_CLIENT_SECRET 
  } = process.env;

  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error("Zoom OAuth credentials are missing");
  }

  // ✅ DEFINE credentials properly
  const credentials = Buffer.from(
    `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "account_credentials",
      account_id: ZOOM_ACCOUNT_ID,
    }),
  });

  const data = await response.json(); // read only once

  if (!response.ok) {
    throw new Error(`Failed to get Zoom token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, agenda, startTime, duration, participants } = body;

    const accessToken = await getZoomAccessToken();
    console.log("Access Token:", accessToken);

    // Determine meeting type: instant (1) or scheduled (2)
    const meetingType = startTime ? 2 : 1;
    
    const meetingConfig: any = {
      topic: topic || "New Meeting",
      type: meetingType,
      settings: {
        join_before_host: false,
        waiting_room: true,
      },
    };

    // Add scheduled meeting specific fields
    if (meetingType === 2 && startTime) {
      meetingConfig.start_time = new Date(startTime).toISOString();
      meetingConfig.duration = parseInt(duration) || 60;
      meetingConfig.timezone = "UTC";
      
      if (agenda) {
        meetingConfig.agenda = agenda;
      }
    }

    const response = await fetch(
      `https://api.zoom.us/v2/users/${process.env.ZOOM_USER_EMAIL}/meetings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(meetingConfig),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Zoom API error:", errorData);

      return NextResponse.json(
        { error: "Failed to create Zoom meeting", details: errorData },
        { status: response.status },
      );
    }

    const meetingData = await response.json();

    // Send notification to Slack
    try {
      const meetingTypeText = meetingType === 1 ? "Instant" : "Scheduled";
      const startTimeText = startTime 
        ? `\nStart Time: ${new Date(startTime).toLocaleString()}` 
        : "";
      const durationText = duration ? `\nDuration: ${duration} minutes` : "";
      const agendaText = agenda ? `\nAgenda: ${agenda}` : "";
      const participantsText = participants ? `\nParticipants: ${participants}` : "";
      
      const slackMessage = `🎥 *${meetingTypeText} Zoom Meeting Created*\n\n` +
        `*Topic:* ${meetingConfig.topic}${startTimeText}${durationText}${agendaText}${participantsText}\n\n` +
        `*Join URL:* ${meetingData.join_url}\n` +
        `*Meeting ID:* ${meetingData.id}`;
      
      await sendSlackWebhook(slackMessage);
      console.log("Slack notification sent successfully");
    } catch (slackError) {
      console.error("Failed to send Slack notification:", slackError);
      // Don't fail the request if Slack notification fails
    }

    return NextResponse.json({
      id: meetingData.id,
      join_url: meetingData.join_url,
      start_url: meetingData.start_url,
      start_time: meetingData.start_time,
      duration: meetingData.duration,
    });
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
