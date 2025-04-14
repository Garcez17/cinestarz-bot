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

  // const createSession = await fauna.query<Session>(
  //   q.If(
  //     q.Not(
  //       q.Exists(
  //         q.Match(
  //           q.Index('session_by_server_id'),
  //           q.Casefold(msg.channel.id)
  //         )
  //       )
  //     ),
  //     q.Create(
  //       q.Collection('sessions'),
  //       {
  //         data: {
  //           server_id: msg.channel.id,
  //           started_at: String(new Date),
  //           session_number: 1,
  //           room: [],
  //           indications: [],
  //           raffle_film: {
  //             notes: [],
  //           }
  //         }
  //       }
  //     ),
  //     q.Let(
  //       {
  //         doc: q.Get(q.Match(q.Index("session_by_server_id"), msg.channel.id)),
  //       },
  //       q.Update(
  //         q.Select(["ref"], q.Var('doc')),
  //         {
  //           data: {
  //             started_at: String(new Date),
  //           }
  //         }
  //       )
  //     )
  //   )
  // )

  const date = new Date();


  // if (channel instanceof TextChannel) {
  //   channel.send({
  //     embeds: [
  //       new EmbedBuilder()
  //         .setColor(0x3498db)
  //         .setTitle("Criando usuário...")
  //         .setDescription("A sessão está iniciada!")
  //         .addFields([
  //           {
  //             name: "15 minutos para indicarem!",
  //             value: "Após isso as indicações são encerradas.",
  //           },
  //         ])
  //         .setFooter({ text: "Bom filme! 😀" })
  //         .setTimestamp()
  //     ]
  //   })
  // }

  const embed = new EmbedBuilder()
    .setColor(0x3498db) // azul bonito, pode mudar pra outro hexadecimal se quiser
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
    // content: `Teste, você entrou na call! Deseja entrar na party?`,
    embeds: [embed],
    components: [],
  })
}