type TextContent = { type: 'text'; text: string };
type ImageContent = { type: 'image_url'; image_url: { url: string; detail: 'low' | 'high' | 'auto' } };
type MessageContent = string | Array<TextContent | ImageContent>;

interface OpenAIMessage {
  role: 'system' | 'user';
  content: MessageContent;
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function requestStructured<T>(messages: OpenAIMessage): Promise<T> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('AI provider is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [messages],
      }),
      signal: controller.signal,
    });

    const payload = await response.json() as OpenAIResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message || 'AI provider request failed');
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI provider returned no content');

    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error('AI provider returned invalid JSON');
    }
  } finally {
    clearTimeout(timeout);
  }
}

export type { ImageContent, MessageContent, OpenAIMessage, TextContent };
