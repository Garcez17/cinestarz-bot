export const activeVotes = new Map<string, {
  action: 'pause' | 'play',
  requestedBy: { id: string, name: string, avatarUrl: string },
  votes: Map<string, { name: string, avatar: string, confirm: boolean }>
}>();