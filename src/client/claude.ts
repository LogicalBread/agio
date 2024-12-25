import Anthropic from '@anthropic-ai/sdk';
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

export class ClaudeClient implements ChatClientExt {
  private readonly client: Anthropic;

  constructor(anthropicApiKey: string) {
    this.client = new Anthropic({ apiKey: anthropicApiKey });
  }

  createMessage: (
    system: string,
    currentMessages: Message[],
    message: string,
  ) => Promise<string> = async (system, currentMessages, message) => {
    const messages = [
      ...currentMessages.map((m) => ({
        role: mapRole(m.role),
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const res = await this.client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 2048,
      system,
      messages,
    });

    // WIP: 適当
    return res.content[0].type === 'text' ? res.content[0].text : '';
  };
}
