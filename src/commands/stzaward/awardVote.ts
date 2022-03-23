import { Message } from "discord.js";
import { fauna } from "../../services/fauna";
import { query as q } from 'faunadb';
import { Award } from "../award";
import { embedMessage } from "../../utils/EmbedMessage";

export async function awardVote(msg: Message) {
  const codeAndIndication = msg.content.replace('!votar', '').trim();

  const [code, candidateCode] = codeAndIndication.split(/ (.+)/);

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

  const NumberCode = Number(code);

  const category = awardDatabase.award.data[`category_${NumberCode}`];

  const nominees = category.map((category, index) => {
    const fields = {
      name: category.film_title,
      value: `Para votar digite !votar ${code} ${index + 1}`,
    }

    return fields;
  });

  if (!candidateCode) {
    return msg.channel.send({
      embed: {
        color: 3447003,
        title: `Categoria ${NumberCode}`,
        fields: [
          ...nominees,
        ],
      },
    });
  }

  if (category[Number(candidateCode) - 1].user_indicator_id === msg.author.id) 
    return embedMessage('Você não pode votar na sua propria indicação.', msg, 160000);

  const findUserAlreadyVote = category.some(category => {
    if (!category.votes_id) return false;

    return category.votes_id.includes(msg.author.id);
  });

  if (findUserAlreadyVote)
    return embedMessage('Você já votou nesta categoria.', msg, 160000);
    
  const newCategoryList = category.map((candidate, index) => {
    if ((index + 1) === Number(candidateCode)) {
      return {
        ...candidate,
        votes: candidate.votes + 1,
        votes_id: [...candidate?.votes_id ?? [], msg.author.id]
      }
    } else {
      return candidate;
    }
  });

  try {
    await fauna.query(
      q.Update(
        q.Ref(q.Collection('award'), '313260249141215299'),
        {
          data: {
            [`category_${Number(code)}`]: newCategoryList,
          }
        },
      )
    );
 
    embedMessage('Voto registrado!', msg, 160000);
  } catch (err) {
    console.log(err);
    embedMessage('Erro interno do servidor. 😢', msg, 160000);
  }
}