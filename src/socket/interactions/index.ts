export const activeVotes = new Map<string, {
  action: 'pause' | 'play',
  requestedBy: { id: string, name: string, avatarUrl: string, socketId: string, globalName: string },
  votes: Map<string, { name: string, avatarUrl: string, confirm: boolean, socketId: string, globalName: string, id: string }>
}>();