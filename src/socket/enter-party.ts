import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { updateDoc } from "firebase/firestore"
import { partyCache } from "../utils/PartyStateCache"
import { SOCKET_EVENTS } from "../@types/constants"

export async function enterParty(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.JOIN_PARTY, async (data, callback) => {
    const { partyId, user } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    socket.join(session.collectionName)

    const participants = session.participants.map((participant: any) => participant.id === user.id ? ({
      ...participant,
      socketId: socket.id,
    }) : participant)

    updateDoc(party.ref, { participants })

    console.log('NEW USER =>', {
      user,
      socket: socket.id,
    })

    const userData = {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
    }

    const isHost = participants.find((participant: any) => participant.id === user.id).id === session.host

    const cached = partyCache.get(partyId)

    callback({
      syncTime: cached?.currentTime, 
      isHost,
      enableRequests: session.content.enableRequests,
      onlyHostControls: session.content.onlyHostControls,
    })

    socket.broadcast.to(session.collectionName).emit(SOCKET_EVENTS.EVT.NEW_USER, userData)
  })
}