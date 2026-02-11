import api from "./axios";
import type { PracticeLogRequest, PracticeLogResponse } from "../types";

export const practiceLogApi = {
  getByUserId: async (userId: number): Promise<PracticeLogResponse[]> => {
    const response = await api.get<PracticeLogResponse[]>(
      `/practice-logs/user/${userId}`,
    );
    return response.data;
  },

  getByDateRange: async (
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<PracticeLogResponse[]> => {
    const response = await api.get<PracticeLogResponse[]>(
      `/practice-logs/user/${userId}/range`,
      { params: { startDate, endDate } },
    );
    return response.data;
  },

  create: async (data: PracticeLogRequest): Promise<PracticeLogResponse> => {
    const response = await api.post<PracticeLogResponse>(
      "/practice-logs",
      data,
    );
    return response.data;
  },

  update: async (
    id: number,
    data: PracticeLogRequest,
  ): Promise<PracticeLogResponse> => {
    const response = await api.put<PracticeLogResponse>(
      `/practice-logs/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/practice-logs/${id}`);
  },
};
