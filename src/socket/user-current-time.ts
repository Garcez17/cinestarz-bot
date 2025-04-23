import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { partyCache } from "../utils/PartyStateCache"

export async function userCurrentTime(socket: Socket) {
  socket.on('user_current_time', async (data) => {
    const { partyId, currentTime, runAt } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    const user = session.participants.find((participant: any) => participant.socketId === socket.id)

    if (session.host !== user?.id) return

    partyCache.set(partyId, { currentTime, runAt })

    console.log('user_current_time ==>', data, socket.id)
  })
}