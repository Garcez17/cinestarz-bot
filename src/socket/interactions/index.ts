type BaseVote = {
  requestedBy: {
    id: string;
    name: string;
    avatarUrl: string;
    socketId: string;
    globalName: string;
  };
  votes: Map<
    string,
    {
      name: string;
      avatarUrl: string;
      confirm: boolean;
      socketId: string;
      globalName: string;
      id: string;
    }
  >;
};

type PausePlayVote = BaseVote & {
  action: 'pause' | 'play';
};

type SeekVote = BaseVote & {
  action: 'seek';
  time: number; // segundos do vídeo
};

type SpeedVote = BaseVote & {
  action: 'speed';
  speed: 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
};

export type VoteAction = PausePlayVote | SeekVote | SpeedVote;

export const activeVotes = new Map<string, VoteAction>();
