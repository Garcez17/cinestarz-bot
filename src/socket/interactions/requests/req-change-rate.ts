import type { Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";
import { activeVotes } from "..";

export async function requestChangeRate(socket: Socket) {
  socket.on(SOCKET_EVENTS.REQ.CHANGE_RATE, async (data) => {
    const { partyId, user, speed } = data

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

    console.log(`user requested changerate =>`, userData)

    activeVotes.set(partyId, {
      action: 'speed',
      requestedBy: userData,
      votes: new Map([[userData.id, userData]]),
      speed,
    })

    setTimeout(() => {
      activeVotes.delete(partyId)
      console.log('votação encerrada')
    }, 15000) // 15s

    console.log(`Votação de changerate criada para sala ${session.collectionName}`)

    socket.nsp.to(session.collectionName)
      .emit(SOCKET_EVENTS.RES.CHANGE_RATE, {
        action: 'changerate',
        requestedBy: userData,
        votes: [userData],
        participantsLength: session?.participants.length,
      })
  })
}
