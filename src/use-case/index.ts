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
    discordUserId: string,
    user: string,
    target: PersonalTarget,
    message: string,
  ) {
    console.info(`${user}から${target}: 「${message}」(${channelId})`);

    const currentMessages = await this.chatRepository.fetchMessages(
      channelId,
      discordUserId,
      target,
    );

    const systemPrompt = personalToSystemPrompt(targets[target], user);
    const res = await this.chatClient.createMessage(
      systemPrompt,
      currentMessages,
      message,
    );

    const returnMessage = `> 「${message}」 to ${targets[target].name}\n\n${res}`;

    await this.discordClient.sendMessage(discordResponseToken, returnMessage);

    const latestNumber = await this.chatRepository.getLatestMessageCount(
      channelId,
      discordUserId,
      target,
    );

    await this.chatRepository.persistMessages(
      channelId,
      discordUserId,
      target,
      [
        { role: 'user', content: message, index: latestNumber + 1 },
        { role: 'system', content: res, index: latestNumber + 2 },
      ],
    );

    return res;
  }

  /** 記憶をリセットする */
  async reset(
    channelId: string,
    discordResponseToken: string,
    discordUserId: string,
    user: string,
    target: PersonalTarget,
  ) {
    const currentMessages = await this.chatRepository.fetchMessages(
      channelId,
      discordUserId,
      target,
    );

    if (currentMessages.length === 0) {
      await this.discordClient.sendMessage(
        discordResponseToken,
        '記憶がありません。',
      );
      await this.discordClient.sendMessage(
        discordResponseToken,
        `> ${targets[target].name}\n\n記憶をリセットしました。`,
      );
      await this.chatRepository.resetMessages(channelId, discordUserId, target);

      return;
    }

    const systemPrompt = personalToSystemPrompt(targets[target], user);
    const res = await this.chatClient.createMessage(
      systemPrompt,
      currentMessages,
      '[システムからのメッセージ]: あなたの記憶をリセットします。言い残したことはありますか？',
    );

    const returnMessage = `> 「${targets[target].name}」の記憶を消去します。\n\n${res}`;

    await this.discordClient.sendMessage(discordResponseToken, returnMessage);

    await this.chatRepository.resetMessages(channelId, discordUserId, target);
  }
}
