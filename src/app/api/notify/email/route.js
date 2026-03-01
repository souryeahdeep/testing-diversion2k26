import { NextResponse } from "next/server";
import { sendTaskAssignmentEmail, sendTeamWelcomeEmail } from "@/lib/email/sendgrid";

/**
 * POST /api/notify/email
 * Send email notifications for task assignments or team member additions
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Notification type is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "task_assignment":
        // Validate required fields for task assignment
        if (!params.to || !params.memberName || !params.taskTitle) {
          return NextResponse.json(
            { error: "Missing required fields: to, memberName, taskTitle" },
            { status: 400 }
          );
        }

        result = await sendTaskAssignmentEmail({
          to: params.to,
          memberName: params.memberName,
          taskTitle: params.taskTitle,
          taskDescription: params.taskDescription || "",
          priority: params.priority || "Medium",
          status: params.status || "To Do",
          deadline: params.deadline,
          assignedBy: params.assignedBy,
        });
        break;

      case "team_welcome":
        // Validate required fields for team welcome
        if (!params.to || !params.memberName || !params.role) {
          return NextResponse.json(
            { error: "Missing required fields: to, memberName, role" },
            { status: 400 }
          );
        }

        result = await sendTeamWelcomeEmail({
          to: params.to,
          memberName: params.memberName,
          role: params.role,
          githubId: params.githubId || "",
          addedBy: params.addedBy,
          projectName: params.projectName || "the team",
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      ...result,
    });
  } catch (error) {
    console.error("Email notification error:", error);

    // Check if it's a SendGrid configuration error
    if (error.message?.includes("SendGrid API key not configured")) {
      return NextResponse.json(
        {
          error: "Email service not configured. Please set up SendGrid credentials.",
          details: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to send email notification",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
