import { Socket } from "socket.io"
import { SOCKET_EVENTS } from "../@types/constants"
import { partyCache } from "../utils/PartyStateCache"

export async function resync(socket: Socket) {
  socket.on(SOCKET_EVENTS.EVT.RESYNC, async (data) => {
    const { partyId } = data

    const currentData = partyCache.get(partyId)
    if (!currentData) {
      console.log(`[RESYNC] Party ${partyId} não tem dados para ressincronizar.`)
      return
    }

    const elapsed = (Date.now() - currentData.runAt) / 1000
    const syncedTime = currentData.paused
      ? currentData.currentTime
      : currentData.currentTime + elapsed

    socket.emit(SOCKET_EVENTS.EVT.RESYNC, {
      partyId,
      currentTime: syncedTime,
      currentRate: currentData.currentRate,
      paused: currentData.paused,
    })

    console.log(
      `[RESYNC] Party ${partyId} resincronizada para o usuário. ` +
      `currentTime=${syncedTime.toFixed(2)}, rate=${currentData.currentRate}, paused=${currentData.paused}`
    )
  })
}
