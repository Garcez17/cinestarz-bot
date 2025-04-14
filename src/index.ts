import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Events, GatewayIntentBits, MessageFlags, Partials } from "discord.js";
import { Server } from 'socket.io'
import 'dotenv/config';

import { startSession } from './commands/start';
import { indicate } from './commands/indicate';
// import { changeFilm } from './commands/changeFilm';
import { raffle } from './commands/raffle';
import { list } from './commands/list';
import { clear } from './commands/clear';
import { notes } from './commands/note';
import { average } from './commands/average';
import { ticket } from './commands/ticket';
import { showRoom } from './commands/room';
import { finalize } from './commands/finalize';
import { stop } from './commands/stop';
import { award } from './commands/award';
import { awardMessage } from './commands/stzaward/awardMessage';
import { awardVote } from './commands/stzaward/awardVote';

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

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member

  if (!member) return

  if (!oldState.channel && newState.channel?.id === TARGET_CHANNEL_ID) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`join_party_${member.id}`)
        .setLabel('Entrar na party 🎉')
        .setStyle(ButtonStyle.Primary)
    )

    const channel = newState.guild.channels.cache.get(TARGET_CHANNEL_ID)
    if (channel?.isTextBased()) {
      await channel.send({
        content: `<@${member.id}>, você entrou na call! Deseja entrar na party?`,
        components: [row],
      })

      // setTimeout(() => msg.delete().catch(() => {}), 30000)
    }
  }
})

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
  // console.log('message', msg)
  if (msg.content === '!start') await startSession(msg);

  if (msg.content.startsWith('!indica')) await indicate(msg);

  // if (msg.content.startsWith('!mudarfilme')) await changeFilm(msg);

  if (msg.content === '!sorteio') await raffle(msg);

  if (msg.content === '!lista') await list(msg);

  if (msg.content === '!clear') await clear(msg);

  if (msg.content.startsWith('!nota')) await notes(msg);

  if (msg.content === '!media') await average(msg);

  if (msg.content === '!ingresso') await ticket(msg);

  if (msg.content === '!sala') await showRoom(msg);

  if (msg.content === '!finalize') await finalize(msg);

  if (msg.content === '!stop') await stop(msg);

  if (msg.content === '!stop') await stop(msg);

  // if (msg.content.startsWith('!premiostz')) await award(msg);

  // if (msg.content === '!sendAwardMessage') awardMessage(client);
  
  // if (msg.content.startsWith('!votar')) await awardVote(msg);
})


const io = new Server(8080, {
  cors: { origin: "*" }
})

io.on('connection', socket => {
  console.log('connection =>', socket.id)
  socket.join('players')
  socket.on('pause', () => {
    console.log('pause!!')

    socket.broadcast.to('players').emit('pause_test')
  })

  socket.on('req_play', () => {
    console.log('play')
    socket.broadcast.to('players').emit('play')
  })

  socket.on('info_manual_seek', (data) => {
    console.log('manual_seek ==>', data)

    socket.broadcast.to('players').emit('manual_seek', {
      currentTime: data.currentTime,
    })
  })

  // socket.on('info_user_current_time', (data) => {
  //   console.log('user_current_time ==>', data)
  // })
})
