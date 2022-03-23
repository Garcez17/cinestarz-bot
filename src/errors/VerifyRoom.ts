import { query as q } from 'faunadb';
import { Message } from "discord.js";

import { fauna } from "../services/fauna";
import { FindOneUser, User } from '../@types';

export async function verifyRoom(msg: Message): Promise<User | null> {
  try {
    const { user, type } = await fauna.query<FindOneUser>(
      q.Let(
        {
          ref: q.Match(
            q.Index('user_by_discord_id'),
            q.Casefold(msg.author.id)
          ),
        },
        q.If(
          q.Exists(q.Var('ref')),
          {
            type: 'User',
            user: q.Get(q.Var('ref'))
          },
          {
            type: 'Error',
            message: 'session not found.',
            code: 42
          }
        )
      )
    )

    if (type === 'User') return user;

    return null;
  } catch (err) {
    return null;
  }
}