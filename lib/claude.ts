/**
 * Anthropic SDK client — routed through 302.ai proxy.
 * Models available on 302.ai for this project:
 *   - claude-opus-4-7   (Agent 2 · 晨间引导师)
 *   - claude-sonnet-4-6 (Agent 1 · 守夜分析师)
 */

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const baseURL = process.env.ANTHROPIC_BASE_URL;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({
      apiKey,
      baseURL: baseURL ?? "https://api.anthropic.com",
    });
  }
  return _client;
}

export const MODELS = {
  nightWatcher: "claude-sonnet-4-6",  // Agent 1 守夜分析师 — 高频 cron
  morningGuide: "claude-opus-4-7",    // Agent 2 晨间引导师 — 用户触发，质量优先
} as const;

export type ModelKey = keyof typeof MODELS;

/** Simple streaming helper — collects full text */
export async function streamText(params: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const client = getClaudeClient();
  const { model, system, userMessage, maxTokens = 1500 } = params;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}
