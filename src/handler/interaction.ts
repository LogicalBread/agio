import { Hono } from 'hono';
import { verifyDiscordInteractionMiddleware } from '../middleware/verify';
import { UseCases } from '../use-case';
import { ChatRepositoryImpl } from '../repository/chat';
import { ClaudeClient } from '../client/claude';
import type { Env } from '../env';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  type APIInteraction,
} from 'discord-api-types/v10';
import { DiscordClientImpl } from '../client/discord';
import { logger } from 'hono/logger';
import { targetFromStr, targets } from '../gen/target';

export const app = new Hono<{ Bindings: Env }>();

app
  .use(logger())
  .get('/', (c) => {
    return c.text(`Hello ${c.env.DISCORD_APPLICATION_ID}`);
  })
  .post('/interactions', verifyDiscordInteractionMiddleware, async (c) => {
    const chatRepository = new ChatRepositoryImpl(c.env.db);
    const discordClient = new DiscordClientImpl(c.env.DISCORD_APPLICATION_ID);
    const chatClient = new ClaudeClient(c.env.ANTHROPIC_API_KEY);
    const uc = new UseCases(chatClient, discordClient, chatRepository);
    const interaction = await c.req.json<APIInteraction>();

    try {
      switch (interaction.type) {
        case InteractionType.Ping:
          return c.json({
            type: InteractionResponseType.Pong,
          });
        case InteractionType.ApplicationCommand:
          switch (interaction.data.name.toLowerCase()) {
            case 'talk': {
              if (!interaction.guild_id) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: 'DMでは受け付けていません。残念。',
                  },
                });
              }

              if (interaction.data.type !== ApplicationCommandType.ChatInput) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: 'コマンドの種類が違います。残念。',
                  },
                });
              }

              const targetStr = interaction.data.options
                ?.filter((o) => o.type === ApplicationCommandOptionType.String)
                .find((o) => o.name === 'target')?.value;

              const message = interaction.data.options
                ?.filter((o) => o.type === ApplicationCommandOptionType.String)
                .find((o) => o.name === 'message')
                ?.value.trim();

              const target = targetStr ? targetFromStr(targetStr) : undefined;

              if (!target) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: '対象が不明です。残念。',
                  },
                });
              }

              if (!message) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: 'メッセージが不明です。残念。',
                  },
                });
              }

              c.executionCtx.waitUntil(
                uc.chat(
                  interaction.data.guild_id ?? '',
                  interaction.token,
                  interaction.member?.nick ?? '',
                  target,
                  message ?? '',
                ),
              );

              return c.json({
                type: InteractionResponseType.DeferredChannelMessageWithSource,
              });
            }
            case 'reset': {
              if (!interaction.guild_id) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: 'DMでは受け付けていません。残念。',
                  },
                });
              }

              if (interaction.data.type !== ApplicationCommandType.ChatInput) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: 'コマンドの種類が違います。残念。',
                  },
                });
              }

              const targetStr = interaction.data.options
                ?.filter((o) => o.type === ApplicationCommandOptionType.String)
                .find((o) => o.name === 'target')?.value;

              const target = targetStr ? targetFromStr(targetStr) : undefined;

              if (!target) {
                return c.json({
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: '対象が不明です。残念。',
                  },
                });
              }

              await uc.reset(interaction.guild_id, target);

              const personal = targets[target];

              return c.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: `${personal.name}の記憶を消去しました。`,
                },
              });
            }
            default: {
              return c.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: 'コマンドが不明です。残念。',
                },
              });
            }
          }
        default: {
          return c.json({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: 'コマンドが不明です。残念。',
            },
          });
        }
      }
    } catch (e) {
      return c.json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'エラーが発生しました。',
        },
      });
    }
  });
