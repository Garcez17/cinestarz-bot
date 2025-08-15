import type { Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";
import { activeVotes } from "..";

export async function requestSeek(socket: Socket) {
  socket.on(SOCKET_EVENTS.REQ.SEEK, async (data) => {
    const { partyId, user, seconds } = data

    const voteSession = activeVotes.get(partyId)

    if (voteSession && voteSession?.requestedBy.id === user.id) {
      return
    }

    const party = await getActiveParty({ partyId })

    if (!party) return

    const session = party.data();

    const userData = {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
      confirm: true
    }

    console.log(`user requested seek =>`, userData)

    console.log('SECONDS =>', seconds)

    activeVotes.set(partyId, {
      action: 'seek',
      requestedBy: userData,
      votes: new Map([[userData.id, userData]]),
      time: seconds,
    })

    setTimeout(() => {
      activeVotes.delete(partyId)
      console.log('votação encerrada')
    }, 45000) // 45s

    console.log(`Votação de seek criada para sala ${session.collectionName}`)

    socket.nsp.to(session.collectionName)
      .emit(SOCKET_EVENTS.RES.SEEK, {
        action: 'seek',
        requestedBy: userData,
        votes: [userData],
        participantsLength: session?.participants.length,
        seconds: seconds,
      })
  })
}
