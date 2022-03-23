import { addMinutes, isAfter } from "date-fns";
import { Message } from "discord.js";

import { fauna } from "../services/fauna";
import { query as q } from 'faunadb';
import { noSession } from "../errors/NoSession";
import { hasSession } from "../utils/hasSession";
import { User } from "../@types";
import { embedMessage } from "../utils/EmbedMessage";

export async function ticket(msg: Message) {
  const session = await hasSession(msg);

  if (!session || !session.data.started_at) return noSession(msg);

  if (!session.data.raffle_film.title)
    return embedMessage('Não há filme na lista de sorteio.', msg, 160000);

  const user = await fauna.query<User>(
    q.Get(
      q.Match(
        q.Index('user_by_discord_id'),
        q.Casefold(msg.author.id)
      )
    )
  );

  const compareDate = addMinutes(new Date(session.data.started_at), 30);

  if (isAfter(Date.now(), compareDate)) {
    return msg.channel.send({
      embed: {
        color: 160000,
        title: 'Não há vagas!',
        image: {
          url: 'https://media.giphy.com/media/l4FGIgsVPdoRd2wbS/giphy.gif',
        },
      },
    });
  }

  if (session.data.room.includes(user.data.name))
    return embedMessage('Você já está na sala!', msg, 160000);

  const updatedRoom = [
    ...session.data.room,
    user.data.name,
  ]

  await fauna.query(
    q.Update(
      q.Ref(q.Collection('sessions'), session.ref.id),
      {
        data: {
          room: updatedRoom,
        }
      },
    )
  );

  embedMessage(`Bem vindo à sala ${user.data.name}.`, msg, 160000);
}