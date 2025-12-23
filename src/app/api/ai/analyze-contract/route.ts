import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractName, functions, abi, isVerified, compilerVersion } = body;

    if (!contractName && !functions) {
      return NextResponse.json(
        { error: "Contract data is required" },
        { status: 400 }
      );
    }

    // Prepare a concise prompt for Groq
    const functionsList = functions
      ?.slice(0, 15) // Limit to first 15 functions to avoid token limits
      .map((f: any) => `${f.name}(${f.inputs.map((i: any) => i.type).join(", ")}) - ${f.stateMutability}`)
      .join("\n");

    const prompt = `Analyze this Ethereum smart contract and provide a clear, user-friendly explanation:

Contract Name: ${contractName || "Unknown"}
Verification Status: ${isVerified ? "Verified" : "Not Verified"}
Compiler: ${compilerVersion || "Unknown"}

Key Functions:
${functionsList || "No functions available"}

Please provide:
1. **Purpose**: What does this contract do? (2-3 sentences)
2. **Key Features**: List 3-4 main capabilities
3. **Security Assessment**: Brief security notes (if verified)
4. **User Interaction**: How would users typically interact with this contract?
5. **Risk Level**: Low/Medium/High with brief explanation

Keep it concise, clear, and suitable for non-technical users. Use simple language.`;

    console.log("Sending request to Groq API...");

    // Call Groq API (OpenAI-compatible)
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Fast and powerful model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      throw new Error("Failed to get AI analysis");
    }

    const data = await response.json();
    console.log("Groq API response received");

    // Extract the generated text (OpenAI format)
    const analysis = data.choices?.[0]?.message?.content || "Analysis not available";

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze contract with AI" },
      { status: 500 }
    );
  }
}
