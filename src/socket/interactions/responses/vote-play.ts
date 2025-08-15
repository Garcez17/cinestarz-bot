import type { Socket } from "socket.io";
import { activeVotes } from "..";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";

export async function votePlay(socket: Socket) {
  socket.on(SOCKET_EVENTS.VOTE.PLAY, async (data) => {
    const { partyId, user, confirm } = data;

    console.log('vote for play =>', { user, socket: socket.id })

    const party = await getActiveParty({ partyId })
    if (!party) return;

    const session = party.data()

    const voteSession = activeVotes.get(partyId)
    if (!voteSession || voteSession.action !== "play") {
      console.log('[PLAY] VOTING NOT FOUND')
      return
    }

    voteSession.votes.set(user.id, {
      name: user?.username,
      avatarUrl: user.avatar,
      socketId: socket.id,
      globalName: user?.globalName,
      id: user.id,
      confirm: true
     });

    socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.RES.PLAY, {
      action: "play",
      requestedBy: voteSession.requestedBy,
      votes: Array.from(voteSession.votes.values()),
      participantsLength: session?.participants.length,
    });

    const totalMembers = session.participants.length
    const yesVotes = Array.from(voteSession.votes.values()).filter(v => v.confirm).length

    console.log('[PLAY] SEND SOCKET EVENT VOTE =>', {
      yesVotes,
      needToAccept: totalMembers / 2
    })

    if (yesVotes > totalMembers / 2) {
      console.log('SEND PLAY EVENT')
      socket.nsp.to(session.collectionName).emit(SOCKET_EVENTS.EVT.PLAY)
      activeVotes.delete(partyId)
    }
  });
}