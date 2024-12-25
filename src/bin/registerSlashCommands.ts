import { SlashCommandBuilder } from 'discord.js';
import { type PersonalTarget, targets } from '../gen/target';

const register = async () => {
  const url = `https://discord.com/api/v10/applications/${Bun.env.DISCORD_APPLICATION_ID}/commands`;

  const commands = new SlashCommandBuilder()
    .setName('talk')
    .setDescription('みんな大好きあの人とおしゃべり！')
    .addStringOption((option) =>
      option
        .setName('target')
        .setDescription('おしゃべり相手')
        .addChoices(
          Object.keys(targets).map((key) => {
            const target = targets[key as PersonalTarget];

            return { name: target.name, value: key.toLowerCase() };
          }),
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('なにかお困りですか？')
        .setRequired(true),
    )
    .toJSON();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${Bun.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (res.ok) {
    console.info('スラッシュコマンドが登録されました');
  } else {
    console.error('スラッシュコマンドの登録に失敗しました');
  }
};

await register();
