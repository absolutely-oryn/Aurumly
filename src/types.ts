export type Grade = 'Grade 8' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  grade: Grade;
  totalPoints: number;
  completedQuizzes: string[];
  streak: number;
  lastActive: any;
  badges: string[];
  role?: 'admin' | 'user';
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  grade: Grade;
  members: string[];
  createdBy: string;
  createdAt: any;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  grade: Grade;
  questions: Question[];
  createdBy: string;
  createdAt: any;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  grade: Grade;
}
