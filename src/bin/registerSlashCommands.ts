import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { type PersonalTarget, targets } from '../gen/target';

const register = async () => {
  const CHOICES = Object.keys(targets).map((key) => {
    const target = targets[key as PersonalTarget];
    return { name: target.name, value: key.toLowerCase() };
  });

  const talkCommand = new SlashCommandBuilder()
    .setName('talk')
    .setDescription('みんな大好きあの人とおしゃべり！')
    .addStringOption((option) =>
      option
        .setName('target')
        .setDescription('おしゃべり相手')
        .addChoices(CHOICES)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('なにかお困りですか？')
        .setRequired(true),
    )
    .toJSON();

  const resetCommand = new SlashCommandBuilder()
    .setName('reset')
    .setDescription('リセット')
    .addStringOption((option) =>
      option
        .setName('target')
        .setDescription('リセットする相手')
        .addChoices(CHOICES)
        .setRequired(true),
    )
    .toJSON();

  const restClient = new REST().setToken(Bun.env.DISCORD_TOKEN ?? '');

  try {
    await restClient.put(
      Routes.applicationCommands(Bun.env.DISCORD_APPLICATION_ID ?? ''),
      {
        body: [talkCommand, resetCommand],
      },
    );
    console.info('スラッシュコマンドの登録に成功しました');
  } catch (e) {
    console.error(JSON.stringify(e, null, 2));
    console.error('スラッシュコマンドの登録に失敗しました');
    return;
  }
};

await register();
