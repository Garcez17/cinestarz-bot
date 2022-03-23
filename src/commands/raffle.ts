import { Message } from "discord.js";
import { query as q } from 'faunadb';

import { noSession } from "../errors/NoSession";
import { api } from "../services/api";
import { translateAzureApi } from "../services/translateAzure";
import { trattedRuntime } from "../services/trattedRuntime";
import { hasSession } from "../utils/hasSession";

import { fauna } from "../services/fauna";
import { embedMessage } from "../utils/EmbedMessage";

type Rating = {
  Source: string;
  Value: string;
}

export async function raffle(msg: Message) {
  const session = await hasSession(msg);

  if (!session || !session.data.started_at) return noSession(msg);

  if (session.data.indications.length === 0)
    return embedMessage('Não há filmes na lista de sorteios.', msg, 160000);

  if (session.data.raffle_film.notes.length > 0)
    return embedMessage('Não é possível realizar outro sorteio caso alguem já tenha dado nota ao filme.', msg, 160000);

  const randomIndicationsIndex = Math.floor(Math.random() * session.data.indications.length);

  const drawnFilm = session.data.indications[randomIndicationsIndex];

  try {
    const app = await api.get('', {
      params: {
        t: drawnFilm.indicate,
      }
    });

    if (session.data.raffle_film.title !== drawnFilm.indicate) {
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('sessions'), session.ref.id),
          {
            data: {
              raffle_film: {
                year: app.data.Year || '-',
                runtime: trattedRuntime(app.data.Runtime) || '-',
                started_at: String(new Date),
                title: drawnFilm.indicate,
                indicated_by: drawnFilm.username,
              }
            }
          },
        )
      );
    }

    const ratings = app.data.Ratings as Rating[];

    const embedRatings = ratings.map(rating => {
      const fields = {
        name: rating.Source,
        value: rating.Value,
      }

      return fields;
    });

    msg.channel.send({
      embed: {
        color: 3447003,
        title: drawnFilm.indicate,
        fields: [
          {
            name: "Indicado por:",
            value: drawnFilm.username,
          },
          {
            name: "Digite !ingresso para poder participar da votação",
            value: 'Em 30 minutos esse comando não estará mais disponível',
          },
          {
            name: "Gênero:",
            value: app.data.Genre === 'N/A' ? 'Sem dados' : await translateAzureApi(app.data.Genre),
          },
          {
            name: "Diretor:",
            value: app.data.Director === 'N/A' ? 'Sem dados' : app.data.Director,
          },
          {
            name: "Elenco:",
            value: app.data.Actors === 'N/A' ? 'Sem dados' : app.data.Actors,
          },
          {
            name: "Sinopse:",
            value: app.data.Plot === 'N/A' ? 'Num tem sinopse parsero kkjk' : await translateAzureApi(app.data.Plot),
          },
          {
            name: "Duração:",
            value: app.data.Plot === 'N/A' ? 'Sem dados' : trattedRuntime(app.data.Runtime),
          },
          {
            name: "Imdb:",
            value: app.data.imdbRating === 'N/A' ? 'Sem dados' : app.data.imdbRating,
          },
          ...embedRatings,
        ],
        image: {
          url: app.data.Poster === 'N/A' ? 'https://png.pngtree.com/png-vector/20191019/ourlarge/pngtree-clapperboard-icon-black-monochrome-style-png-image_1829241.jpg' : app.data.Poster,
        },
      },
    });
  } catch (err) {
    await fauna.query(
      q.Update(
        q.Ref(q.Collection('sessions'), session.ref.id),
        {
          data: {
            raffle_film: {
              year: '-',
              runtime: '-',
              started_at: String(new Date),
              title: drawnFilm.indicate,
              indicated_by: drawnFilm.username,
            }
          }
        },
      )
    );

    msg.channel.send({
      embed: {
        color: 3447003,
        title: drawnFilm.indicate,
        fields: [
          {
            name: "Indicado por:",
            value: drawnFilm.username,
          },
          {
            name: "Digite !ingresso para poder participar da votação",
            value: 'Em 30 minutos esse comando não estará mais disponível',
          },
        ],
      },
    });
  }
}