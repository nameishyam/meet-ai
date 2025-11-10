import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.NEXT_LLM_API_KEY,
});

export const getResponseFromModel = async (
  modelName: string,
  prompt: string
): Promise<string> => {
  try {
    const { text } = await streamText({
      model: openrouter(modelName),
      prompt: prompt,
    });
    return text;
  } catch (error) {
    console.error("Error fetching from OpenRouter:", error);
    return "Sorry, I ran into an error. Please try again.";
  }
};

export const buildPrompt = (
  summary: string,
  timestamps: { role: "user" | "assistant"; content: string }[]
): string => {
  let prompt = `${summary}\n\n--- INTERVIEW LOG ---\n`;
  for (const message of timestamps) {
    if (message.role === "user") {
      prompt += `User: ${message.content}\n`;
    } else {
      prompt += `Assistant: ${message.content}\n`;
    }
  }
  return prompt;
};
