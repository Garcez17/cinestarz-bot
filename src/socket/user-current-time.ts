import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { partyCache } from "../utils/PartyStateCache"
import { SOCKET_EVENTS } from "../@types/constants"

export async function userCurrentTime(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.HOST_CURRENT_TIME, async (data) => {
    const { partyId, currentTime, runAt } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    const user = session.participants.find((participant: any) => participant.socketId === socket.id)

    if (session.host.userId !== user?.id) return

    partyCache.set(partyId, { currentTime, runAt })

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.HOST_CURRENT_TIME, { hostCurrentTime: currentTime })
  })
}