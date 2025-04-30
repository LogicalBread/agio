import OpenAI from 'openai';
import type { ChatClientExt } from '../domain/client/chat';
import type { Message } from '../domain/model/message';

const mapRole = (role: 'user' | 'system') => {
  switch (role) {
    case 'user':
      return 'user' as const;
    case 'system':
      return 'assistant' as const;
  }
};

export class OpenAiClient implements ChatClientExt {
  private readonly client: OpenAI;
  private readonly modelName: string;

  constructor(baseUrl: string, apiKey: string, modelName: string) {
    this.client = new OpenAI({ apiKey, baseURL: baseUrl });
    this.modelName = modelName;
  }

  createMessage: (
    system: string,
    currentMessages: Message[],
    message: string,
  ) => Promise<string> = async (system, currentMessages, message) => {
    const messages = [
      {
        role: 'system' as const,
        content: system,
      },
      ...currentMessages.map((m) => ({
        role: mapRole(m.role),
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const res = await this.client.chat.completions.create({
      model: this.modelName,
      max_tokens: 4096,
      messages,
    });

    return res.choices[0].message.content ?? '';
  };
}
