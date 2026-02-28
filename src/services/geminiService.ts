import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TREE_SPECIES } from "@/data/treeSpecies";
import { WeatherData } from "./weatherService";

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
      model: "gemini-3-flash-preview",
      systemInstruction: buildSystemPrompt(context),
    });

    const chat = model.startChat({
      history: history
        .filter((h, index) => index !== 0 || h.role === "user")
        .map((h) => ({
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

export interface TreeCareAdvice {
  recommendedSpecies?: string;
  survivalAdvice: string[];
  wateringFrequency: string;
  riskFactors: string[];
  maintenanceTips: string[];
}

export async function generateTreeSurvivalAdvice(
  latitude: number,
  longitude: number,
  species: string,
  weatherContext: WeatherData | null
): Promise<TreeCareAdvice | null> {
  if (!API_KEY) {
    console.error("Gemini API key not configured.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", // Ensure using a model that supports structured outputs
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            recommendedSpecies: {
              type: SchemaType.STRING,
              description: "If the provided species is unknown or ill-suited, suggest a better alternative. Otherwise, repeat the provided species.",
            },
            survivalAdvice: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "3-4 immediate actions to ensure the tree survives its first few weeks.",
            },
            wateringFrequency: {
              type: SchemaType.STRING,
              description: "Specific watering instructions considering the current weather.",
            },
            riskFactors: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Current environmental or regional risk factors (e.g., extreme heat, heavy rain, pests).",
            },
            maintenanceTips: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Long term maintenance tips for this specific species.",
            },
          },
          required: ["survivalAdvice", "wateringFrequency", "riskFactors", "maintenanceTips"],
        },
      },
    });

    const weatherPrompt = weatherContext
      ? `Current weather at location: ${weatherContext.temperature}°C, ${weatherContext.precipitation}mm rain, soil moisture: ${(weatherContext.soilMoisture * 100).toFixed(1)}%.`
      : "Weather data currently unavailable.";

    const prompt = `You are a professional arborist and tree survival expert. A user has just planted a new tree in Uganda.
    
    Tree Species: ${species || "Unknown Species"}
    Location GPS: Latitude ${latitude}, Longitude ${longitude}
    ${weatherPrompt}
    
    Based on this data, provide structured advice to ensure this tree survives and thrives to offset maximum carbon.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return JSON.parse(responseText) as TreeCareAdvice;
  } catch (error) {
    console.error("Error generating tree care advice:", error);
    return null;
  }
}

