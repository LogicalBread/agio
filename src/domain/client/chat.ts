import type { Message } from '../model/message';

/**
 * チャットクライアントの抽象
 */
export interface ChatClientExt {
  createMessage: (
    system: string,
    currentMessages: Message[],
    message: string,
  ) => Promise<string>;
}
