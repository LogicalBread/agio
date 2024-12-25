export interface DiscordClientExt {
  sendMessage(token: string, content: string): Promise<void>;
}
