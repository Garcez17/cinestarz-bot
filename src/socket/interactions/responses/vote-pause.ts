import type { Socket } from "socket.io";
import { activeVotes } from "..";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";

export async function votePause(socket: Socket) {
  socket.on(SOCKET_EVENTS.VOTE.PAUSE, async (data) => {
    const { partyId, user, confirm } = data;

    const party = await getActiveParty({ partyId });
    if (!party) return;

    const session = party.data();

    const voteSession = activeVotes.get(partyId);
    if (!voteSession || voteSession.action !== "pause") return;

    voteSession.votes.set(user.id, { ...user, confirm });

    socket.to(session.collectionName).emit(SOCKET_EVENTS.RES.PAUSE, {
      action: "pause",
      requestedBy: voteSession.requestedBy,
      votes: Array.from(voteSession.votes.values())
    });

    const totalMembers = session.members.length;
    const yesVotes = Array.from(voteSession.votes.values()).filter(v => v.confirm).length;

    if (yesVotes > totalMembers / 2) {
      socket.to(session.collectionName).emit(SOCKET_EVENTS.EVT.PAUSE)
      activeVotes.delete(partyId)
    }
  });
}