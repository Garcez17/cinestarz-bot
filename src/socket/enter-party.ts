import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getParty"

export async function enterParty(socket: Socket) {
  socket.on('enter-party', async (data, callback) => {
    const { partyId, user } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    socket.join(session.collectionName)

    const userData = {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
    }

    // callback(userData)

    socket.broadcast.to(session.collectionName).emit('new-user', userData)
  })
}