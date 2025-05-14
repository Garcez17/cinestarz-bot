import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"

export async function getParty(socket: Socket) {
  socket.on('get-party', async (data, callback) => {
    const { partyId } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    const partyData = {
      content: session?.content,
      participants: session.participants,
    }

    callback(partyData)
  })
}