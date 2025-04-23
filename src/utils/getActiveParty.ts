import { collectionGroup, getDocs, query, where } from "firebase/firestore"
import { firestore } from "../services/firebase"

type GetActivePartyProps = {
  partyId: string
}

export async function getActiveParty(data: GetActivePartyProps) {
  const { partyId } = data

    const q = query(
      collectionGroup(firestore, 'sessions'),
      where('status', 'in', ['OPEN', 'VOTING'])
    )

    const snapshot = await getDocs(q)

    const matchingSession = snapshot.docs.find(doc => doc.id === partyId)

    return matchingSession
}