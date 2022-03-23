import { Message } from "discord.js";

import { noSession } from "../errors/NoSession";
import { embedMessage } from "../utils/EmbedMessage";
import { hasSession } from "../utils/hasSession";

export async function average(msg: Message) {
  const session = await hasSession(msg);

  if (!session || !session.data.started_at) return noSession(msg);

  if (session.data.raffle_film.notes.length === 0)
    return embedMessage('Ainda não há notas.', msg, 160000);

  const noteFields = session.data.raffle_film.notes.map(userNote => {
    const fields = {
      name: userNote.username,
      value: userNote.note,
    }

    return fields;
  });

  msg.channel.send({ 
    embed: {
      color: 3447003,
      title: session.data.raffle_film.title,
      fields: [
        {
          name: "Média",
          value: session.data.raffle_film.average,
        },
        ...noteFields,
      ],
    },
  });
}