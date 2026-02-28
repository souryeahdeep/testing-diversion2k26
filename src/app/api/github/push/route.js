import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { commitMessage, branchName, files } = await req.json();

    // Hardcoded repository for GitInit
    const repoName = "testing-diversion2k26";

    if (!commitMessage || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: commitMessage and files" },
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

    // Get the latest commit SHA for the branch (if exists)
    let latestCommitSha = null;
    let treeSha = null;

    try {
      const refResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branchName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (refResponse.ok) {
        const refData = await refResponse.json();
        latestCommitSha = refData.object.sha;

        // Get the tree SHA from the commit
        const commitResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/git/commits/${latestCommitSha}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        );

        if (commitResponse.ok) {
          const commitData = await commitResponse.json();
          treeSha = commitData.tree.sha;
        }
      }
    } catch (error) {
      // Branch doesn't exist, we'll create it
      console.log("Branch doesn't exist yet, creating new one");
    }

    // Create blobs for all files
    const blobs = await Promise.all(
      files.map(async (file) => {
        const blobResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/git/blobs`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github+json",
            },
            body: JSON.stringify({
              content: file.content,
              encoding: "utf-8",
            }),
          }
        );

        if (!blobResponse.ok) {
          throw new Error(`Failed to create blob for ${file.name}`);
        }

        const blobData = await blobResponse.json();
        return {
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        };
      })
    );

    // Create a tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          base_tree: treeSha || undefined,
          tree: blobs,
        }),
      }
    );

    if (!treeResponse.ok) {
      const errorBody = await treeResponse.json();
      return NextResponse.json(
        { error: "Failed to create tree", details: errorBody },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // Create a commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: treeData.sha,
          parents: latestCommitSha ? [latestCommitSha] : [],
        }),
      }
    );

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
      ? `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branchName}`
      : `https://api.github.com/repos/${owner}/${repoName}/git/refs`;

    const refUpdateResponse = await fetch(refUpdateUrl, {
      method: latestCommitSha ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify(
        latestCommitSha
          ? { sha: commitData.sha, force: false }
          : { ref: `refs/heads/${branchName}`, sha: commitData.sha }
      ),
    });

    if (!refUpdateResponse.ok) {
      const errorBody = await refUpdateResponse.json();
      return NextResponse.json(
        { error: "Failed to update reference", details: errorBody },
        { status: refUpdateResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      repoUrl: `https://github.com/${owner}/${repoName}`,
      commitSha: commitData.sha,
      branch: branchName,
      filesCount: files.length,
    });
  } catch (error) {
    console.error("Git push operation failed:", error);
    return NextResponse.json(
      { error: "Failed to push to repository", message: error.message },
      { status: 500 }
    );
  }
}
