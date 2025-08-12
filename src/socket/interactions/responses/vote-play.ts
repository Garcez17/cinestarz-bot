import type { Socket } from "socket.io";
import { activeVotes } from "..";
import { SOCKET_EVENTS } from "../../../@types/constants";
import { getActiveParty } from "../../../utils/getActiveParty";

export async function votePlay(socket: Socket) {
  socket.on(SOCKET_EVENTS.VOTE.PLAY, async (data) => {
    const { partyId, user, confirm } = data;

    const party = await getActiveParty({ partyId });
    if (!party) return;

    const session = party.data();

    const voteSession = activeVotes.get(partyId);
    if (!voteSession || voteSession.action !== "play") return;

    voteSession.votes.set(user.id, { ...user, confirm });

    socket.to(session.collectionName).emit(SOCKET_EVENTS.RES.PLAY, {
      action: "play",
      requestedBy: voteSession.requestedBy,
      votes: Array.from(voteSession.votes.values())
    });

    const totalMembers = session.members.length;
    const yesVotes = Array.from(voteSession.votes.values()).filter(v => v.confirm).length;

    if (yesVotes > totalMembers / 2) {
      socket.to(session.collectionName).emit(SOCKET_EVENTS.EVT.PLAY)
      activeVotes.delete(partyId)
    }
  });
}