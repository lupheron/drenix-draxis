import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      leads: "—",
      hiredLeads: "—",
      hiredLB: "—",
      hiredRef: "—",
      totalHired: "—",
      leadsRate: "—",
      lbRate: "—",
      overallRate: "—",
      adSpend: "—",
      cphLeads: "—",
      cphLB: "—",
      error: "OPENAI_API_KEY not configured",
    });
  }

  try {
    const body = await request.json();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You explain recruiting forecast metrics in one short sentence each. Return JSON with keys: leads, hiredLeads, hiredLB, hiredRef, totalHired, leadsRate, lbRate, overallRate, adSpend, cphLeads, cphLB.",
          },
          {
            role: "user",
            content: JSON.stringify(body),
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenAI request failed (${response.status})` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Forecast explain failed",
      },
      { status: 500 },
    );
  }
}
