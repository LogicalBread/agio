import type { Message } from '../model/message';
import type { PersonalTarget } from '../model/personal';

export interface ChatRepositoryExt {
  getLatestMessageCount(
    channelId: string,
    target: PersonalTarget,
  ): Promise<number>;
  persistMessages(
    channelId: string,
    target: PersonalTarget,
    messages: Message[],
  ): Promise<void>;
  resetMessages(channelId: string, target: PersonalTarget): Promise<void>;
  fetchMessages(channelId: string, target: PersonalTarget): Promise<Message[]>;
}
