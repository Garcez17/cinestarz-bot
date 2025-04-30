import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { partyCache } from "../utils/PartyStateCache"

export async function userRateChange(socket: Socket) {
  socket.on('rate_change', async (data) => {
    const { partyId, currentRate, runAt, currentTime } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    const user = session.participants.find((participant: any) => participant.socketId === socket.id)

    if (session.host !== user?.id) return

    partyCache.set(partyId, { currentRate, runAt, currentTime })

    console.log('user change video speed =>', {
      socketId: socket.id,
      currentRate
    })

    socket.broadcast.to(session.collectionName)
      .emit('user_rate_time', { userCurrentTime: currentTime, currentRate })
  })
}