import { NextResponse } from "next/server";
import { sendSlackWebhook } from "../../../../lib/slack/sendWebHook";

export async function POST(req: Request) {
  try {
    const { name, githubId, email, role } = await req.json();

    if (!name || !githubId || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, githubId, email, and role" },
        { status: 400 }
      );
    }

    // Send Slack notification to #social channel
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const slackMessage = 
          `🎉 *New Team Member Joined!*\n\n` +
          `*Name:* ${name}\n` +
          `*GitHub:* @${githubId}\n` +
          `*Email:* ${email}\n` +
          `*Role:* ${role}\n\n` +
          `Welcome to the team! 👋`;

        await sendSlackWebhook(slackMessage);
        console.log("✅ Slack notification sent successfully");
      } catch (slackError) {
        console.error("⚠️ Failed to send Slack notification:", slackError);
        // Don't fail the request if Slack fails
      }
    } else {
      console.warn("⚠️ SLACK_WEBHOOK_URL not configured");
    }

    return NextResponse.json({
      success: true,
      message: "Team member added successfully",
      member: { name, githubId, email, role },
    });
  } catch (error) {
    console.error("Failed to add team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
