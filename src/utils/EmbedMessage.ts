import { EmbedBuilder, Message, type OmitPartialGroupDMChannel } from "discord.js";

export async function embedMessage(title: string, msg: OmitPartialGroupDMChannel<Message<boolean>>, color: number): void {
  const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(title)
      .setTimestamp()

  await msg.channel.send({
    embeds: [embed],
    components: [],
  })
}