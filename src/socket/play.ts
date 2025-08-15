import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { SOCKET_EVENTS } from "../@types/constants"
import { partyCache } from "../utils/PartyStateCache"

export async function play(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.PLAY, async (data) => {
    const { partyId, currentRate, runAt, currentTime } = data

    console.log({
      partyId, currentRate, runAt, currentTime
    })

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    console.log('play!!')

    const partyData = { 
      currentRate,
      runAt,
      currentTime,
      paused: false,
    }

    partyCache.set(partyId, partyData)

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.PLAY, partyData)
  })
}