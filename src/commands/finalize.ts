import { query as q } from 'faunadb';
import { MessageButton } from "discord-buttons";
import { Message } from "discord.js";
import { google } from 'googleapis';

import { fauna } from "../services/fauna";

import { User } from "../@types";
import { noSession } from "../errors/NoSession";
import { hasSession } from "../utils/hasSession";
import { average } from "./average";
import { embedMessage } from '../utils/EmbedMessage';

export type Users = {
  data: User[];
}

export async function finalize(msg: Message): Promise<void> {
  const session = await hasSession(msg);
  
  if (!session || !session.data.started_at) return noSession(msg);

  if (session.data.raffle_film.notes.length === 0)
    return embedMessage('O filme ainda não recebeu notas.', msg, 160000);

  average(msg);

  const notes = session.data.raffle_film.notes;

  const users = await fauna.query<Users>(
    q.Map(
      q.Paginate(
        q.Match(q.Index("all_users"))
      ),
      q.Lambda("X", q.Get(q.Var("X")))
    )
  );

  const notesInSheet = users.data.map(usr => {
    const findUserInNotes = notes.find(user => user.username === usr.data.name);

    if (!findUserInNotes) return '-';

    return findUserInNotes.note;
  })

  const sheetsNotes = [
    session.data.raffle_film.title,
    session.data.raffle_film.year,
    session.data.raffle_film.runtime,
    session.data.raffle_film.indicated_by,
    ...notesInSheet,
    '-',
    session.data.raffle_film.average,
  ];

  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  })

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  const request = {
    auth,
    spreadsheetId,
    range: "Página1!A:M",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [sheetsNotes],
    },
  };

  await googleSheets.spreadsheets.values.append(request);

  const sheetsButton = new MessageButton()
    .setStyle('url')
    .setLabel('Vizualizar tabela')
    .setURL('https://docs.google.com/spreadsheets/d/1TSXl_humuJfQSK4sZozkJvWEl1xdzFIQdkAqHVzkLfs/edit?usp=sharing')
  
  msg.channel.send({ 
    embed: {
      color: 160000,
      title: `FIM DA SESSÃO! Obrigado.`,
    },
    button: [sheetsButton],
  });

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
            session_number: q.Add(1, q.Select(["data", "session_number"], q.Var("doc"))),
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
    ),
  )

  const { indicated_by } = session.data.raffle_film;

  session.data.room.forEach(async userInRoom => {
    if (indicated_by === userInRoom) {
      try {
        await fauna.query(
          q.Let(
            {
              doc: q.Get(q.Match(q.Index("user_by_name"), userInRoom)),
            },
            q.Update(
              q.Select(["ref"], q.Var('doc')),
              {
                data: {
                  raffle_streak: q.Add(1, q.Select(["data", "raffle_streak"], q.Var("doc"))),
                  sessions_without_raffle: 0,
                }
              }
            ),
          )
        )
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await fauna.query(
          q.Let(
            {
              doc: q.Get(q.Match(q.Index("user_by_name"), userInRoom)),
            },
            q.Update(
              q.Select(["ref"], q.Var('doc')),
              {
                data: {
                  raffle_streak: 0,
                  sessions_without_raffle: q.Add(1, q.Select(["data", "sessions_without_raffle"], q.Var("doc"))),
                }
              }
            )
          )
        )
      } catch (err) {
        console.log(err);
      }
    }
  });

  const restUsers = users.data.filter(usr => !session.data.room.includes(usr.data.name));

  restUsers.forEach(async user => {
    try {
      await fauna.query(
        q.Let(
          {
            doc: q.Get(q.Match(q.Index("user_by_name"), user.data.name)),
          },
          q.Update(
            q.Select(["ref"], q.Var('doc')),
            {
              data: {
                raffle_streak: 0,
              }
            }
          ),
        )
      )
    } catch (err) {
      console.log(err);
    }
  })
}