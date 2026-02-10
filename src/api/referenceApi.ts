import api from './axios';
import { Goal, YogaStyle, Limitation } from '../types';

export const referenceApi = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },

  getYogaStyles: async (): Promise<YogaStyle[]> => {
    const response = await api.get<YogaStyle[]>('/yoga-styles');
    return response.data;
  },

  getLimitations: async (): Promise<Limitation[]> => {
    const response = await api.get<Limitation[]>('/limitations');
    return response.data;
  },
};
