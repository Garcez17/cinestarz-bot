import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Events, GatewayIntentBits, MessageFlags, Partials } from "discord.js";
import { Server } from 'socket.io';
import 'dotenv/config';

import { startSession } from './commands/start';
import { indicate } from './commands/indicate';
// import { changeFilm } from './commands/changeFilm';
import { raffle } from './commands/raffle';
import { list } from './commands/list';
import { clear } from './commands/clear';
import { notes } from './commands/note';
import { average } from './commands/average';
import { showRoom } from './commands/room';
import { finalize } from './commands/finalize';
import { stop } from './commands/stop';
import { party } from "./commands/party";
import { enterParty } from "./socket/enter-party";
import { getParty } from "./socket/getParty";
import { pause } from "./socket/pause";
import { play } from "./socket/play";
import { userManualSeek } from "./socket/user-manual-seek";
import { userCurrentTime } from "./socket/user-current-time";
import { userRateChange } from "./socket/user-rate-change";
import { createParty } from "./socket/create-party";
import { requestPause } from "./socket/interactions/requests/req-pause";
import { requestPlay } from "./socket/interactions/requests/req-play";
import { votePlay } from "./socket/interactions/responses/vote-play";
import { votePause } from "./socket/interactions/responses/vote-pause";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates  
  ],
  partials: [Partials.Channel],
});

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => console.log("Client started!"));

const TARGET_CHANNEL_ID = '877237861638869076'

// client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
//   const member = newState.member

//   if (!member) return

//   if (!oldState.channel && newState.channel?.id === TARGET_CHANNEL_ID) {
//     const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
//       new ButtonBuilder()
//         .setCustomId(`join_party_${member.id}`)
//         .setLabel('Entrar na party 🎉')
//         .setStyle(ButtonStyle.Primary)
//     )

//     const channel = newState.guild.channels.cache.get(TARGET_CHANNEL_ID)
//     if (channel?.isTextBased()) {
//       await channel.send({
//         content: `<@${member.id}>, você entrou na call! Deseja entrar na party?`,
//         components: [row],
//       })

//       // setTimeout(() => msg.delete().catch(() => {}), 30000)
//     }
//   }
// })

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return

  const [action, expectedUserId] = interaction.customId.split('_party_')

  if (action !== 'join') return

  if (interaction.user.id !== expectedUserId) {
    return interaction.reply({
      content: '❌ Essa interação não é pra você!',
      flags: MessageFlags.Ephemeral,
    })
  }

  try {
    await interaction.reply({
      content: '🎉 Você entrou na party!',
      flags: MessageFlags.Ephemeral,
    })

    await interaction.message.delete().catch(() => {})
  } catch (err) {
    console.error('Erro na interação do botão:', err)
    if (!interaction.replied) {
      await interaction.reply({
        content: '⚠️ Ocorreu um erro ao processar.',
        flags: MessageFlags.Ephemeral,
      })
    }
  }
})

client.on(Events.MessageCreate, async msg => {
  const { channel, guild, author, content } = msg

  if (content === '!start') await startSession({
    channel: channel,
    guildId: guild!.id,
    user: {
      id: author.id,
      avatar: author.avatar,
      displayName: author.displayName,
      username: author.username,
    }
  })

  if (msg.content.startsWith('!indica')) await indicate(msg);

  if (msg.content === '!sorteio') await raffle(msg)

  if (msg.content.startsWith('!party')) await party({
    authorId: author.id,
    channel,
    content,
    guildId: guild!.id,
  })
  
  // if (msg.content.startsWith('!mudarfilme')) await changeFilm(msg);

  if (msg.content === '!lista') await list(msg);

  if (msg.content === '!clear') await clear(msg);

  if (msg.content.startsWith('!nota')) await notes(msg);

  if (msg.content === '!media') await average(msg);

  // if (msg.content === '!ingresso') await ticket(msg);

  if (msg.content === '!sala') await showRoom(msg);

  if (msg.content === '!finalize') await finalize(msg);

  if (msg.content === '!stop') await stop(msg);

  if (msg.content === '!stop') await stop(msg);

  // if (msg.content.startsWith('!premiostz')) await award(msg);

  // if (msg.content === '!sendAwardMessage') awardMessage(client);
  
  // if (msg.content.startsWith('!votar')) await awardVote(msg);
})


export const io = new Server(8080, {
  cors: { origin: "*" }
})

io.on('connection', socket => {
  console.log('connection =>', socket.id)
  enterParty(socket)

  getParty(socket)

  pause(socket)

  play(socket)

  userManualSeek(socket)

  userCurrentTime(socket)

  userRateChange(socket)

  createParty(socket, client)

  requestPause(socket)

  requestPlay(socket)

  votePause(socket)

  votePlay(socket)

  socket.on('disconnect', (data) => {
    console.log('desconectado =>', data)
    // const allRooms = io.of("/").adapter.rooms
    // const room = io.of('/').adapter.rooms.get("8772378616388690769a91607c-7145-43e0-bcad-7ac8c238eab9")
  
    // LOGICA PARA DELETAR O CACHE DA ROOM INEXISTENTE*
  })
})
