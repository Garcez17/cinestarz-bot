import { EmbedBuilder } from "discord.js"
import { getSession } from "../utils/getSession"
import { doc, setDoc } from "firebase/firestore"
import { firestore } from "../services/firebase"
import { randomUUID } from "node:crypto"
import type { DiscordChannel } from "../@types"

interface StartSessionProps {
  channel: DiscordChannel
  guildId: string
  user: {
    id: string
    socketId: string
    username: string
    avatar: string | null
    displayName: string
  }
}

export async function startSession({ channel, guildId, user }: StartSessionProps): Promise<'OK' | 'SESSION_ALREADY_EXISTS'> {
  const { session: findExistentSession } = await getSession({
    channel,
    guildId,
  })

  if (findExistentSession) {
    if (findExistentSession.content?.contentId) {
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🎬 Existe uma sessão em andamento, finalize essa para iniciar outra!')
        .setTimestamp()

      await channel.send({
        embeds: [embed],
        components: [],
      })

      return 'SESSION_ALREADY_EXISTS'
    }

    return 'OK'
  }

  const collectionName = channel.id + randomUUID()

  const document = doc(firestore, `guilds/${guildId}/sessions/${collectionName}`)

  const session = {
    collectionName,
    channelId: channel.id,
    startedAt: new Date(),
    status: "VOTING",
    content: null,
    host: {
      userId: user.id,
      socketId: user.socketId,
    },
    participants: [{
      id: user.id,
      username: user.username,
      avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      nickname: user?.displayName,
    }],
    createdBy: {
      id: user.id,
      username: user.username,
    },
    suggestions: [],
    votes: {}
  }

  await setDoc(document, session)

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🎬 Sessão Iniciada!')
    .setDescription('A sessão está iniciada, prepare a pipoca!')
    .addFields([
      {
        name: '⏱️ 15 minutos para indicarem',
        value: 'Após isso as indicações são encerradas.',
      },
    ])
    .setFooter({ text: 'Bom filme! 🍿' })
    .setTimestamp()

  await channel.send({
    embeds: [embed],
    components: [],
  })

  return 'OK'
}