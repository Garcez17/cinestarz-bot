import { fauna } from "../../services/fauna";
import { query as q } from 'faunadb';
import { Message } from "discord.js";
import { embedMessage } from "../../utils/EmbedMessage";
import { titleize } from "../../utils/titleize";
import { Award } from "../award";

export async function storeInDatabase(code: number, film: string, msg: Message, awardDatabase: Award) {
  const film_title = titleize(film);

  if (!film_title) return;

  const indication = {
    film_title,
    votes: 0,
    user_indicator_id: msg.author.id,
  }

  const indicationsInDatabase = awardDatabase.award.data[`category_${code}`] ?? [];
  
  const updatedCategoryList = [...indicationsInDatabase, indication];

  try {
    await fauna.query(
      q.If(
        q.Not(
          q.Exists(
            q.Match(
              q.Index('award_by_server_id'),
              q.Casefold('877237861638869075')
            )
          )
        ),
        q.Create(
          q.Collection('award'),
          {
            data: {
              server_id: '877237861638869075',
              [`category_${code}`]: [{
                film_title: titleize(film),
                votes: 0,
                user_indicator_id: msg.author.id,
              }]
            }
          }
        ),
        q.Let(
          {
            doc: q.Get(q.Match(q.Index("award_by_server_id"), '877237861638869075')),
          },
          q.Update(
            q.Select(["ref"], q.Var('doc')),
            {
              data: {
                [`category_${code}`]: updatedCategoryList,
              }
            }
          )
        )
      ),
    );

    embedMessage('Indicação registrada com sucesso.', msg, 160000);
  } catch (err) {
    console.log(err);
    embedMessage('Erro interno do servidor. 😢', msg, 160000);
  }
}