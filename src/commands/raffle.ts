import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, type OmitPartialGroupDMChannel } from "discord.js";

import { noSession } from "../errors/NoSession";
import { api } from "../services/api";
import { getSession } from "../utils/getSession";

import { embedMessage } from "../utils/EmbedMessage";
import { format } from "date-fns";
import { updateDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
import type { DiscordChannel, Suggestion } from "../@types";

type GenerateTmdbEmbedProps = {
  movieId: string
  userId: string
}

type GenerateYoutubeEmbedProps = {
  title: string
  description: string
  thumbnail: string
  userId: string
}

type GetFilmDetailsProps = {
  channel: DiscordChannel
  ref: DocumentReference<DocumentData>
  suggestion: Suggestion
  providerContent?: any
}

function generateYoutubeEmbed({ 
  title, 
  userId,
  description,
  thumbnail, 
}: GenerateYoutubeEmbedProps) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description || "Sem descrição disponível.")
    .addFields([
      { name: "🗓️ Lançamento", value: format(new Date(), "dd/MM/yyyy"), inline: true },
      { name: "📺 Plataformas", value: 'Youtube', inline: true },
      { name: "🎯 Indicado por", value: `<@${userId}>`, inline: true },
    ])
    .setThumbnail(thumbnail)
    .setFooter({ text: "Fonte: Youtube" })

  return { embed }
}

async function generateTmdbEmbed({ movieId, userId }: GenerateTmdbEmbedProps) {
  const { data } = await api.get(`/movie/${movieId}?language=pt-BR&append_to_response=watch/providers`)
  // buscar data from call (sinopse)
  const providers = data["watch/providers"]?.results?.BR?.flatrate || []

  const streamings = providers.length
    ? providers.map((p: any) => p.provider_name).join(", ")
    : "Nenhuma plataforma encontrada"

  const embed = new EmbedBuilder()
    .setTitle(data.title)
    .setDescription(data.overview || "Sem descrição disponível.")
    .addFields([
      { name: "🗓️ Lançamento", value: format(new Date(data.release_date), "dd/MM/yyyy"), inline: true },
      { name: "📺 Plataformas", value: streamings, inline: true },
      { name: "🎯 Indicado por", value: `<@${userId}>`, inline: true },
    ])
    .setThumbnail(`https://image.tmdb.org/t/p/w500${data.poster_path}`)
    .setFooter({ text: "Fonte: TMDB" })

  return { embed }
}

export async function getFilmDetails({ channel, ref, suggestion, providerContent }: GetFilmDetailsProps) {
  try {
    const response = await api.get('/search/movie', {
      params: {
        query: suggestion.content,
        language: "pt-BR",
      }
    })

    const { results } = response.data

    if (results.length === 0) {
      const { embed } = generateYoutubeEmbed({
        description: providerContent?.description,
        thumbnail: providerContent?.thumbnail,
        title: providerContent?.title,
        userId: suggestion.userId,
      })

      await channel.send({ embeds: [embed] })

      return
    }

    if (results.length === 1) {
      const raffledMovie = results[0]

      await updateDoc(ref, {
        content: {
          status: 'pause',
          title: raffledMovie.title,
        }
      })

      const { embed } = await generateTmdbEmbed({
        movieId: results[0].id,
        userId: suggestion.userId,
      })

      await channel.send({ embeds: [embed] })
      return
    }

    await channel.send(`🎲 O filme sorteado foi: **${suggestion.content}**`)

    const slicedResults = results.slice(0, 4) as Array<any>
    
    const embed = new EmbedBuilder()
      .setTitle("Qual destes filmes é o correto?")
      .setDescription("Escolha clicando no botão correspondente abaixo.")
      .setColor(0x5865f2)
      .addFields(
        slicedResults.map((movie, index) => ({
          name: `${index + 1}. ${movie.title}`,
          value: `${movie.overview}\n\n Ano: ${format(new Date(movie.release_date), "dd/MM/yyyy")}`,
        }))
      )

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      slicedResults.map((movie, index) =>
        new ButtonBuilder()
          .setCustomId(String(movie.id))
          .setLabel(`${index + 1}`)
          .setStyle(ButtonStyle.Primary)
      )
    )

    await channel.send({ embeds: [embed], components: [buttons] })

    const collector = channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000 * 5,
    });
    
    collector.on("collect", async (interaction) => {
      const movieId = interaction.customId
      const movie = slicedResults.find((movie: any) => String(movie.id) === movieId)

      if (!movie) return interaction.reply({ content: "Filme não encontrado!" })

      await updateDoc(ref, {
        movie: {
          status: 'pause',
          title: movie.title,
        }
      })
    
      const { embed } = await generateTmdbEmbed({ movieId, userId: suggestion.userId })

      if (interaction.replied) {
        await interaction.editReply({ embeds: [embed] })
      } else {
        await interaction.reply({ embeds: [embed] })
      }
    })
  } catch (err) {
    console.log('error =>', err)
  }
}

export async function raffle(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
  const { session, ref } = await getSession({
    channel: msg.channel,
    guildId: msg.guild!.id,
  })

  if (!session || !ref) return noSession(msg)

  if (session.suggestions.length === 0)
    return embedMessage('Não há filmes na lista de sorteios.', msg.channel, 160000)

  const randomIndicationsIndex = Math.floor(Math.random() * session.suggestions.length)

  const drawnSuggestion = session.suggestions[randomIndicationsIndex]

  const channel = msg.channel

  await getFilmDetails({
    channel,
    ref,
    suggestion: drawnSuggestion,
  })
}