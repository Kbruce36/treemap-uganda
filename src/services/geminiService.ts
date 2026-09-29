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
