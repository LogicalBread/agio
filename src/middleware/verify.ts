import { verifyKey } from 'discord-interactions';
import { env } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';

export const verifyDiscordInteractionMiddleware = createMiddleware(
  async (c, next) => {
    const { DISCORD_PUBLIC_KEY } = env<{ DISCORD_PUBLIC_KEY: string }>(c);

    const signature = c.req.header('X-Signature-Ed25519');
    const timestamp = c.req.header('X-Signature-Timestamp');

    if (!signature || !timestamp) {
      return c.json({ message: 'Invalid request signature' }, 401);
    }

    const rawBody = await c.req.text();
    const isValidReq = await verifyKey(
      rawBody,
      signature,
      timestamp,
      DISCORD_PUBLIC_KEY,
    );

    if (!isValidReq) {
      return c.json({ message: 'Invalid request signature' }, 401);
    }

    await next();
  },
);
