import { Session, type DiscordChannel } from "../@types";
import { collection, getDocs, query, where, type DocumentData, type DocumentReference } from 'firebase/firestore';
import { firestore } from '../services/firebase';

interface GetSessionProps {
  channel: DiscordChannel
  guildId: string
}

interface GetSessionResponse {
  session: Session | null
  ref: DocumentReference<DocumentData, DocumentData> | null
}

export async function getSession({ guildId, channel }: GetSessionProps): Promise<GetSessionResponse> {
  const channelId = channel.id
  const sessionsRef = collection(firestore, `guilds/${guildId}/sessions`)

  const q = query(
    sessionsRef,
    where("channelId", "==", channelId),
    where("status", "in", ["OPEN", "VOTING"])
  )
  
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return { session: null, ref: null }
  }

  const session = snapshot.docs[0]?.data() as Session
  const ref = snapshot.docs[0]?.ref

  return { session, ref }
}