import { sendSlackWebhook } from "../../../../lib/slack/sendWebHook";

export async function POST(req: Request) {
  try {
    const { title, body, repoName, assignee, repoVisibility, labels } = await req.json();

    if (!title || !repoName) {
      return Response.json(
        { error: "Missing required fields: title and repoName" },
        { status: 400 },
      );
    }

    const isPrivateRepo = repoVisibility === "private";
    
    // Use appropriate token based on repo visibility
    // Private repos require full 'repo' scope
    const token = isPrivateRepo 
      ? process.env.GITHUB_PRIVATE_TOKEN || process.env.GITHUB_TOKEN
      : process.env.GITHUB_TOKEN;

    if (!token) {
      return Response.json(
        { error: "GitHub token not configured. Please set GITHUB_TOKEN in your environment variables." },
        { status: 500 },
      );
    }

    const repoOwner = process.env.GITHUB_REPO_OWNER;
    if (!repoOwner) {
      return Response.json(
        { error: "GitHub repository owner not configured. Please set GITHUB_REPO_OWNER in your environment variables." },
        { status: 500 },
      );
    }

    const issuePayload: Record<string, unknown> = { title };
    if (body) issuePayload.body = body;
    if (assignee) issuePayload.assignees = [assignee];
    if (labels && Array.isArray(labels) && labels.length > 0) {
      issuePayload.labels = labels;
    }

    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
    console.log('Creating issue at:', apiUrl, 'with payload:', issuePayload);

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify(issuePayload),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('GitHub API error:', response.status, errorBody);
      
      // Handle specific errors for private repos
      if (isPrivateRepo && (response.status === 404 || response.status === 403)) {
        return Response.json(
          { 
            error: "Unable to access private repository. Your token must include 'repo' scope (not just 'public_repo'). Check your GitHub token permissions.",
            details: errorBody 
          },
          { status: response.status },
        );
      }
      
      // More specific error messages
      let errorMessage = "GitHub API error";
      if (response.status === 404) {
        errorMessage = `Repository not found: ${repoOwner}/${repoName}. Please check the repository name and owner.`;
      } else if (response.status === 401) {
        errorMessage = "Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.";
      } else if (response.status === 403) {
        errorMessage = "GitHub token doesn't have permission to create issues in this repository.";
      } else if (response.status === 422 && errorBody.errors) {
        // Validation error - provide specific details
        const validationErrors = errorBody.errors.map((err: any) => {
          if (err.code === 'invalid') {
            return `Invalid ${err.field}: ${err.message || 'check format'}`;
          }
          return err.message || JSON.stringify(err);
        }).join('; ');
        errorMessage = `Validation Failed: ${validationErrors}`;
      } else if (errorBody.message) {
        errorMessage = `GitHub API error: ${errorBody.message}`;
      }
      
      return Response.json(
        { error: errorMessage, details: errorBody },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (response.ok && process.env.SLACK_WEBHOOK_URL) {
      try {
        await sendSlackWebhook(
          `🚀 *New Issue Created*\n\n` +
            `*Title:* ${data.title}\n` +
            `*Assigned To:* ${assignee || "unassigned"}\n` +
            `*URL:* ${data.html_url}`,
        );
      } catch (slackError) {
        console.error("Slack webhook failed", slackError);
      }
    }
    return Response.json(data);
  } catch (error) {
    console.error("Issue creation failed", error);
    return Response.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
