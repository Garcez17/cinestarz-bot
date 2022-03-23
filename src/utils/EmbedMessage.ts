import { Message } from "discord.js";

export function embedMessage(title: string, msg: Message, color: number): void {
  msg.channel.send({
    embed: {
      color,
      title,
    },
  });
}