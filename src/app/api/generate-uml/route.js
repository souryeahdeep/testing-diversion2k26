import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { description } = await request.json();

    if (!description) {
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

    // Call OpenRouter API with the 'openrouter/auto' model
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Collaborative Tools UML Generator",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: "You are a senior software architect and technical analyst. Provide professional, structured analysis of codebases with clear sections and bullet points. Be detailed but concise."
          },
          {
            role: "user",
            content: `Analyze this codebase and provide two separate outputs:

**1. MERMAID DIAGRAM** (wrap in \`\`\`mermaid code block):
Generate a professional Mermaid diagram (flowchart, classDiagram, or sequenceDiagram) showing:
- Main components and their relationships
- System workflow and data flow
- Key modules/classes and interactions

**2. CODEBASE INSIGHTS** (after the diagram, structured format):

📊 ARCHITECTURE OVERVIEW:
• [Main architectural pattern used]
• [Core technologies and frameworks]
• [System design approach]

🔄 WORKFLOW ANALYSIS:
• [Step-by-step process flow]
• [Key user interactions]
• [Data processing pipeline]

🏗️ COMPONENT BREAKDOWN:
• [Frontend components and responsibilities]
• [Backend services and APIs]
• [Database/storage layer]
• [External integrations]

⚡ KEY FEATURES:
• [Major functionality 1]
• [Major functionality 2]
• [Major functionality 3]

🔍 TECHNICAL HIGHLIGHTS:
• [Notable implementation details]
• [Design patterns used]
• [Performance considerations]

💡 RECOMMENDATIONS:
• [Potential improvements]
• [Scalability considerations]
• [Security best practices]

Codebase Description:
${description}

Provide professional, pointwise detailed insights. Make it clear, structured, and easy to understand.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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

    // Extract Mermaid code from markdown code blocks
    let umlCode = "";
    let insights = generatedContent;
    
    const mermaidMatch = generatedContent.match(/```(?:mermaid)?\n([\s\S]*?)```/);
    if (mermaidMatch) {
      umlCode = mermaidMatch[1].trim();
      
      // Extract insights (everything after the mermaid block)
      const afterMermaid = generatedContent.split(/```(?:mermaid)?/)[2];
      if (afterMermaid) {
        insights = afterMermaid.replace(/^```\n?/, '').trim();
      }
    } else {
      // If no mermaid block found, try to separate by common patterns
      const lines = generatedContent.split('\n');
      const insightStartIndex = lines.findIndex(line => 
        line.includes('ARCHITECTURE OVERVIEW') || 
        line.includes('WORKFLOW ANALYSIS') ||
        line.includes('INSIGHTS')
      );
      
      if (insightStartIndex > 0) {
        umlCode = lines.slice(0, insightStartIndex).join('\n').trim();
        insights = lines.slice(insightStartIndex).join('\n').trim();
      }
    }

    return NextResponse.json({
      uml: umlCode,
      insights: insights,
      model: "openrouter/auto",
    });

  } catch (error) {
    console.error("Error generating UML:", error);
    return NextResponse.json(
      { error: "Failed to generate UML diagram" },
      { status: 500 }
    );
  }
}
