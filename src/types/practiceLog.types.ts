export interface PracticeLogRequest {
  userId: number;
  practiceDate: string;
  minutesPracticed: number;
  notes?: string;
}

export interface PracticeLogResponse {
  id: number;
  userId: number;
  practiceDate: string;
  minutesPracticed: number;
  notes: string | null;
  createdAt: string;
}
