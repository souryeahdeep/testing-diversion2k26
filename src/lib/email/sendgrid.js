// SendGrid Email Service

/**
 * Sends an email notification using SendGrid
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content of the email
 * @param {string} params.text - Plain text content (optional)
 * @returns {Promise<Object>} - Response with success status
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@yourapp.com";

  if (!apiKey) {
    throw new Error("SendGrid API key not configured. Please set SENDGRID_API_KEY in your .env.local file");
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: "text/html",
            value: html,
          },
          ...(text ? [{ type: "text/plain", value: text }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("SendGrid API error:", errorData);
      throw new Error(`SendGrid API error: ${response.status} ${response.statusText}`);
    }

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Sends a task assignment notification email
 * @param {Object} params - Task assignment parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.memberName - Name of the team member
 * @param {string} params.taskTitle - Title of the task
 * @param {string} params.taskDescription - Description of the task
 * @param {string} params.priority - Task priority (Low, Medium, High)
 * @param {string} params.status - Task status
 * @param {string} params.deadline - Task deadline (optional)
 * @param {string} params.assignedBy - Name of person who assigned the task
 */
export async function sendTaskAssignmentEmail({
  to,
  memberName,
  taskTitle,
  taskDescription,
  priority,
  status,
  deadline,
  assignedBy,
}) {
  const priorityColor = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981",
  }[priority] || "#6b7280";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🎯 New Task Assigned</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #111827; font-size: 16px;">Hi ${memberName},</p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                You have been assigned a new task${assignedBy ? ` by <strong>${assignedBy}</strong>` : ""}. Here are the details:
              </p>
              
              <!-- Task Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">${taskTitle}</h2>
                    
                    <!-- Priority Badge -->
                    <div style="margin-bottom: 16px;">
                      <span style="display: inline-block; padding: 4px 12px; background-color: ${priorityColor}; color: #ffffff; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        ${priority} Priority
                      </span>
                      <span style="display: inline-block; margin-left: 8px; padding: 4px 12px; background-color: #e5e7eb; color: #374151; border-radius: 12px; font-size: 12px; font-weight: 500;">
                        ${status}
                      </span>
                    </div>
                    
                    ${taskDescription ? `
                    <div style="margin-bottom: 16px;">
                      <h3 style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Description</h3>
                      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${taskDescription}</p>
                    </div>
                    ` : ""}
                    
                    ${deadline ? `
                    <div>
                      <h3 style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Deadline</h3>
                      <p style="margin: 0; color: #374151; font-size: 14px;">📅 ${new Date(deadline).toLocaleString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    ` : ""}
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 8px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Please review the task details and update its status as you make progress.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Good luck! 🚀
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                This is an automated notification from your project management system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Hi ${memberName},

You have been assigned a new task${assignedBy ? ` by ${assignedBy}` : ""}.

Task: ${taskTitle}
Priority: ${priority}
Status: ${status}
${taskDescription ? `\nDescription: ${taskDescription}` : ""}
${deadline ? `\nDeadline: ${new Date(deadline).toLocaleString()}` : ""}

Please review the task details and update its status as you make progress.

Good luck!
  `.trim();

  return sendEmail({
    to,
    subject: `🎯 New Task Assigned: ${taskTitle}`,
    html,
    text,
  });
}

/**
 * Sends a team member welcome email
 * @param {Object} params - Team member parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.memberName - Name of the new team member
 * @param {string} params.role - Role assigned to the member
 * @param {string} params.githubId - GitHub username
 * @param {string} params.addedBy - Name of person who added the member
 * @param {string} params.projectName - Name of the project (optional)
 */
export async function sendTeamWelcomeEmail({
  to,
  memberName,
  role,
  githubId,
  addedBy,
  projectName = "the team",
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Team</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 Welcome to ${projectName}!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #111827; font-size: 16px;">Hi ${memberName},</p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Great news! You have been added to ${projectName}${addedBy ? ` by <strong>${addedBy}</strong>` : ""}. We're excited to have you on board! 🚀
              </p>
              
              <!-- Member Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Details</h3>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Name:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${memberName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Role:</td>
                        <td style="padding: 8px 0;">
                          <span style="display: inline-block; padding: 4px 12px; background-color: #10b981; color: #ffffff; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${role}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">GitHub:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                          <a href="https://github.com/${githubId.replace('@', '')}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${githubId}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Email:</td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px;">${to}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <div style="margin-bottom: 24px; padding: 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">👉 Next Steps</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                  <li>Check your project dashboard for assigned tasks</li>
                  <li>Review the project documentation and guidelines</li>
                  <li>Connect with your team members</li>
                  <li>Set up your development environment</li>
                </ul>
              </div>
              
              <p style="margin: 0 0 8px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, don't hesitate to reach out to your team.
              </p>
              <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.6; font-weight: 500;">
                Welcome aboard! Let's build something amazing together! 💪
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                This is an automated notification from your project management system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Hi ${memberName},

Great news! You have been added to ${projectName}${addedBy ? ` by ${addedBy}` : ""}. We're excited to have you on board!

Your Details:
- Name: ${memberName}
- Role: ${role}
- GitHub: ${githubId}
- Email: ${to}

Next Steps:
- Check your project dashboard for assigned tasks
- Review the project documentation and guidelines
- Connect with your team members
- Set up your development environment

If you have any questions or need assistance, don't hesitate to reach out to your team.

Welcome aboard! Let's build something amazing together!
  `.trim();

  return sendEmail({
    to,
    subject: `🎉 Welcome to ${projectName} - You've Been Added as ${role}`,
    html,
    text,
  });
}
