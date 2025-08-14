import type { Socket } from "socket.io"
import { getActiveParty } from "../utils/getActiveParty"
import { addMilliseconds, differenceInMilliseconds } from "date-fns"
import { SOCKET_EVENTS } from "../@types/constants"

export async function userManualSeek(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.MANUAL_SEEK, async (data) => {
    const { partyId, currentTime, runAt } = data

    const party = await getActiveParty({
      partyId,
    })

    if (!party) return

    const session = party.data()

    // const currentDate = new Date()
    // const dateRunAt = new Date(runAt)

    // const diff = currentDate.getTime() - dateRunAt.getTime()

    // const actualCurrentTime = currentTime + diff / 1000

    // console.log({
    //   currentDateTime: currentDate.getTime(),
    //   runAtTime: dateRunAt.getTime(),
    //   currentDate: currentDate,
    //   runAt: dateRunAt,
    //   rawRunAt: runAt,
    // })

    // console.log('user_manual_seek ==>', {
    //   currentTime,
    //   diffInMiliseconds: diff,
    //   actualCurrentTime,
    // })

    console.log('manual_seek ==>', data)

    socket.broadcast.to(session.collectionName)
      .emit(SOCKET_EVENTS.EVT.MANUAL_SEEK, { currentTime })
  })
}