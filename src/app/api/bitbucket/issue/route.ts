import { NextRequest, NextResponse } from "next/server";
import { createBitbucketIssue } from "../../../../lib/bitbucket/bitbucket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, repo } = body;
    console.log(title+" "+description+" "+repo);
    

    if (!title || !description || !repo) {
      return NextResponse.json(
        { error: "title, description, and repo are required" },
        { status: 400 }
      );
    }

    const result = await createBitbucketIssue({ title, description, repo });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("Bitbucket issue creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}