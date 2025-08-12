import type { Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";
import { activeVotes } from "..";

export async function requestPlay(socket: Socket) {
  socket.on(SOCKET_EVENTS.REQ.PLAY, async (data) => {
    const { partyId, user } = data

    const party = await getActiveParty({ partyId });
    if (!party) return;

    const session = party.data();

    const userData = {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
    }

    activeVotes.set(partyId, {
      action: 'play',
      requestedBy: userData,
      votes: new Map()
    });

    setTimeout(() => {
      activeVotes.delete(partyId);
      console.log('votação encerrada')
    }, 45000); // 15s

    console.log(`Votação de play criada para sala ${session.collectionName}`);

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.RES.PLAY, {
        action: 'play',
        requestedBy: userData,
        votes: []
      });
  });
}
