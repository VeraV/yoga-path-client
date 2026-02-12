import api from "./axios";
import type { YogaRecommendationResponse } from "../types";

export const recommendationApi = {
  getLatest: async (
    profileId: number,
  ): Promise<YogaRecommendationResponse | null> => {
    const response = await api.get<YogaRecommendationResponse>(
      `/recommendations/profile/${profileId}/latest`,
    );
    return response.data;
  },

  getHistory: async (
    profileId: number,
  ): Promise<YogaRecommendationResponse[]> => {
    const response = await api.get<YogaRecommendationResponse[]>(
      `/recommendations/profile/${profileId}`,
    );
    return response.data;
  },

  generate: async (profileId: number): Promise<YogaRecommendationResponse> => {
    const response = await api.post<YogaRecommendationResponse>(
      `/recommendations/generate/${profileId}`,
    );
    return response.data;
  },
};
