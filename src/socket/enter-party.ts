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

    const userData = {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
    }

    let participants = [...session.participants];

    const existingIndex = participants.findIndex((p: any) => p.id === user.id);

    if (existingIndex >= 0) {
      participants[existingIndex] = {
        ...participants[existingIndex],
        socketId: socket.id,
      };
    } else {
      participants.push(userData);
    }

    await updateDoc(party.ref, { participants });

    console.log('NEW USER =>', {
      user,
      socket: socket.id,
    })

    const isHost = participants.find((participant: any) => participant?.id === user.id)?.id === session.host.userId

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