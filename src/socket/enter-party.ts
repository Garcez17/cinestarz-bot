import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import type { Socket } from "socket.io";
import { firestore } from "../services/firebase";
import { io } from "..";

export async function enterParty(socket: Socket) {
  socket.on('enter-party', async (data, callback) => {
    const { partyId } = data

    console.log('partyId ==>', partyId)

    const q = query(
      collectionGroup(firestore, 'sessions'),
      where('status', 'in', ['OPEN', 'VOTING'])
    )

    const snapshot = await getDocs(q)

    const matchingSession = snapshot.docs.find(doc => doc.id === partyId)

    if (matchingSession) {
      const session = matchingSession.data()

      socket.join(session.collectionName)

      console.log('rooms', Array.from(socket.rooms))
      callback({
        name: 'new-user',
        avatarUrl: 'avatar-url',
        socketId: 'socket-id'
      })
    } else {
      // send an error to extension
    }
  })
}