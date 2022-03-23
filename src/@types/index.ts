export type Indication = {
  username: string;
  indicate: string;
}

export type Note = {
  id: string;
  username: string;
  note: number;
}

type SessionData = {
  server_id: string;
  started_at: string;
  session_number: number;
  room: string[],
  indications: Indication[],
  raffle_film: {
    title: string,
    indicated_by: string,
    notes: Note[],
    year: string,
    started_at: string;
    runtime: string,
    session: string,
    average: string,
  }
}

export type Session = {
  ref: {
    id: string;
  };
  data: SessionData;
}

export type FindOneSession = {
  type: 'Session' | 'Error';
  session: {
    ref: {
      id: string;
    };
    data: SessionData;
  }
}

export type FindOneUser = {
  type: 'User' | 'Error';
  user: User;
}

export type User = {
  ref: {
    id: string;
  };
  data: {
    id: string;
    name: string;
    raffle_streak: number;
    penalty: number;
    sessions_without_raffle: number;
  }
}