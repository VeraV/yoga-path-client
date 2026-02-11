import api from "./axios";
import type { YogaProfileRequest, YogaProfileResponse } from "../types";

export const profileApi = {
  getByUserId: async (userId: number): Promise<YogaProfileResponse | null> => {
    const response = await api.get<YogaProfileResponse>(
      `/profiles/user/${userId}`,
    );
    return response.data;
  },

  create: async (data: YogaProfileRequest): Promise<YogaProfileResponse> => {
    const response = await api.post<YogaProfileResponse>("/profiles", data);
    return response.data;
  },

  update: async (
    id: number,
    data: YogaProfileRequest,
  ): Promise<YogaProfileResponse> => {
    const response = await api.put<YogaProfileResponse>(
      `/profiles/${id}`,
      data,
    );
    return response.data;
  },
};
