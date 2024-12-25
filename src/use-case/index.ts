import type { ChatClientExt } from '../domain/client/chat';
import type { DiscordClientExt } from '../domain/client/discord';
import { personalToSystemPrompt } from '../domain/model/personal';
import type { ChatRepositoryExt } from '../domain/repository/chat';
import { type PersonalTarget, targets } from '../gen/target';

export class UseCases {
  private readonly chatClient: ChatClientExt;
  private readonly chatRepository: ChatRepositoryExt;
  private readonly discordClient: DiscordClientExt;

  constructor(
    chatClientImpl: ChatClientExt,
    discordClientImpl: DiscordClientExt,
    chatRepositoryImpl: ChatRepositoryExt,
  ) {
    this.chatClient = chatClientImpl;
    this.discordClient = discordClientImpl;
    this.chatRepository = chatRepositoryImpl;
  }

  /** 話す */
  async chat(
    channelId: string,
    discordResponseToken: string,
    user: string,
    target: PersonalTarget,
    message: string,
  ) {
    const systemPrompt = personalToSystemPrompt(targets[target], user);
    const res = await this.chatClient.createMessage(systemPrompt, [], message);

    await this.discordClient.sendMessage(discordResponseToken, res);

    const latestNumber = await this.chatRepository.getLatestMessageCount(
      channelId,
      target,
    );

    await this.chatRepository.persistMessages(channelId, target, [
      { role: 'user', content: message, index: latestNumber + 1 },
      { role: 'system', content: res, index: latestNumber + 2 },
    ]);

    return res;
  }

  /** 記憶をリセットする */
  async reset(channelId: string, target: PersonalTarget) {
    await this.chatRepository.resetMessages(channelId, target);
  }
}
