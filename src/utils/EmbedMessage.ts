import { EmbedBuilder, Message, type OmitPartialGroupDMChannel } from "discord.js";
import type { DiscordChannel } from "../@types";

export async function embedMessage(title: string, channel: DiscordChannel, color: number): Promise<void> {
  const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(title)
      .setTimestamp()

  await channel.send({
    embeds: [embed],
    components: [],
  })
}