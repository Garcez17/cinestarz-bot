import { type OmitPartialGroupDMChannel, type Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { noSession } from "../errors/NoSession";
import { hasSession } from "../utils/hasSession";
import { embedMessage } from "../utils/EmbedMessage";

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

export async function party(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
  const session = await hasSession(msg)
  const channel = msg.channel

  if (!session) return noSession(msg)

  const link = msg.content.replace('!party', '').trim()

  console.log('testeee', link)
  if (!link)
    return embedMessage('Insira a url da party', msg, 160000)

  const partyLink = `${link}&party=${session.collectionName}`

  console.log('partyLink ==>', partyLink)

  const { embed, row } = createPartyEmbed(partyLink, msg.author.id)

  await channel.send({
    embeds: [embed],
    components: [row],
  })
}