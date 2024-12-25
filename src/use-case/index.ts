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
    _channelId: string,
    discordResponseToken: string,
    user: string,
    target: PersonalTarget,
    message: string,
  ) {
    console.info(`${user}から${target}: 「${message}」`);

    const systemPrompt = personalToSystemPrompt(targets[target], user);
    const res = await this.chatClient.createMessage(systemPrompt, [], message);

    const returnMessage = `> 「${message}」 to ${targets[target].name}\n\n${res}`;

    await this.discordClient.sendMessage(discordResponseToken, returnMessage);

    // const latestNumber = await this.chatRepository.getLatestMessageCount(
    //   channelId,
    //   target,
    // );

    // await this.chatRepository.persistMessages(channelId, target, [
    //   { role: 'user', content: message, index: latestNumber + 1 },
    //   { role: 'system', content: res, index: latestNumber + 2 },
    // ]);

    return res;
  }

  /** 記憶をリセットする */
  async reset(_channelId: string, _target: PersonalTarget) {
    // await this.chatRepository.resetMessages(channelId, target);
  }
}
