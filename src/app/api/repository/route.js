import { NextResponse } from "next/server";
let repoData = {};
export async function GET() {
  try {
    return NextResponse.json(repoData);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
};

export async function POST(request) {
  try {
    const { repositoryDescription, timestamp } = await request.json();
    console.log(repositoryDescription);
    
    if (!repositoryDescription) {
      return NextResponse.json(
        { error: "Repository description is required" },
        { status: 400 }
      );
    }
    repoData = { repositoryDescription, timestamp };
    return NextResponse.json({
      repositoryDescription,
      timestamp,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}