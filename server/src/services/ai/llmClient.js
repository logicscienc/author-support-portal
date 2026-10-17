
import OpenAI from 'openai';
import { env } from '../../config/env.js';

const TIMEOUT_MS = 15_000;
const BREAKER_THRESHOLD = 3;       
const BREAKER_COOLDOWN_MS = 60_000; 


const client = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: TIMEOUT_MS, maxRetries: 1 })
  : null;

let failures = 0;
let pausedUntil = 0;


export const isLlmAvailable = () => client !== null && Date.now() >= pausedUntil;

export async function chat({ system, user, json = false, maxTokens = 300, temperature = 0.2 }) {
  if (!isLlmAvailable()) {
    throw new Error('LLM unavailable (no API key, or paused after repeated failures)');
  }

  try {
    const response = await client.chat.completions.create({
      model: env.LLM_MODEL,
      temperature,
      max_completion_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      ...(json && { response_format: { type: 'json_object' } }),
    });

    failures = 0;
    return {
      text: response.choices[0]?.message?.content?.trim() ?? '',
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
      },
      model: response.model,
    };
  } catch (err) {
    failures += 1;
    if (failures >= BREAKER_THRESHOLD) {
      pausedUntil = Date.now() + BREAKER_COOLDOWN_MS;
      failures = 0;
      console.warn(`[ai] ${BREAKER_THRESHOLD} failures in a row. Pausing AI calls for 60 seconds.`);
    }
    throw err;
  }
}