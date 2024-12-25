import type { D1Database } from '@cloudflare/workers-types';

export type Env = {
  db: D1Database;
  ANTHROPIC_API_KEY: string;
  DISCORD_APPLICATION_ID: string;
  DISCORD_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
};
