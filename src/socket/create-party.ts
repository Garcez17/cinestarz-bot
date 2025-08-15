import type { Socket } from "socket.io"
import type { Client } from "discord.js"
import { startSession } from "../commands/start"
import { normalizeTitle } from "../utils/normalizeSessionTitle"
import { getFilmDetails } from "../commands/raffle"
import { getSession } from "../utils/getSession"
import { generateParty } from "../commands/party"
import { SOCKET_EVENTS } from "../@types/constants"

export async function createParty(socket: Socket, client: Client) {
  socket.on(SOCKET_EVENTS.EVT.CREATE_PARTY, async (data, cb) => {
    const { userId, content } = data

    for (const [, guild] of client.guilds.cache) {
      let member

      try {
        member = await guild.members.fetch(userId)
      } catch (error: any) {
        if (error.code === 10007) {
          continue
        }
        throw error
      }

      if (!member) continue

      const voiceChannel = member.voice.channel
      if (!voiceChannel) continue

      const sessionStatus = await startSession({
        channel: voiceChannel,
        guildId: guild.id,
        user: {
          avatar: member.avatar,
          socketId: socket.id,
          displayName: member.displayName,
          id: member.id,
          username: member.user.username
        }
      })

      if (sessionStatus === "SESSION_ALREADY_EXISTS") {
        return
      }

      const { ref, session } = await getSession({
        channel: voiceChannel,
        guildId: guild.id
      })

      if (!ref) return

      await getFilmDetails({
        channel: voiceChannel,
        providerContent: content.provider,
        suggestion: {
          content: normalizeTitle(content.title),
          rawTitle: content.title,
          userId: member.id
        },
        ref
      })

      await generateParty({
        authorId: member.id,
        channel: voiceChannel,
        collectionName: session!.collectionName,
        link: content.url,
        content,
        ref,
        session: session!
      })

      cb({ session });
      break
    }
  })
}
