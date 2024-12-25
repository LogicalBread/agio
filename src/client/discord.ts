import type { DiscordClientExt } from '../domain/client/discord';

export class DiscordClientImpl implements DiscordClientExt {
  private readonly endpoint: string;

  constructor(discordApplicationId: string) {
    this.endpoint = `https://discord.com/api/v10/webhooks/${discordApplicationId}`;
  }

  async sendMessage(token: string, content: string): Promise<void> {
    const res = await fetch(`${this.endpoint}/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    });

    if (!res.ok) {
      console.error('Failed to send message', await res.json());
      throw new Error('Failed to send message');
    }
  }
}
