import { Message } from "discord.js";
import { query as q } from 'faunadb';

import { noSession } from "../errors/NoSession";
import { hasSession } from "../utils/hasSession";
import { fauna } from "../services/fauna";
import { embedMessage } from "../utils/EmbedMessage";

export async function clear(msg: Message) {
  const session = await hasSession(msg);

  if (!session || !session.data.started_at) return noSession(msg);

  await fauna.query(
    q.Update(
      q.Ref(q.Collection('sessions'), session.ref.id),
      {
        data: {
          indications: [],
        }
      },
    )
  );

  embedMessage('Filmes apagados da sorteio.', msg, 160000);
}