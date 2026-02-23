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
  isOutdated: boolean;
  createdAt: string;
}
