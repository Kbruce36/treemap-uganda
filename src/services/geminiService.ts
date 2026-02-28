import { GoogleGenerativeAI } from "@google/generative-ai";
import { TREE_SPECIES } from "@/data/treeSpecies";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export interface TreeContext {
  totalTrees: number;
  activePlanters: number;
  treeSpecies: number;
  recentSpecies?: string[];
}

function buildSystemPrompt(context?: TreeContext): string {
  const speciesList = TREE_SPECIES.map(
    (s) => `${s.name} (${s.scientificName}) - ${s.category}`
  ).join(", ");

  const contextStr = context
    ? `
Current platform statistics:
- Total trees planted: ${context.totalTrees}
- Active planters: ${context.activePlanters}
- Tree species recorded: ${context.treeSpecies}
${context.recentSpecies?.length ? `- Recently planted species: ${context.recentSpecies.join(", ")}` : ""}
`
    : "";

  return `You are GreenBot, an AI assistant for TreeMap UNAU Kyambogo – a tree tracking platform at Kyambogo University, Uganda. Your role is to help users with:
1. Information about tree species found in Uganda
2. Tree planting tips and best practices for tropical East Africa
3. Environmental impact of reforestation at Kyambogo University
4. Navigation and help with using the TreeMap platform
5. Motivation and insights about the community's tree planting progress

Known tree and plant species on this platform:
${speciesList}
${contextStr}
Keep responses concise, friendly, and focused on trees, the environment, and Uganda. Use emojis sparingly to add warmth.`;
}

export async function sendMessage(
  userMessage: string,
  history: { role: "user" | "model"; parts: string }[],
  context?: TreeContext
): Promise<string> {
  if (!API_KEY) {
    return "⚠️ Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file to enable the AI assistant.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: buildSystemPrompt(context),
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    if (error instanceof Error && error.message.includes("API_KEY_INVALID")) {
      return "⚠️ Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file.";
    }
    return "Sorry, I encountered an error. Please try again.";
  }
}
