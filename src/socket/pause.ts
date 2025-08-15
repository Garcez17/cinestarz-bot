import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { SOCKET_EVENTS } from "../@types/constants"
import { partyCache } from "../utils/PartyStateCache"

export async function pause(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.PAUSE, async (data) => {
    const { partyId, currentRate, runAt, currentTime } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    console.log('pause!!')

    const partyData = { 
      currentRate,
      runAt,
      currentTime,
      paused: true,
    }

    partyCache.set(partyId, partyData)

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.PAUSE, partyData)
  })
}