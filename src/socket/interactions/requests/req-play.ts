import type { Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";
import { activeVotes } from "..";

export async function requestPlay(socket: Socket) {
  socket.on(SOCKET_EVENTS.REQ.PLAY, async (data) => {
    const { partyId, user } = data

    console.log('REQUEST PLAY ==>', { partyId, user })

    const voteSession = activeVotes.get(partyId)

    if (voteSession && voteSession?.requestedBy.id === user.id) {
      return
    }

    const party = await getActiveParty({ partyId });
    if (!party) return;

    const session = party.data();

    const userData = {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
      confirm: true,
    }

    console.log(`user requested pause =>`, userData)

    activeVotes.set(partyId, {
      action: 'play',
      requestedBy: userData,
      votes: new Map([[userData.id, userData]])
    });

    setTimeout(() => {
      activeVotes.delete(partyId);
      console.log('votação encerrada')
    }, 15000); // 15s

    console.log(`Votação de play criada para sala ${session.collectionName}`);

    socket.nsp.to(session.collectionName)
      .emit(SOCKET_EVENTS.RES.PLAY, {
        action: 'play',
        requestedBy: userData,
        votes: [userData],
        participantsLength: session?.participants.length + 1, // + 1 ONLY FOR TESTS
      });
  });
}
