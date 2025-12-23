import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { address, auditData } = await request.json();

    if (!address || !auditData) {
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

    const {
      securityScore,
      totalApprovals,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      approvals,
      recommendations,
    } = auditData;

    // Format high-risk approvals for AI analysis
    const highRiskApprovals = approvals
      .filter((a: any) => a.riskLevel === "high")
      .slice(0, 5) // Limit to top 5
      .map((a: any) => {
        const issues = [];
        if (a.isUnlimited) issues.push("Unlimited approval");
        if (!a.spender.isVerified) issues.push("Unverified contract");
        const monthsInactive = Math.floor((Date.now() - a.spender.lastUsed) / (30 * 24 * 60 * 60 * 1000));
        if (monthsInactive > 6) issues.push(`Inactive ${monthsInactive} months`);
        
        return `- ${a.token.symbol} → ${a.spender.name || 'Unknown'} (${a.spender.address.slice(0, 10)}...)
  Issues: ${issues.join(", ")}
  Balance at risk: ${a.token.balance !== "0" ? "Yes" : "No"}`;
      })
      .join("\n");

    const mediumRiskApprovals = approvals
      .filter((a: any) => a.riskLevel === "medium")
      .slice(0, 3)
      .map((a: any) => `- ${a.token.symbol} → ${a.spender.name || 'Unknown'}`)
      .join("\n");

    const prompt = `Analyze this wallet's security audit and provide actionable recommendations:

Wallet Address: ${address}

SECURITY METRICS:
- Overall Score: ${securityScore}/100
- Total Approvals: ${totalApprovals}
- High Risk: ${highRiskCount}
- Medium Risk: ${mediumRiskCount}
- Low Risk: ${lowRiskCount}

HIGH-RISK APPROVALS (Top Priority):
${highRiskApprovals || "None"}

MEDIUM-RISK APPROVALS:
${mediumRiskApprovals || "None"}

SYSTEM RECOMMENDATIONS:
${recommendations.map((r: string) => `- ${r}`).join("\n")}

Please provide a comprehensive security analysis with this structure:

**Security Assessment**
Provide a 2-3 sentence overall evaluation of the wallet's security posture. Is it critical, concerning, or acceptable?

**Immediate Actions Required**
List the top 3 specific approvals to revoke right now, explaining WHY each is dangerous in simple terms.

**Understanding the Risks**
Explain what "token approvals" are and why unlimited approvals are dangerous, using beginner-friendly language.

**Best Practices Going Forward**
Provide 3-4 specific security habits for the future (e.g., "Only approve exact amounts", "Revoke after use").

**Long-term Recommendations**
Suggest tools, habits, or strategies to maintain wallet security.

Keep your language simple and actionable. The user is likely new to Web3. Focus on education and empowerment, not fear.`;

    console.log("Sending audit analysis request to Groq AI...");

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
                "You are a blockchain security expert specializing in helping beginners understand wallet security risks. Provide clear, actionable, and educational security advice. Use simple language and avoid technical jargon. Focus on protecting users from common threats like unlimited approvals, unverified contracts, and phishing.",
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
        { error: "Failed to analyze audit with AI" },
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

    console.log("AI audit analysis generated successfully");

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error in AI audit analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
