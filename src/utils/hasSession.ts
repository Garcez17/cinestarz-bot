import { Message } from 'discord.js';
import { query as q } from 'faunadb';
import { FindOneSession, Session } from "../@types";
import { fauna } from "../services/fauna";
import { embedMessage } from './EmbedMessage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../services/firebase';

export async function hasSession({ guild, channel }: Message): Promise<boolean> {
  const guildId = guild!.id
  const channelId = channel.id
  const sessionsRef = collection(firestore, `guilds/${guildId}/sessions`)

  const q = query(
    sessionsRef,
    where("channelId", "==", channelId),
    where("status", "in", ["OPEN", "VOTING"])
  )
  
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return false
  }

  const session = snapshot.docs[0]?.data()

  return Boolean(session)
  // try {
  //   const sessionFauna = await fauna.query<FindOneSession>(
  //     q.Let(
  //       {
  //         ref: q.Match(
  //           q.Index('session_by_server_id'),
  //           q.Casefold(msg.channel.id)
  //         ),
  //       },
  //       q.If(
  //         q.Exists(q.Var('ref')),
  //         {
  //           type: 'Session',
  //           session: q.Get(q.Var('ref'))
  //         },
  //         {
  //           type: 'Error',
  //           message: 'session not found.',
  //           code: 42
  //         }
  //       )
  //     )
  //   )

  //   if (sessionFauna.type === 'Session' && sessionFauna.session.data.started_at) {
  //     if (isStart)
  //       embedMessage('Já existe sessão em andamento.', msg, 160000);

  //     return sessionFauna.session;
  //   }

  //   return null;
  // } catch (err) {
  //   console.log(err);
  //   return null;
  // }
}