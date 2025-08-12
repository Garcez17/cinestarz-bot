import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { SOCKET_EVENTS } from "../@types/constants"

export async function pause(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.PAUSE, async (data) => {
    const { partyId } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    console.log('pause!!')

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.PAUSE)
  })
}