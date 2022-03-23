import { Message } from "discord.js";
import { noSession } from "../errors/NoSession";
import { embedMessage } from "../utils/EmbedMessage";
import { hasSession } from "../utils/hasSession";

export async function showRoom(msg: Message) {
  const session = await hasSession(msg);
  
  if (!session || !session.data.started_at) return noSession(msg);

  if (session.data.room.length === 0) 
    return embedMessage('Sala vazia.', msg, 160000);

  embedMessage(`${session.data.room.toString().replace(',', ', ')}.`, msg, 160000);
}