/**
 * AI SDK clients — routed through 302.ai proxy.
 * Anthropic models: claude-opus-4-7, claude-sonnet-4-6
 * DeepSeek models: deepseek-v4-pro (OpenAI-compatible)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

let _client: Anthropic | null = null;
let _openaiClient: OpenAI | null = null;

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

export function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const baseURL = process.env.ANTHROPIC_BASE_URL;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    // 302.ai supports OpenAI-compatible endpoint for DeepSeek
    const openaiBase = baseURL
      ? baseURL.replace("/anthropic", "/v1").replace(/\/$/, "")
      : "https://api.302.ai/v1";
    _openaiClient = new OpenAI({
      apiKey,
      baseURL: openaiBase,
    });
  }
  return _openaiClient;
}

export const MODELS = {
  nightWatcher: "claude-sonnet-4-6",  // Agent 1 守夜分析师 — 高频 cron
  morningGuide: "claude-opus-4-7",    // Agent 2 晨间引导师 — 用户触发，质量优先
  springWind: "deepseek-v4-pro",      // 问春风 — DeepSeek V4 Pro
} as const;

export type ModelKey = keyof typeof MODELS;

/** Anthropic streaming helper — collects full text */
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

/** OpenAI-compatible helper for DeepSeek */
export async function chatCompletion(params: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const client = getOpenAIClient();
  const { model, system, userMessage, maxTokens = 1500 } = params;

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
