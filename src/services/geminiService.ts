import { supabase } from "@/integrations/supabase/client";

// GreenBot runs in the `greenbot` Supabase Edge Function, which holds the
// Gemini API key. Nothing here should ever touch the key directly.

export interface TreeContext {
  totalTrees: number;
  activePlanters: number;
  treeSpecies: number;
}

export interface TreeCareAdvice {
  recommendedSpecies?: string;
  survivalAdvice: string[];
  wateringFrequency: string;
  riskFactors: string[];
  maintenanceTips: string[];
}

// Chat history lives only in this browser, one entry per signed-in account, so
// people sharing a device never see each other's conversations.
const HISTORY_PREFIX = "greenbot_chat_v2_";
const LEGACY_HISTORY_KEYS = ["greanbot_chat_history_v1"];

export const greenBotHistoryKey = (userId: string) => `${HISTORY_PREFIX}${userId}`;

/** Removes every GreenBot conversation stored in this browser (called on sign-out). */
export function clearGreenBotHistory() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(HISTORY_PREFIX) || LEGACY_HISTORY_KEYS.includes(key))) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable (private mode etc.): nothing to clear.
  }
}

async function invokeGreenBot<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("greenbot", { body });
  if (error) {
    // FunctionsHttpError carries the function's JSON response in `context`.
    let message = "GreenBot is unavailable right now. Please try again shortly.";
    try {
      const details = await (error as { context?: Response }).context?.json();
      if (details?.error) message = details.error;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }
  return data as T;
}

export async function sendMessage(
  userMessage: string,
  history: { role: "user" | "model"; parts: string }[],
  context?: TreeContext
): Promise<string> {
  try {
    const { reply } = await invokeGreenBot<{ reply: string }>({
      action: "chat",
      message: userMessage,
      history,
      context,
    });
    return reply;
  } catch (error) {
    return error instanceof Error ? `⚠️ ${error.message}` : "Sorry, I encountered an error. Please try again.";
  }
}

/** Asks GreenBot for care advice on one of the signed-in user's trees and stores it. */
export async function requestTreeCareAdvice(treeId: string): Promise<TreeCareAdvice> {
  const { advice } = await invokeGreenBot<{ advice: TreeCareAdvice }>({
    action: "tree_advice",
    tree_id: treeId,
  });
  return advice;
}
