import { type OmitPartialGroupDMChannel, type Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { noSession } from "../errors/NoSession";
import { getSession } from "../utils/getSession";
import { embedMessage } from "../utils/EmbedMessage";
import type { DiscordChannel, Session } from "../@types";
import { updateDoc, type DocumentData, type DocumentReference } from "firebase/firestore";

interface PartyProps {
  channel: DiscordChannel
  guildId: string
  authorId: string
  content: string
}

function parseVideoUrl(url: string) {
  const parsedUrl = new URL(url)
  const hostname = parsedUrl.hostname
  const partyId = parsedUrl.searchParams.get('party')

  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    const videoId = parsedUrl.searchParams.get('v') || parsedUrl.pathname.split('/').pop() || null
    return { provider: 'YouTube', videoId, partyId }
  }

  // if (hostname.includes('netflix.com')) {
  //   const match = parsedUrl.pathname.match(/\/watch\/(\d+)/)
  //   const videoId = match ? match[1] : null
  //   return { provider: 'Netflix', videoId, partyId }
  // }

  return { provider: 'Unknown', videoId: null, partyId }
}

export function createPartyEmbed(url: string, initiatedBy: string) {
  const embed = new EmbedBuilder()
    .setTitle("🎥 A sessão vai começar!")
    .setDescription(`🍿 A party foi criada com sucesso!\n\nClique no botão abaixo para entrar no player e assistir junto com todo mundo.`)
    .addFields(
      {
        name: "🎉 Iniciada por",
        value: `<@${initiatedBy}>`,
        inline: true
      },
      {
        name: "🔗 Link",
        value: `[Clique aqui para assistir](${url})`,
        inline: true
      }
    )
    .setColor(0x5865f2) // Cor no estilo Discord
    .setFooter({ text: "Sincronize o play com o grupo e aproveite o filme!" })
    .setTimestamp()

  const button = new ButtonBuilder()
    .setLabel("🎥 Entrar na Party")
    .setStyle(ButtonStyle.Link)
    .setURL(url)

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

  return { embed, row }
}

interface GeneratePartyProps {
  link: string
  authorId: string
  collectionName: string
  channel: DiscordChannel
  ref: DocumentReference<DocumentData>
  session: Session
  content?: {
    provider: {
      title: string,
      description: string,
      thumbnail: string,
    },
    url: string,
    title: string,
  }
  title?: string
}

export async function generateParty({ link, collectionName, authorId, channel, ref, content, session }: GeneratePartyProps) {
  const partyLink = `${link}&party=${collectionName}`

  const contentData = parseVideoUrl(partyLink)

  await updateDoc(ref, {
    content: {
      title: content?.provider.title,
      provider: contentData.provider,
      onlyHostControls: true,
      enableRequests: true,
      videoId: contentData.videoId,
      ...session.content
    }
  })

  const { embed, row } = createPartyEmbed(partyLink, authorId)

  await channel.send({
    embeds: [embed],
    components: [row],
  })
}

export async function party({ channel, guildId, content, authorId }: PartyProps) {
  const { session, ref } = await getSession({
    channel,
    guildId,
  })

  if (!session || !ref) return noSession({ channel })

  const link = content.replace('!party', '').trim()

  if (!link)
    return embedMessage('Insira a url da party', channel, 160000)

  await generateParty({
    authorId,
    channel,
    collectionName: session.collectionName,
    link,
    ref,
    session,
  })
}