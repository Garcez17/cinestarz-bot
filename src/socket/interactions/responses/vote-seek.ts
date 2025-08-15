import type { Socket } from "socket.io";
import { activeVotes } from "..";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";
import { partyCache } from "../../../utils/PartyStateCache";

export async function voteSeek(socket: Socket) {
  socket.on(SOCKET_EVENTS.VOTE.SEEK, async (data) => {
    const { partyId, user, confirm } = data

    console.log('vote for seek =>', { user, socket: socket.id })

    const party = await getActiveParty({ partyId })
    if (!party) return

    const session = party.data()

    const voteSession = activeVotes.get(partyId);
    if (!voteSession || voteSession.action !== "seek") {
      console.log('[SEEK] VOTING NOT FOUND')
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

    socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.RES.SEEK, {
      action: "seek",
      requestedBy: voteSession.requestedBy,
      votes: Array.from(voteSession.votes.values()),
      participantsLength: session?.participants.length,
      seconds: voteSession.time,
    })

    const totalMembers = session.participants.length
    const yesVotes = Array.from(voteSession.votes.values()).filter(v => v.confirm).length

    console.log('[SEEK] SEND SOCKET EVENT VOTE =>', {
      yesVotes,
      needToAccept: totalMembers / 2,
    })

    if (yesVotes > totalMembers / 2) {
      console.log('SEND SEEK EVENT APPROVED')

      const cached = partyCache.get(partyId);
      const payload = cached
        ? {
            currentTime: voteSession.time,
            currentRate: cached.currentRate,
            paused: cached.paused,
            runAt: cached.runAt,
          }
        : {
            currentTime: voteSession.time,
            currentRate: 1,
            paused: true,
            runAt: Date.now(),
          };

      socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.EVT.MANUAL_SEEK, payload);

      activeVotes.delete(partyId);
    }
  });
}
