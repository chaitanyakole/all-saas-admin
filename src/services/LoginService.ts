import axios from "axios";
import { get, post } from "./RestClient";
import config from "@/utils/urlConstants.json";
interface LoginParams {
  username: string;
  password: string;
}

interface RefreshParams {
  refresh_token: string;
}

export const login = async ({
  username,
  password,
}: LoginParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.AUTH_LOGIN}`;

  try {
    const response = await post(apiUrl, { username, password });
    return response?.data;
  } catch (error) {
    console.error("error in login", error);
    throw error;
  }
};

export const refresh = async ({
  refresh_token,
}: RefreshParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.AUTH_REFRESH}`;
  try {
    const response = await post(apiUrl, { refresh_token });
    return response?.data;
  } catch (error) {
    console.error("error in login", error);
    throw error;
  }
};

export const logout = async (refreshToken: string): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.AUTH_LOGOUT}`;
  try {
    const response = await post(apiUrl, { refresh_token: refreshToken });
    return response;
  } catch (error) {
    console.error("error in logout", error);
    throw error;
  }
};
export const registerUser = async (): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.USER_REGISTER}`;
  try {
    const response = await post(apiUrl, {});
    return response;
  } catch (error) {
    console.error("error in register user", error);
    throw error;
  }
};

export const getUserId = async (): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.AUTH}`;
  try {
    const response = await get(apiUrl);
    return response?.data?.result;
  } catch (error) {
    console.error("error in fetching user details", error);
    throw error;
  }
};

export const resetPassword = async (
  UserData: any,
  tenantId: any
): Promise<any> => {
  let apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.LEARNER_FORGOT_PASSWORD}`;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(apiUrl, UserData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        tenantId: tenantId,
      },
    });
    return response?.data;
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred.";

    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.params?.errmsg || "Error from API.";
    }

    console.error("Error in creating cohort:", error);
    throw new Error(errorMessage);
  }
};
