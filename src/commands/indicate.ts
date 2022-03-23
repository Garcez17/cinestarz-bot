import { query as q } from 'faunadb';
import { addMinutes, isAfter } from "date-fns";
import { Message } from "discord.js";

import { noSession } from "../errors/NoSession";

import { hasSession } from "../utils/hasSession";
import { titleize } from "../utils/titleize";

import { fauna } from "../services/fauna";

import { Indication, User } from "../@types";
import { embedMessage } from '../utils/EmbedMessage';
import { verifyRoom } from '../errors/VerifyRoom';

export async function indicate(msg: Message) {
  const session = await hasSession(msg);

  if (!session) return noSession(msg);

  const fName = msg.content.replace('!indica', '').trim();
  const filmName = titleize(fName);

  if (!filmName)
    return embedMessage('Insira o nome do filme', msg, 160000);

  const compareDate = addMinutes(new Date(session.data.started_at), 15);

  if (isAfter(Date.now(), compareDate))
    return embedMessage('Prazo para indicação expirou.', msg, 160000);

  const user = await verifyRoom(msg);

  if (!user)
    return embedMessage('Usuário não encontrado.', msg, 160000);

  if (user.data.raffle_streak === 2) {
    if (!user.data.penalty) {
      await fauna.query(
        q.Let(
          {
            doc: q.Get(q.Match(q.Index("user_by_name"), user.data.name)),
          },
          q.Update(
            q.Select(["ref"], q.Var('doc')),
            {
              data: {
                penalty: session.data.session_number + 1,
                sessions_without_raffle: q.Add(1, q.Select(["data", "sessions_without_raffle"], q.Var("doc"))),
              }
            }
          )
        )
      );

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('sessions'), session.ref.id),
          {
            data: {
              room: [...session.data.room, user.data.name],
            }
          },
        )
      );

      return embedMessage('Você foi sorteado por 2 sessões seguidas. Fique essa e a proxima sessão sem indicar.', msg, 160000);
    } else if (user.data.penalty >= session.data.session_number) {
      await fauna.query(
        q.Let(
          {
            doc: q.Get(q.Match(q.Index("user_by_name"), user.data.name)),
          },
          q.Update(
            q.Select(["ref"], q.Var('doc')),
            {
              data: {
                sessions_without_raffle: q.Add(1, q.Select(["data", "sessions_without_raffle"], q.Var("doc"))),
              }
            }
          )
        )
      );

      return embedMessage('Ainda não meu patrão, aguarde a próxima sessão!', msg, 160000);
    } else if (user.data.penalty < session.data.session_number) {
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              penalty: null,
              raffle_streak: 0,
            }
          },
        )
      );
    }
  }

  const findByUsername = session.data.indications.some(indication => indication.username === user.data.name);

  if (findByUsername) {
    return embedMessage('Você já indicou seu filme.', msg, 160000);
  } else {
    embedMessage(`${user.data.name} indicou o filme: ${filmName}`, msg, 160000);

    let drawChances: Indication[] = [];

    if (user.data.sessions_without_raffle < 5) {
      drawChances.push({
        username: user.data.name,
        indicate: filmName,
      });
    } else if (user.data.sessions_without_raffle >= 5) {
      for (let count = 0; count < 2; count++) {
        drawChances.push({
          username: user.data.name,
          indicate: filmName,
        });
      }
    } else if (user.data.sessions_without_raffle >= 10) {
      for (let count = 0; count < 4; count++) {
        drawChances.push({
          username: user.data.name,
          indicate: filmName,
        });
      }
    } else if (user.data.sessions_without_raffle >= 15) {
      for (let count = 0; count < 6; count++) {
        drawChances.push({
          username: user.data.name,
          indicate: filmName,
        });
      }
    }

    const updatedIndications = session.data.indications.concat(drawChances);

    let updatedRoom: string[] = [...session.data.room];

    if (!session.data.room.includes(user.data.name)) {
      updatedRoom = [
        ...session.data.room,
        user.data.name,
      ]

      embedMessage(`Bem vindo à sala ${user.data.name}.`, msg, 160000);
    }

    await fauna.query(
      q.Update(
        q.Ref(q.Collection('sessions'), session.ref.id),
        {
          data: {
            indications: updatedIndications,
            room: updatedRoom,
          }
        },
      )
    );
  }
}