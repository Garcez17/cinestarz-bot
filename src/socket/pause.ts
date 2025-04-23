import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"

export async function pause(socket: Socket) {
  socket.on('req_pause', async (data) => {
    const { partyId } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    console.log('pause!!')

    socket.broadcast.to(session.collectionName)
      .emit('pause')
  })
}