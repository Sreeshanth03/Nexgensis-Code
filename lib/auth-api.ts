import api from "./axios";
import { saveAuth } from "./auth-storage";
import type { AuthUser } from "./types";

type LoginResponse = AuthUser & {
  token?: string;
};

export async function loginRequest(username: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
    expiresInMins: 60,
  });

  const accessToken = data.accessToken || data.token;
  if (!accessToken) {
    throw new Error("Login succeeded but no access token was returned.");
  }

  const user: AuthUser = {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    image: data.image,
    accessToken,
  };

  saveAuth(user);
  return user;
}
