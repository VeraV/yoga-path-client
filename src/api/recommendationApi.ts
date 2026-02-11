import api from "./axios";
import type { YogaRecommendationResponse } from "../types";

export const recommendationApi = {
  getByProfileId: async (
    profileId: number,
  ): Promise<YogaRecommendationResponse | null> => {
    const response = await api.get<YogaRecommendationResponse>(
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
