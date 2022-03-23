import { Message } from "discord.js";
import { embedMessage } from "../utils/EmbedMessage";

export function noSession(msg: Message): void {
  embedMessage('Não há sessão em andamento.', msg, 160000);
}