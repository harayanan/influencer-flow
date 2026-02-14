import { NextResponse } from "next/server";

interface GenerateScriptRequest {
  topic: string;
  tone: "excited" | "educational" | "calm" | "professional" | "friendly";
  duration: 60 | 90;
  language: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateScriptRequest;

    if (!body.topic || body.topic.trim().length < 3) {
      return NextResponse.json(
        { error: "Topic must be at least 3 characters" },
        { status: 400 }
      );
    }

    const targetWords = body.duration === 60 ? 150 : 225;
    const tone = body.tone || "professional";
    const language = body.language || "English";

    // TODO: Replace with Gemini API when GEMINI_API_KEY is set
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // const result = await model.generateContent(`Write a ${targetWords}-word ...`);

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Write a short-form video script about "${body.topic}" for social media (TikTok/Reels/Shorts).

Requirements:
- Exactly ${targetWords} words (±10 words)
- Tone: ${tone}
- Language: ${language} (write the script in ${language})
- Format: Plain text, no stage directions, just spoken words
- Structure: Hook (first 3 seconds) → Main points → Call to action
- Make it engaging, conversational, and punchy
- Use short sentences for better subtitling
- No emojis, no hashtags, no platform-specific formatting

Return ONLY the script text, nothing else.`;

        const result = await model.generateContent(prompt);
        const script = result.response.text().trim();

        return NextResponse.json({ script, source: "gemini" });
      } catch (aiError) {
        console.error("Gemini API error, falling back to template:", aiError);
      }
    }

    // Fallback: template-based script generation
    const script = generateTemplateScript(body.topic, tone, targetWords);

    return NextResponse.json({ script, source: "template" });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}

function generateTemplateScript(
  topic: string,
  tone: string,
  targetWords: number
): string {
  const hooks: Record<string, string> = {
    excited: `You won't believe what I discovered about ${topic}!`,
    educational: `Let me break down everything you need to know about ${topic}.`,
    calm: `Here's something interesting about ${topic} that most people miss.`,
    professional: `Today I want to share key insights about ${topic}.`,
    friendly: `Hey! Let's talk about something I'm really passionate about — ${topic}.`,
  };

  const bodies: Record<string, string> = {
    excited: `This is absolutely game-changing. ${topic} is transforming the way we think about content creation. The results speak for themselves. People are seeing massive growth by implementing these strategies. And the best part? Anyone can start doing this today. You don't need expensive tools or years of experience. Just focus on consistency and authenticity. The algorithm rewards creators who show up every single day with genuine value.`,
    educational: `First, let's understand the fundamentals. ${topic} works because it taps into how people naturally consume content. Research shows that short-form video gets three times more engagement than static posts. The key is structuring your message clearly. Start with a hook, deliver your value, and end with a clear next step. Keep your sentences short. Use visual breaks every five to seven seconds. This keeps viewers watching until the end.`,
    calm: `What makes ${topic} special is the simplicity behind it. When you strip away the noise, the core principle is straightforward. Focus on delivering genuine value to your audience. Build trust through consistency. The numbers follow naturally when you prioritize authenticity over virality. Take your time with each piece of content. Quality always wins in the long run.`,
    professional: `The data around ${topic} is compelling. Industry reports show significant growth in this space. Organizations that adopt these practices early see measurable improvements in their reach and engagement. The implementation process is straightforward. Start with a clear strategy, measure your results, and iterate based on data. This systematic approach ensures sustainable growth over time.`,
    friendly: `So here's the deal with ${topic}. I've been experimenting with this for a while now, and I want to share what actually works. Forget the complicated strategies you see everywhere. The secret is keeping things simple and real. Your audience can tell when you're being genuine. Show up as yourself, share what you know, and don't overthink it. That's literally the whole formula.`,
  };

  const ctas: Record<string, string> = {
    excited: `Start implementing this today and watch what happens. Follow for more game-changing tips!`,
    educational: `Save this for later and share it with someone who needs to hear this. Follow for more insights.`,
    calm: `Take a moment to think about how this applies to your journey. Follow for more thoughtful content.`,
    professional: `Connect with me to discuss how to apply these strategies to your goals. Follow for weekly insights.`,
    friendly: `Drop a comment and let me know what you think! Follow along for more real talk.`,
  };

  const hook = hooks[tone] || hooks.professional;
  const body = bodies[tone] || bodies.professional;
  const cta = ctas[tone] || ctas.professional;

  const fullScript = `${hook} ${body} ${cta}`;

  // Trim to target word count
  const words = fullScript.split(/\s+/);
  if (words.length > targetWords + 10) {
    return words.slice(0, targetWords).join(" ") + ".";
  }

  return fullScript;
}
