import { Message } from "discord.js";
import { embedMessage } from "../utils/EmbedMessage";
import type { DiscordChannel } from "../@types";

interface NoSessionProps {
  channel: DiscordChannel
}

export function noSession({ channel }: NoSessionProps): void {
  embedMessage('Não há sessão em andamento.', channel, 160000);
}