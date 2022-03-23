import { Message } from "discord.js";
import { query as q } from 'faunadb';

import { fauna } from "../services/fauna";

import { noSession } from "../errors/NoSession";
import { verifyRoom } from "../errors/VerifyRoom";
import { hasSession } from "../utils/hasSession";
import { Note } from "../@types";
import { embedMessage } from "../utils/EmbedMessage";

export async function notes(msg: Message) {
  const session = await hasSession(msg);

  if (!session || !session.data.started_at) return noSession(msg);

  if (!session.data.raffle_film.title) {
    return embedMessage('Não há filme sorteado.', msg, 160000);
  }

  const user = await verifyRoom(msg);

  if (!user)
    return embedMessage('Usuário não encontrado', msg, 160000);

  if (!session.data.room.includes(user.data.name))
    return embedMessage('Usuário fora da sala.', msg, 160000);

  const stringNote = msg.content.replace('!nota', '').trim();

  const validInput = /^[\d,.?!]+$/.test(stringNote);

  if (!validInput)
    return embedMessage('Discordo craque', msg, 160000);

  const note = Number(stringNote.replace(',', '.'));

  if (String(note).trim() === '')
    return embedMessage('Informe a nota.', msg, 160000);

  if (note < 0 || note > 10)
    return embedMessage('Discordo craque', msg, 160000);

  const findByUsername = session.data.raffle_film.notes.some(note => note.username === user.data.name);

  let updatedNotes: Note[] = [];

  if (findByUsername) {
    const newRaffledFilmNotes = session.data.raffle_film.notes.map(film => film.username === user.data.name ? {
      ...film,
      note,
    } : film);

    updatedNotes = newRaffledFilmNotes;

    session.data.raffle_film.notes = newRaffledFilmNotes;

    await fauna.query(
      q.Update(
        q.Ref(q.Collection('sessions'), session.ref.id),
        {
          data: {
            raffle_film: {
              notes: newRaffledFilmNotes,
            }
          }
        },
      )
    );
  } else {
    const userNote = {
      id: msg.author.id,
      username: user.data.name,
      note,
    }

    updatedNotes = [...session.data.raffle_film.notes, userNote];

    await fauna.query(
      q.Update(
        q.Ref(q.Collection('sessions'), session.ref.id),
        {
          data: {
            raffle_film: {
              notes: [...session.data.raffle_film.notes, userNote],
            }
          }
        },
      )
    );
  }

  const sumNotes = updatedNotes.reduce((acc, userNote) => {
    return acc += userNote.note;
  }, 0);

  await fauna.query(
    q.Update(
      q.Ref(q.Collection('sessions'), session.ref.id),
      {
        data: {
          raffle_film: {
            average: Number((sumNotes / updatedNotes.length).toFixed(2)),
          }
        }
      },
    )
  );

  embedMessage(`${user.data.name} deu nota ${note}`, msg, 160000);
}