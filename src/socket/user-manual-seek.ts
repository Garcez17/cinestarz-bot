import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { SOCKET_EVENTS } from "../@types/constants"
import { partyCache } from "../utils/PartyStateCache"

export async function userManualSeek(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.MANUAL_SEEK, async (data) => {
    const { partyId, currentTime, runAt, currentRate } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    partyCache.set(partyId, { 
      currentRate,
      runAt,
      currentTime,
      paused: true,
    })

    console.log('manual_seek ==>', data)

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.MANUAL_SEEK, { currentTime })
  })
}