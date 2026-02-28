import { NextResponse } from "next/server";

const fallbackSuggestions = (reviewText, issueTitle) => {
  const lowerText = `${issueTitle || ""}\n${reviewText || ""}`.toLowerCase();
  const suggestions = [];

  if (lowerText.includes("null") || lowerText.includes("undefined")) {
    suggestions.push("Add null/undefined guards before property access and return safe defaults for missing values.");
  }

  if (lowerText.includes("slow") || lowerText.includes("performance") || lowerText.includes("lag")) {
    suggestions.push("Profile the slow path, memoize repeated computations, and avoid unnecessary re-renders in UI components.");
  }

  if (lowerText.includes("auth") || lowerText.includes("permission") || lowerText.includes("unauthorized")) {
    suggestions.push("Validate authorization checks at API boundaries and ensure role-based access control for sensitive actions.");
  }

  if (lowerText.includes("error") || lowerText.includes("exception") || lowerText.includes("fail")) {
    suggestions.push("Add explicit error handling with actionable messages and include a retry or recovery path in the affected flow.");
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Reproduce the issue with a minimal test case and document exact steps to confirm the root cause before patching."
    );
    suggestions.push(
      "Apply a focused code fix, then add/extend tests that fail before the fix and pass after the fix."
    );
    suggestions.push(
      "Update user-facing messaging and logs to make future diagnosis faster for similar reports."
    );
  }

  return suggestions.slice(0, 5);
};

export async function POST(request) {
  try {
    const { reviewText, issueTitle, issueDescription } = await request.json();

    const mergedReview = [reviewText, issueDescription].filter(Boolean).join("\n\n").trim();

    if (!mergedReview) {
      return NextResponse.json(
        { error: "Review text or issue description is required" },
        { status: 400 }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        suggestions: fallbackSuggestions(mergedReview, issueTitle),
        model: "fallback/local-rules",
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Collaborative Tools Fix Suggestions",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer. Generate short, practical fix suggestions for a reported issue. Return ONLY valid JSON as {\"suggestions\":[\"...\"]}. Keep 3-6 suggestions.",
          },
          {
            role: "user",
            content: `Issue Title:\n${issueTitle || "N/A"}\n\nIssue/Review Content:\n${mergedReview}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        suggestions: fallbackSuggestions(mergedReview, issueTitle),
        model: "fallback/local-rules",
      });
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json({
        suggestions: fallbackSuggestions(mergedReview, issueTitle),
        model: "fallback/local-rules",
      });
    }

    let parsed;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse((jsonMatch ? jsonMatch[0] : generatedContent).trim());
    } catch {
      parsed = { suggestions: fallbackSuggestions(mergedReview, issueTitle) };
    }

    const suggestions = Array.isArray(parsed?.suggestions)
      ? parsed.suggestions.filter(Boolean).slice(0, 6)
      : fallbackSuggestions(mergedReview, issueTitle);

    return NextResponse.json({
      suggestions,
      model: "openrouter/auto",
    });
  } catch (error) {
    console.error("Error generating fix suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate fix suggestions" },
      { status: 500 }
    );
  }
}