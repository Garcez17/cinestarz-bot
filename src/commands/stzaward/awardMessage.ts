import { Client } from "discord.js";
import { fauna } from "../../services/fauna";
import { query as q } from 'faunadb';
import { Users } from "../finalize";

export async function awardMessage(client: Client) {
  const users = await fauna.query<Users>(
    q.Map(
      q.Paginate(
        q.Match(q.Index("all_users"))
      ),
      q.Lambda("X", q.Get(q.Var("X")))
    )
  );

  users.data.forEach(usr => {
    client.users.fetch(usr.data.id, false).then((user) => {
      user.send({
        embed: {
          color: 3447003,
          title: 'Prêmio CINESTARZ! Digite !premiostz para informações.',
        }
      });
    });
  })
}