import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
} from "../types";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/register", data);
    return response.data;
  },

  verify: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/auth/verify");
    return response.data;
  },
};
