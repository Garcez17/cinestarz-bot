import { Message } from "discord.js";
import { fauna } from "../services/fauna";
import { query as q } from 'faunadb';

import { infoAward } from "./stzaward/infoAward";
import { google } from 'googleapis';
import { embedMessage } from "../utils/EmbedMessage";
import { storeInDatabase } from "./stzaward/storeInDatabase";
import { verifyAwardIndication } from "../utils/verifyAwardIndication";
import { findAllIndicatedMovies } from "../utils/findAllIndicatedMovies";
import { verfiyIndicationFormat } from "../utils/verfiyIndicationFormat";

export type Category = {
  film_title: string;
  votes: number;
  user_indicator_id: string;
  votes_id: string[];
}

export type Award = {
  award: {
    ref: string;
    data: {
      [category: string]: Category[];
    }
  }
}

export async function award(msg: Message) {
  const codeAndIndication = msg.content.replace('!premiostz', '').trim();

  const [code, filmName] = codeAndIndication.split(/ (.+)/);
  const [, suffix] = filmName?.split(' - ') ?? [];

  const stringFormat = verfiyIndicationFormat(filmName, Number(code));

  if (!stringFormat)
    return embedMessage('Formato inválido para essa categoria.', msg, 160000);

  const awardDatabase = await fauna.query<Award>(
    q.Let(
      {
        ref: q.Match(
          q.Index('award_by_server_id'),
          q.Casefold('877237861638869075')
        ),
      },
      q.If(
        q.Exists(q.Var('ref')),
        {
          type: 'Award',
          award: q.Get(q.Var('ref'))
        },
        {
          type: 'Error',
          message: 'session not found.',
          code: 42
        }
      )
    )
  );

  if (!code && !filmName) return infoAward(msg, awardDatabase.award.data);

  if (!filmName)
    return embedMessage('Insira a indicação.', msg, 160000);

  if (!code)
    return embedMessage('Código inválido', msg, 160000);

  const userHasAlreadyIndicated = verifyAwardIndication(awardDatabase, msg, Number(code));

  if (userHasAlreadyIndicated)
    return embedMessage('Você já indicou para esta categoria.', msg, 160000);

  const indicatedFilms = await findAllIndicatedMovies(awardDatabase, Number(code));

  const findAlreadyIndicatedFilm = indicatedFilms?.some(indicatedFilm => indicatedFilm.film_title.toLocaleLowerCase() === filmName.toLocaleLowerCase())

  if (findAlreadyIndicatedFilm)
    return embedMessage('Esse filme já foi indicado nessa categoria.', msg, 160000);

  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  const request = {
    spreadsheetId,
    range: 'Página1!A:A',
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: 'FORMATTED_STRING',
    auth,
  };

  try {
    const response = (await googleSheets.spreadsheets.values.get(request)).data.values;

    let hasFilm = false;
    let hasFilmSuffix = false;

    response?.forEach((arrFilm: string[]) => {
      const hasFilmInSheet = arrFilm[0]?.toLowerCase() === filmName.toLowerCase();
      const hasFilmSuffixInSheet = arrFilm[0]?.toLowerCase() === suffix?.toLowerCase();
      if (hasFilmInSheet) hasFilm = true;
      if (hasFilmSuffixInSheet) hasFilmSuffix = true;
    });

    if (suffix) {
      if (!hasFilmSuffix) return embedMessage('Filme não encontrado na lista.', msg, 160000);
    } else {
      if (!hasFilm) return embedMessage('Filme não encontrado na lista.', msg, 160000);
    }

    await storeInDatabase(Number(code), filmName, msg, awardDatabase);
  } catch (err) {
    console.error(err);
    embedMessage('Erro interno do servidor. 😢', msg, 160000);
  }
}