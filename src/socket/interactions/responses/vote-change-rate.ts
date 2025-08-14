import type { Socket } from "socket.io";
import { activeVotes } from "..";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";

export async function voteChangeRate(socket: Socket) {
  socket.on(SOCKET_EVENTS.VOTE.CHANGE_RATE, async (data) => {
    const { partyId, user, confirm } = data;

    console.log('vote for changerate =>', { user, socket: socket.id })

    const party = await getActiveParty({ partyId });
    if (!party) return;

    const session = party.data();

    const voteSession = activeVotes.get(partyId);
    if (!voteSession || voteSession.action !== "speed") {
      console.log('[CHANGERATE] VOTING NOT FOUND')
      return
    }

    voteSession.votes.set(socket.id, { // SOCKET JUST FOR TESTS
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
      confirm: true
     })

    socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.RES.CHANGE_RATE, {
      action: "changerate",
      requestedBy: voteSession.requestedBy,
      votes: Array.from(voteSession.votes.values()),
      participantsLength: session?.participants.length + 1,
    })

    const totalMembers = session.participants.length
    const yesVotes = Array.from(voteSession.votes.values()).filter(v => v.confirm).length

    console.log('SEND SOCKET EVENT VOTE =>', {
      yesVotes,
      needToAccept: totalMembers / 2
    })

    if (yesVotes > totalMembers / 2) {
      console.log('SEND CHANGE_RATE EVENT')
      socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.EVT.RATE_CHANGE, { currentTime: voteSession.speed })
      activeVotes.delete(partyId)
    }
  })
}