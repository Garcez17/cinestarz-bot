import type { DMChannel, NewsChannel, PartialDMChannel, PrivateThreadChannel, PublicThreadChannel, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { Timestamp } from "firebase/firestore";

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

export type DiscordChannel = 
  DMChannel 
  | PartialDMChannel 
  | NewsChannel 
  | StageChannel 
  | TextChannel 
  | PublicThreadChannel<boolean> 
  | PrivateThreadChannel 
  | VoiceChannel

export type SessionStatus = "OPEN" | "VOTING" | "CLOSED";

export interface Participant {
  id: string;
  username: string;
  avatar: string;
  nickname: string;
}

export interface Suggestion {
  userId: string
  content: string
  rawTitle: string
}

interface Content {
  title: string
  partyUrl: string
  provider: string
  contentId: string
  status: string
}

export interface Session {
  content: Content | null
  status: SessionStatus
  channelId: string
  collectionName: string
  createdBy: Participant
  participants: Participant[]
  startedAt: Timestamp
  suggestions: Suggestion[]
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