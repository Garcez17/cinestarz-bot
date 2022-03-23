import { Message } from "discord.js";

import { noSession } from "../errors/NoSession";
import { embedMessage } from "../utils/EmbedMessage";
import { hasSession } from "../utils/hasSession";

export async function list(msg: Message) {
  const session = await hasSession(msg);
  
  if (!session || !session.data.started_at) return noSession(msg);

  const filteredList = session.data.indications.filter((indication, index) => {
    if (indication.username !== session.data.indications[index - 1]?.username) {
      return indication;
    }
  });

  const listFilms = filteredList.map(indication => {
    const fields = {
      name: indication.indicate,
      value: indication.username,
    }

    return fields;
  });

  session.data.indications.length === 0 ?
    embedMessage('Não tem filmes na lista.', msg, 160000) :
    msg.channel.send({ 
      embed: {
        color: 3447003,
        fields: [ ...listFilms ],
      },
    });
}