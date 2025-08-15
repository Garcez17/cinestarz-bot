import type { Socket } from "socket.io";
import { activeVotes } from "..";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";
import { partyCache } from "../../../utils/PartyStateCache";

export async function votePause(socket: Socket) {
  socket.on(SOCKET_EVENTS.VOTE.PAUSE, async (data) => {
    const { partyId, user, confirm } = data;

    console.log('vote for pause =>', { user, socket: socket.id })

    const party = await getActiveParty({ partyId });
    if (!party) return;

    const session = party.data();

    const voteSession = activeVotes.get(partyId);
    if (!voteSession || voteSession.action !== "pause") {
      console.log('[PAUSE] VOTING NOT FOUND')
      return
    }

    voteSession.votes.set(user.id, {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
      confirm: true,
    })

    socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.RES.PAUSE, {
      action: "pause",
      requestedBy: voteSession.requestedBy,
      votes: Array.from(voteSession.votes.values()),
      participantsLength: session?.participants.length,
    })

    const totalMembers = session.participants.length
    const yesVotes = Array.from(voteSession.votes.values()).filter(v => v.confirm).length

    console.log('SEND SOCKET EVENT VOTE =>', {
      yesVotes,
      needToAccept: totalMembers / 2,
    })

    if (yesVotes > totalMembers / 2) {
      console.log('SEND PAUSE EVENT');

      const cached = partyCache.get(partyId);
      const payload = cached
        ? {
            currentTime: cached.currentTime,
            currentRate: cached.currentRate,
            paused: true,
            runAt: cached.runAt,
          }
        : {
            currentTime: 0,
            currentRate: 1,
            paused: true,
            runAt: Date.now(),
          };

      socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.EVT.PAUSE, payload)

      activeVotes.delete(partyId);
    }
  });
}
