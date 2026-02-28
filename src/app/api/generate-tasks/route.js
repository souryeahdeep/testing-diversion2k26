import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { repositoryDescription } = await request.json();

    if (!repositoryDescription) {
      return NextResponse.json(
        { error: "Repository description is required" },
        { status: 400 }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Call OpenRouter API to generate tasks
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Collaborative Tools Task Generator",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: "You are an expert project manager and software development analyst. Analyze codebases and generate actionable, prioritized tasks for development teams. Focus on improvements, bug fixes, testing, documentation, and feature enhancements."
          },
          {
            role: "user",
            content: `Analyze this codebase and generate 8-12 actionable development tasks. For each task, provide:

**Format your response as a JSON array of task objects:**
[
  {
    "title": "Brief task title (max 60 chars)",
    "priority": "High|Medium|Low",
    "status": "To Do",
    "category": "Bug Fix|Feature|Testing|Documentation|Refactoring|Security|Performance"
  }
]

**Task Categories to Consider:**
- 🐛 Bug Fixes: Critical issues that need immediate attention
- ✨ Features: New functionality or enhancements
- 🧪 Testing: Unit tests, integration tests, E2E tests
- 📝 Documentation: API docs, README updates, code comments
- 🔧 Refactoring: Code quality improvements, design patterns
- 🔒 Security: Vulnerability fixes, authentication, authorization
- ⚡ Performance: Optimization, caching, database queries
- 🎨 UI/UX: Interface improvements, accessibility

**Priority Guidelines:**
- High: Critical bugs, security issues, blocking features
- Medium: Important improvements, standard features, testing
- Low: Nice-to-have enhancements, documentation updates

Repository/Codebase Context:
${repositoryDescription}

Generate practical, specific tasks that a development team can immediately work on. Return ONLY the JSON array, no additional text.`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: "No content generated from AI model" },
        { status: 500 }
      );
    }

    // Parse the JSON array from the response
    let tasks = [];
    try {
      // Extract JSON array from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```(?:json)?\n?([\s\S]*?)```/) || 
                       generatedContent.match(/\[[\s\S]*\]/);
      
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedContent;
      tasks = JSON.parse(jsonString.trim());

      // Validate and format tasks
      tasks = tasks.map((task, index) => ({
        id: Date.now() + index,
        title: task.title || "Untitled Task",
        priority: ["High", "Medium", "Low"].includes(task.priority) 
          ? task.priority 
          : "Medium",
        status: task.status || "To Do",
        assignee: "", // Will be assigned manually
        category: task.category || "General",
      }));

    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI-generated tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tasks,
      model: "openrouter/auto",
      count: tasks.length,
    });

  } catch (error) {
    console.error("Error generating tasks:", error);
    return NextResponse.json(
      { error: "Failed to generate tasks" },
      { status: 500 }
    );
  }
}
