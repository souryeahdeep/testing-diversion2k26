IntelliGit VS Code Extension Features:

Main Panel: The primary feature is a command to open a dedicated "IntelliGit Panel" inside VS Code. This panel acts as the main interface for all other extension functionalities.

Webview Integration: It hosts a web application (the Next.js front end) directly within the VS Code panel, creating a seamless user experience.

URI Handling: The extension can respond to specific URLs to perform actions, such as focusing on a particular task within the panel.

IntelliGit Website/Web App Features:
The web application, which runs inside the extension's panel, appears to be a comprehensive, AI-powered assistant for Git and GitHub workflows.

AI-Powered Git Operations:
AI Refactoring: Suggests and performs code refactoring using AI.
Commit Summaries: Automatically generates summary messages for your commits.README Generation: Creates documentation, like a README.md file, based on the project.

Collaborative Tools:
Code Chat: A chat interface to discuss code with AI or team members.
Activity Feed: A real-time feed showing recent project activities.
Task Board: A Kanban-style board to manage and track tasks.
Team Management: A dialog to add and manage team members.

GitHub/Git Integration:
PR Management: Provides actions for creating, reviewing, and commenting on Pull Requests.
Git Status Helper: Offers a clear view of the current Git status (changes, branches, etc.).
Direct Git Actions: Allows you to stage, commit, push, and sync changes directly from the interface.

User & Authentication:
User Profiles: Displays user information.
Firebase Authentication: Manages user login and secure access using Firebase.

GitHub Token Configuration:
The extension supports creating issues in both public and private GitHub repositories.

**For Public Repositories:**
- Requires a GitHub token with `public_repo` scope (or broader)
- Set `GITHUB_TOKEN` environment variable
- Works with minimal permissions

**For Private Repositories:**
- Requires a GitHub token with full `repo` scope
- Set `GITHUB_PRIVATE_TOKEN` environment variable (falls back to `GITHUB_TOKEN` if not set)
- ⚠️ Without proper `repo` scope, you'll receive 404 or 403 errors

**Environment Variables:**
```
GITHUB_TOKEN=ghp_your_token_here
GITHUB_PRIVATE_TOKEN=ghp_your_private_repo_token_here  # Optional, for private repos
GITHUB_REPO_OWNER=your-github-username
```

**Creating GitHub Tokens:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. For public repos: Select `public_repo` scope
3. For private repos: Select full `repo` scope
4. Copy token and add to your `.env.local` file

Modern UI:
Built with Next.js and Tailwind CSS for a responsive and modern user interface.
Includes a rich set of UI components like dialogs, charts, forms, and a toast notification system for user feedback.