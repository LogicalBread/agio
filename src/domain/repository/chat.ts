import type { PersonalTarget } from '../../gen/target';
import type { Message } from '../model/message';

export interface ChatRepositoryExt {
  getLatestMessageCount(
    channelId: string,
    userId: string,
    target: PersonalTarget,
  ): Promise<number>;
  persistMessages(
    channelId: string,
    userId: string,
    target: PersonalTarget,
    messages: Message[],
  ): Promise<void>;
  resetMessages(
    channelId: string,
    userId: string,
    target: PersonalTarget,
  ): Promise<void>;
  fetchMessages(
    channelId: string,
    userId: string,
    target: PersonalTarget,
  ): Promise<Message[]>;
}
