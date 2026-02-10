export type DynamicPreference = 'DYNAMIC' | 'STATIC' | 'NO_PREFERENCE';
export type StructurePreference = 'STRUCTURED' | 'CREATIVE' | 'NO_PREFERENCE';
export type PhilosophyOpenness = 'OPEN' | 'NOT_OPEN' | 'NO_PREFERENCE';

export interface Goal {
  id: number;
  name: string;
  description: string;
  notes: string;
}

export interface YogaProfileRequest {
  userId: number;
  weeklyMinutesAvailable: number;
  sessionsPerWeek: number;
  dynamicPreference: DynamicPreference;
  structurePreference: StructurePreference;
  philosophyOpenness: PhilosophyOpenness;
  goalIds: number[];
}

export interface YogaProfileResponse {
  id: number;
  userId: number;
  weeklyMinutesAvailable: number;
  sessionsPerWeek: number;
  dynamicPreference: DynamicPreference;
  structurePreference: StructurePreference;
  philosophyOpenness: PhilosophyOpenness;
  goals: Goal[];
  createdAt: string;
  updatedAt: string;
}
