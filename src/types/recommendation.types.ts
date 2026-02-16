export interface YogaStyle {
  id: number;
  name: string;
  description: string;
  notes: string;
}

export interface YogaRecommendationResponse {
  id: number;
  profileId: number;
  asanaMinutes: number;
  pranayamaMinutes: number;
  meditationMinutes: number;
  relaxationMinutes: number;
  mantraMinutes: number;
  totalMinutesPerSession: number;
  styles: YogaStyle[];
  notes: string | null;
  isOutdated: boolean;
  createdAt: string;
}
