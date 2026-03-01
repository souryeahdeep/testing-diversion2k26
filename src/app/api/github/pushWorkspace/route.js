import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendSlackWebhook } from "@/lib/slack/sendWebHook";

// Binary file extensions to skip
const BINARY_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico",
  ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
  ".exe", ".dll", ".so", ".dylib",
  ".mp3", ".mp4", ".avi", ".mov", ".wmv",
  ".ttf", ".woff", ".woff2", ".eot",
  ".pyc", ".class", ".o", ".a",
  ".bin", ".dat", ".db",
]);

// Directories to skip
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".vscode",
  ".idea",
  "__pycache__",
  "out",
  ".cache",
]);

// Files to skip
const SKIP_FILES = new Set([
  ".DS_Store",
  "Thumbs.db",
  ".env.local",
  ".env",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".eslintcache",
]);

function shouldSkipFile(fileName, filePath) {
  // Skip files in SKIP_FILES list
  if (SKIP_FILES.has(fileName)) {
    return true;
  }

  // Skip binary files by extension
  const ext = path.extname(fileName).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return true;
  }

  // Skip large files (> 500KB)
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 500 * 1024) {
      console.log("Skipping large file: " + fileName + " (" + stats.size + " bytes)");
      return true;
    }
  } catch (error) {
    console.log("Error checking file size for " + fileName);
    return true;
  }

  return false;
}

function readFilesRecursively(dir, baseDir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip directories in SKIP_DIRS
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      // Recursively read subdirectories
      readFilesRecursively(fullPath, baseDir, files);
    } else if (entry.isFile()) {
      // Skip files that should be skipped
      if (shouldSkipFile(entry.name, fullPath)) {
        continue;
      }

      // Read file content
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        
        // Skip empty files
        if (content.length === 0) {
          console.log("Skipping empty file: " + fullPath);
          continue;
        }
        
        // GitHub blob size limit is 100MB, but we'll keep our 500KB limit
        if (content.length > 500 * 1024) {
          console.log("Skipping large content file: " + fullPath + " (" + content.length + " chars)");
          continue;
        }
        
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        
        files.push({
          path: relativePath,
          content: content,
        });
        
        console.log("Added: " + relativePath + " (" + content.length + " chars)");
      } catch (error) {
        console.log("Error reading file " + fullPath + ": " + error.message);
      }
    }
  }

  return files;
}

export async function POST(req) {
  try {
    const { commitMessage, branchName } = await req.json();

    // Hardcoded repository
    const repoName = "testing-diversion2k26";

    if (!commitMessage) {
      return NextResponse.json(
        { error: "Commit message is required" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_PUSH_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GITHUB_PUSH_TOKEN not configured" },
        { status: 500 }
      );
    }

    const owner = process.env.GITHUB_REPO_OWNER;
    if (!owner) {
      return NextResponse.json(
        { error: "GITHUB_REPO_OWNER not configured" },
        { status: 500 }
      );
    }

    // Get workspace root directory
    const workspaceRoot = path.resolve(process.cwd());
    console.log("Scanning workspace: " + workspaceRoot);

    // Only scan source code directories
    const sourceDirs = ["src", "components", "lib", "app", "pages", "public"];
    const files = [];
    
    for (const dir of sourceDirs) {
      const dirPath = path.join(workspaceRoot, dir);
      if (fs.existsSync(dirPath)) {
        console.log("Scanning directory: " + dir);
        readFilesRecursively(dirPath, workspaceRoot, files);
      }
    }
    
    // Also include important config files
    const configFiles = [
      "package.json",
      "tsconfig.json",
      "jsconfig.json",
      "next.config.js",
      "next.config.mjs",
      "tailwind.config.js",
      "postcss.config.js",
      "postcss.config.mjs",
      "README.md",
      "components.json",
    ];
    
    for (const configFile of configFiles) {
      const configPath = path.join(workspaceRoot, configFile);
      if (fs.existsSync(configPath)) {
        try {
          const content = fs.readFileSync(configPath, "utf-8");
          if (content.length > 0 && content.length < 500 * 1024) {
            files.push({
              path: configFile,
              content: content,
            });
            console.log("Added config file: " + configFile);
          }
        } catch (error) {
          console.log("Error reading config file " + configFile + ": " + error.message);
        }
      }
    }
    
    console.log("Total files collected: " + files.length);
    
    if (files.length === 0) {
      console.error("No files found in any source directories");
      console.error("Checked directories: " + sourceDirs.join(", "));
      console.error("Workspace root: " + workspaceRoot);
      return NextResponse.json(
        { error: "No source code files found. Make sure you have src/, app/, or components/ directories with code files." },
        { status: 400 }
      );
    }

    console.log("Files to push: " + files.map(f => f.path).slice(0, 10).join(", ") + (files.length > 10 ? "..." : ""));

    // Validate repository exists
    const repoCheckUrl = "https://api.github.com/repos/" + owner + "/" + repoName;
    const repoCheckResponse = await fetch(repoCheckUrl, {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
      },
    });

    if (!repoCheckResponse.ok) {
      return NextResponse.json(
        { error: "Repository " + owner + "/" + repoName + " not found or not accessible" },
        { status: 404 }
      );
    }

    // Get the latest commit SHA for the branch (if exists)
    let latestCommitSha = null;
    let treeSha = null;

    try {
      const refUrl = "https://api.github.com/repos/" + owner + "/" + repoName + "/git/ref/heads/" + branchName;
      const refResponse = await fetch(refUrl, {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/vnd.github+json",
        },
      });

      if (refResponse.ok) {
        const refData = await refResponse.json();
        latestCommitSha = refData.object.sha;

        const commitUrl = "https://api.github.com/repos/" + owner + "/" + repoName + "/git/commits/" + latestCommitSha;
        const commitResponse = await fetch(commitUrl, {
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/vnd.github+json",
          },
        });

        if (commitResponse.ok) {
          const commitData = await commitResponse.json();
          treeSha = commitData.tree.sha;
        }
      }
    } catch (error) {
      console.log("Branch doesn't exist yet, creating new one");
    }

    // Create blobs for all files
    const blobs = [];
    for (const file of files) {
      try {
        const blobUrl = "https://api.github.com/repos/" + owner + "/" + repoName + "/git/blobs";
        const blobResponse = await fetch(blobUrl, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
          },
          body: JSON.stringify({
            content: file.content,
            encoding: "utf-8",
          }),
        });

        if (!blobResponse.ok) {
          const errorBody = await blobResponse.json();
          console.error("Failed to create blob for " + file.path + ":", errorBody);
          console.error("File size: " + file.content.length + " chars");
          // Skip this file and continue
          continue;
        }

        const blobData = await blobResponse.json();
        blobs.push({
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        });
        
        console.log("Created blob for: " + file.path);
      } catch (error) {
        console.error("Error processing file " + file.path + ":", error.message);
        // Skip this file and continue
      }
    }
    
    if (blobs.length === 0) {
      return NextResponse.json(
        { error: "No files could be pushed. Check server logs for details." },
        { status: 400 }
      );
    }
    
    console.log("Successfully created " + blobs.length + " blobs out of " + files.length + " files");

    // Create a tree
    const treeUrl = "https://api.github.com/repos/" + owner + "/" + repoName + "/git/trees";
    const treeResponse = await fetch(treeUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        base_tree: treeSha || undefined,
        tree: blobs,
      }),
    });

    if (!treeResponse.ok) {
      const errorBody = await treeResponse.json();
      return NextResponse.json(
        { error: "Failed to create tree", details: errorBody },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // Create a commit
    const commitUrl = "https://api.github.com/repos/" + owner + "/" + repoName + "/git/commits";
    const commitResponse = await fetch(commitUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: latestCommitSha ? [latestCommitSha] : [],
      }),
    });

    if (!commitResponse.ok) {
      const errorBody = await commitResponse.json();
      return NextResponse.json(
        { error: "Failed to create commit", details: errorBody },
        { status: commitResponse.status }
      );
    }

    const commitData = await commitResponse.json();

    // Update the reference (push)
    const refUpdateUrl = latestCommitSha
      ? "https://api.github.com/repos/" + owner + "/" + repoName + "/git/refs/heads/" + branchName
      : "https://api.github.com/repos/" + owner + "/" + repoName + "/git/refs";

    const refUpdateResponse = await fetch(refUpdateUrl, {
      method: latestCommitSha ? "PATCH" : "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify(
        latestCommitSha
          ? { sha: commitData.sha, force: false }
          : { ref: "refs/heads/" + branchName, sha: commitData.sha }
      ),
    });

    if (!refUpdateResponse.ok) {
      const errorBody = await refUpdateResponse.json();
      return NextResponse.json(
        { error: "Failed to update reference", details: errorBody },
        { status: refUpdateResponse.status }
      );
    }

    // Send Slack notification after successful push
    try {
      const slackMessage = `🚀 *Git Push Successful!*\n\n` +
        `*Repository:* ${owner}/${repoName}\n` +
        `*Branch:* ${branchName}\n` +
        `*Commit:* ${commitMessage}\n` +
        `*Files Pushed:* ${blobs.length} files\n` +
        `*Commit SHA:* ${commitData.sha.substring(0, 7)}\n` +
        `*View:* https://github.com/${owner}/${repoName}/commit/${commitData.sha}`;
      
      await sendSlackWebhook(slackMessage);
      console.log("Slack notification sent successfully");
    } catch (slackError) {
      console.error("Failed to send Slack notification:", slackError);
      // Don't fail the entire operation if Slack notification fails
    }

    return NextResponse.json({
      success: true,
      repoUrl: "https://github.com/" + owner + "/" + repoName,
      commitSha: commitData.sha,
      branch: branchName,
      filesCount: blobs.length,
      totalScanned: files.length,
    });
  } catch (error) {
    console.error("Git push workspace operation failed:", error);
    return NextResponse.json(
      { error: "Failed to push workspace", message: error.message },
      { status: 500 }
    );
  }
}
