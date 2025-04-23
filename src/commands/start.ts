import { EmbedBuilder, Message, type OmitPartialGroupDMChannel } from "discord.js";
import { hasSession } from "../utils/hasSession";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../services/firebase";
import { randomUUID } from "node:crypto";

export async function startSession(msg: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
  const findExistentSession = await hasSession(msg)

  const channel = msg.channel

  if (findExistentSession) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎬 Existe uma sessão em andamento, finalize essa para iniciar outra!')
      .setTimestamp()

    await channel.send({
      embeds: [embed],
      components: [],
    })

    return
  }

  const collectionName = msg.channel.id + randomUUID()

  const document = doc(firestore, `guilds/${msg.guild!.id}/sessions/${collectionName}`)

  const session = {
    collectionName,
    channelId: msg.channel.id,
    startedAt: new Date(),
    status: "VOTING",
    movie: null,
    host: msg.author.id,
    participants: [{
      id: msg.author.id,
      username: msg.author.username,
      avatar: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`,
      nickname: msg.author?.displayName,
    }],
    createdBy: {
      id: msg.author.id,
      username: msg.author.username,
    },
    movieSuggestions: [],
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
}