import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, type OmitPartialGroupDMChannel } from "discord.js";

import { noSession } from "../errors/NoSession";
import { api } from "../services/api";
import { hasSession } from "../utils/hasSession";

import { embedMessage } from "../utils/EmbedMessage";
import { format } from "date-fns";

type Rating = {
  Source: string;
  Value: string;
}

type GetFilmDetailsProps = {
  movieId: string
  userId: string
}

async function getFilmDetails({ movieId, userId }: GetFilmDetailsProps) {
  const { data } = await api.get(`/movie/${movieId}?language=pt-BR&append_to_response=watch/providers`)

  const providers = data["watch/providers"]?.results?.BR?.flatrate || []

  console.log(data["watch/providers"]?.results?.BR)

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

export async function raffle(msg: OmitPartialGroupDMChannel<Message<boolean>>) {
  const session = await hasSession(msg)

  if (!session) return noSession(msg)

  if (session.movieSuggestions.length === 0)
    return embedMessage('Não há filmes na lista de sorteios.', msg, 160000)

  const randomIndicationsIndex = Math.floor(Math.random() * session.movieSuggestions.length)

  const drawnFilm = session.movieSuggestions[randomIndicationsIndex]

  const channel = msg.channel

  try {
    const response = await api.get('/search/movie', {
      params: {
        query: drawnFilm.filmName,
        language: "pt-BR",
      }
    })

    const { results } = response.data

    if (results.length === 1) {
      const { embed } = await getFilmDetails({
        movieId: results[0].id,
        userId: drawnFilm.userId,
      })

      await channel.send({ embeds: [embed] })
      return
    }

    await channel.send(`🎲 O filme sorteado foi: **${drawnFilm.filmName}**`)

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
    
      const { embed } = await getFilmDetails({ movieId, userId: drawnFilm.userId })

      await interaction.reply({ embeds: [embed] })
    })
  } catch (err) {
    console.log('error =>', err)
  }
}