import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { address, reputationData } = await request.json();

    if (!address || !reputationData) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Extract key metrics from reputation data
    const {
      overallScore,
      riskLevel,
      metrics,
      behaviorPatterns,
      riskFlags,
      trustIndicators,
    } = reputationData;

    // Convert behavior patterns object to readable list
    const behaviorList = Object.entries(behaviorPatterns || {})
      .map(([key, value]) => `- ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value ? 'Yes' : 'No'}`)
      .join('\n');

    // Construct a detailed prompt for the AI
    const prompt = `Analyze the following wallet reputation data and provide a comprehensive assessment:

Wallet Address: ${address}

Overall Metrics:
- Reputation Score: ${overallScore}/100
- Risk Level: ${riskLevel}
- Account Age: ${metrics.accountAge} days
- Total Transactions: ${metrics.transactionCount}
- Unique Interactions: ${metrics.uniqueInteractions}
- Contract Interactions: ${metrics.contractInteractions}
- Token Diversity: ${metrics.tokenDiversity} unique tokens

Behavior Patterns:
${behaviorList}

Risk Flags:
${riskFlags.length > 0 ? riskFlags.map((flag: string) => `- ${flag}`).join('\n') : '- None identified'}

Trust Indicators:
${trustIndicators.map((indicator: string) => `- ${indicator}`).join('\n')}

Please provide a detailed analysis with the following structure:

**Overall Assessment**
A 2-3 sentence summary of the wallet's reputation and trustworthiness.

**Key Strengths**
List 3-5 positive aspects of this wallet's behavior and history.

**Risk Factors**
Identify and explain any concerning patterns or red flags (or state if minimal risks detected).

**Behavioral Insights**
Analyze the wallet's transaction patterns and usage characteristics.

**Recommendations**
Provide 2-3 actionable recommendations for interacting with this wallet or improving its reputation.

Keep the analysis professional, data-driven, and actionable. Focus on facts from the provided metrics.`;

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a blockchain security and wallet analysis expert. Provide clear, professional, and data-driven assessments of wallet reputation based on on-chain metrics.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
      return NextResponse.json(
        { error: "Failed to analyze wallet with AI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error in AI wallet analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
