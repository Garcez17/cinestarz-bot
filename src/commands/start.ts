import { format } from "date-fns";
import { Message } from "discord.js";
import { fauna } from "../services/fauna";
import { query as q } from 'faunadb';
import { Session } from "../@types";
import { hasSession } from "../utils/hasSession";

export async function startSession(msg: Message): Promise<void> {
  const session = await hasSession(msg, true);

  if (session?.data.started_at) return;

  const createSession = await fauna.query<Session>(
    q.If(
      q.Not(
        q.Exists(
          q.Match(
            q.Index('session_by_server_id'),
            q.Casefold(msg.channel.id)
          )
        )
      ),
      q.Create(
        q.Collection('sessions'),
        {
          data: {
            server_id: msg.channel.id,
            started_at: String(new Date),
            session_number: 1,
            room: [],
            indications: [],
            raffle_film: {
              notes: [],
            }
          }
        }
      ),
      q.Let(
        {
          doc: q.Get(q.Match(q.Index("session_by_server_id"), msg.channel.id)),
        },
        q.Update(
          q.Select(["ref"], q.Var('doc')),
          {
            data: {
              started_at: String(new Date),
            }
          }
        )
      )
    )
  )

  const date = new Date(createSession.data.started_at);

  msg.channel.send({
    embed: {
      color: 3447003,
      title: `Cinestarz Sessão Nº ${createSession.data.session_number} - ${format(date, 'dd/MM')}`,
      description: 'A sessão está iniciada!!!!!!',
      fields: [
        {
          name: "15 minutos para indicarem!",
          value: 'Após isso as indicações são encerradas.',
        },
      ],
      footer: {
        text: 'Bom filme!😀'
      },
      timestamp: new Date(),
    },
  });
}