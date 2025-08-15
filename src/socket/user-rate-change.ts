import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { partyCache } from "../utils/PartyStateCache"
import { SOCKET_EVENTS } from "../@types/constants"

export async function userRateChange(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.RATE_CHANGE, async (data) => {
    const { partyId, currentRate, runAt, currentTime } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    const user = session.participants.find((participant: any) => participant.socketId === socket.id)

    if (session.host.userId !== user?.id) return

    partyCache.set(partyId, { currentRate, runAt, currentTime })

    console.log('user change video speed =>', {
      socketId: socket.id,
      currentRate
    })

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.CURRENT_RATE, { userCurrentTime: currentTime, currentRate })
  })
}