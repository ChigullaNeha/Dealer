export enum Role {
  DEALER = 'DEALER',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  PM = 'PM',
  RM = 'RM',
}

export interface Player {
  id: string;
  role: Role;
  name: string;
  scores: number[];
}

export interface SessionPlayer {
  name: string;
  role: Role;
}

export interface ChatMessage {
  sender: string;
  message: string;
  dateTime: string;
}

export interface PlayerResponse {
  player: Player;
  errorMsg: string | null;
}

export interface RequestType {
  id: string;
  targetProjectBoardId: string;
  projectPlanId: string;
  status: 'OPEN' | 'REVOKE' | 'RESOLVED';
  demand: {
    time: number;
    skill: string;
  };
  playerId: string;
}

export interface PlayerType {
  id: string;
  role: 'PM' | 'RM';
  name: string;
  scores: number[];
}

export interface ResourceCardType {
  id: string;
  homeBoardId: string;
  time: number;
  skill: 'HEART' | 'SPADE' | 'DIAMOND';
  name: string;
}

export interface ResourceBoardType {
  id: string;
  title: string;
  owner: PlayerType;
  resources: ResourceCardType[];
  skills: string[];
}

export interface ResourceCard {
  id: string;
  time: number;
  homeBoardId: string;
  skill: 'HEART' | 'DIAMOND' | 'SPADE';
  name: string;
}

export type demand = {
  time: number;
  skill: string;
};

export type projectType = {
  id: string;
  name: string;
  initialStartTime: number;
  initialFinishTime: number;
  demands: demand[];
  projectStartTime: number;
};

export type Owner = {
  id: string;
  name: string;
  role: string;
  scores: number[];
};

export type Card = {
  homeBoardId: string;
  id: string;
  name: string;
  skill: string;
  time: number;
};

export type ProjectPlan = {
  id: string;
  owner: Owner;
  project: projectType;
  projectStartTime: number;
  cards: ResourceCard[];
};

export type Request = {
  demand: demand;
  id: string;
  playerId: string;
  projectPlanId: string;
  status: string;
  targetProjectBoardId: string;
};

export interface WebSocketProps {
  isWebSocketConnected: boolean;
}
