import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"

export async function play(socket: Socket) {
  socket.on('req_play', async (data) => {
    const { partyId } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    console.log('play!!')

    socket.broadcast.to(session.collectionName)
      .emit('play')
  })
}