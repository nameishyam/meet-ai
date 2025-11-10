export interface User {
  name: string;
  id: number;
  email: string;
}

export interface Meeting {
  id: number;
  title: string;
  level: number;
  role: string;
  startTime: string;
  endTime: string;
  instructions: string;
  summary: string;
  timestamps: Record<string, unknown>;
  userId: number;
}

export interface MeetingState {
  meetingId: string | null;
  initialQuestion: string | null;

  setMeetingDetails: (details: {
    meetingId: string;
    initialQuestion: string;
  }) => void;
  clearMeetingDetails: () => void;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

export interface MeetingCache {
  summary: string;
  timestamps: {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }[];
}
