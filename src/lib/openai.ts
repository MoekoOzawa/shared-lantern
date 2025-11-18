export async function generateWeeklyStory(summary: string) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not set.");
  }

  const prompt = `
You are telling a gentle fantasy story in a Lord-of-the-Rings-like world.
Two characters:
• Moeko: an Elf
• James: a Hobbit

They travel together on a symbolic journey toward the Grey Havens.
Each week, their relationship experiences are translated into a scene of this journey.

Weekly summary:
${summary}

Write a short story (150–220 words).
Tone: warm, grounded, mythic, quiet.
Avoid copying modern terminology.
Use imagery like lanterns, forests, rivers, moonlight.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
