import { Message } from "discord.js";
import { query as q } from 'faunadb';

import { noSession } from "../errors/NoSession";
import { hasSession } from "../utils/hasSession";
import { fauna } from "../services/fauna";
import { embedMessage } from "../utils/EmbedMessage";

export async function stop(msg: Message) {
  const session = await hasSession(msg);

  if (!session || !session.data.started_at) return noSession(msg);

  await fauna.query(
    q.Let(
      {
        doc: q.Get(q.Match(q.Index("session_by_server_id"), session.data.server_id)),
      },
      q.Update(
        q.Select(["ref"], q.Var('doc')),
        {
          data: {
            started_at: null,
            room: [],
            indications: [],
            raffle_film: {
              year: null,
              runtime: null,
              started_at: null,
              title: null,
              notes: [],
              indicated_by: null,
              average: null,
            }
          }
        }
      )
    )
  )

  embedMessage('Sessão Cancelada.', msg, 160000);
}