import type { Socket } from "socket.io"
import type { Client } from "discord.js"
import { startSession } from "../commands/start"
import { normalizeTitle } from "../utils/normalizeSessionTitle"
import { getFilmDetails } from "../commands/raffle"
import { getSession } from "../utils/getSession"
import { generateParty } from "../commands/party"

export async function createParty(socket: Socket, client: Client) {
  socket.on('req_create_party', async (data, cb) => {
    const { userId, content } = data

    const guilds = client.guilds.cache

    for (const [_, guild] of guilds) {
      const member = await guild.members.fetch(userId)
      if (!member) continue

      const voiceChannel = member.voice.channel

      if (voiceChannel) {
        const sessionStatus = await startSession({
          channel: voiceChannel,
          guildId: guild.id,
          user: {
            avatar: member.avatar,
            displayName: member.displayName,
            id: member.id,
            username: member.user.username
          }
        })

        if (sessionStatus === 'SESSION_ALREADY_EXISTS') {
          return
        }

        const { ref, session } = await getSession({
          channel: voiceChannel,
          guildId: guild.id,
        })

        if (!ref) return

        await getFilmDetails({
          channel: voiceChannel,
          providerContent: content.provider,
          suggestion: {
            content: normalizeTitle(content.title),
            rawTitle: content.title,
            userId: member.id,
          },
          ref,
        })

        await generateParty({
          authorId: member.id,
          channel: voiceChannel,
          collectionName: session!.collectionName,
          link: content.url,
          content,
          ref,
          session: session!,
        })

        cb({ session })
        break
      }
    }
  })
}