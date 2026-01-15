import apiClient from "./client";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/token/", credentials);
    return response.data;
  },

  refreshToken: async (refresh: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/token/refresh/", {
      refresh,
    });
    return response.data;
  },
};
