//Mogelijke moeilijkheidsgraden voor boulder
export type BoulderGrade =
  | '5A' | '5B' | '5C'
  | '6A' | '6B' | '6C'
  | '7A' | '7B';

// Kleuren van grepen
export type BoulderColor =
  | 'green'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'black'
  | 'white'
  | 'orange';

//Rollen in de app
export type UserRole = 'user' | 'setter' | 'admin';

//Status van een ascent/log
export type AscentStatus  = 'project' | 'sent' | 'flash'

//Basis info over een boulder in de zaal
export interface Boulder {
  id: string;
  name?: string;
  color : BoulderColor;
  grade : BoulderGrade;
  sector : string;

  setDate : string; //ISO string, bv. '2025-11-19'
  setter? : string;
  isActive : boolean;

  imageUrl? : string;
  videoUrl? : string;

  posX : number; //voor als we de topview hebben, dat we kunnen bepalen waar deze boulder hoort te staan
  posY : number;

  likeCount : number;
  commentCount : number;

  createdAt : string;
  updatedAt: string;
}

//User profiel
export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role : UserRole;

  avatarUrl?: string;
  bio?: string;

  followersCount: number;
  followingCount: number;
  postCount: number;

  createdAt : string;
  updatedAt: string;
}

//Log per user per boulder
export interface BoulderLog {
  id: string;
  userId: string;
  boulderId: string;

  status : AscentStatus;
  attempts: number;

  note?: string;
  customName?: string;
  videoUrl?: string;

  createdAt: string;
  updatedAt: string;
}