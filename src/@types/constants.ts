export const SOCKET_EVENTS = {
  REQ: {
    PAUSE: 'request-pause',
    PLAY: 'request-play',
  },
  RES: {
    PAUSE: 'pause-requested',
    PLAY: 'play-requested',
  },
  VOTE: {
    PAUSE: 'vote-pause',
    PLAY: 'vote-play',
  },
  EVT: {
    PAUSE: 'pause',
    PLAY: 'play',
    MANUAL_SEEK: 'manual-seek',
    RATE_CHANGE: 'rate-change',
    HOST_CURRENT_TIME: 'host-current-time',
    GET_PARTY: 'get-party', 
    JOIN_PARTY: 'join-party',
    CREATE_PARTY: 'create-party',
    NEW_USER: 'new-user',
    CURRENT_RATE: 'current-rate'
  },
}