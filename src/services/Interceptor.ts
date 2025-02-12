import axios from "axios";
import { refresh } from "./LoginService";
import keycloak from "../utils/keycloak";

const instance = axios.create();

const refreshToken = async () => {
  // const refresh_token = localStorage.getItem("refreshToken");
  // if (refresh_token !== "" && refresh_token !== null) {
  //   try {
  //     const response = await refresh({ refresh_token });
  //     if (response) {
  //       const accessToken = response?.result?.access_token;
  //       const newRefreshToken = response?.result?.refresh_token;
  //       localStorage.setItem("token", accessToken);
  //       localStorage.setItem("refreshToken", newRefreshToken);
  //       return accessToken;
  //     }
  //   } catch (error) {
  //     console.error("Token refresh failed:", error);
  //     throw error;
  //   }
  // }
  try {
    const refreshed = await keycloak?.updateToken(70);

    if (refreshed) {
      const newToken: string | undefined = keycloak?.token || undefined;
      if (newToken) {
        localStorage.setItem("token", newToken);
      }

      if (keycloak?.refreshToken) {
        localStorage.setItem("refreshToken", keycloak.refreshToken);
      }
      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

let cachedTenantId = null;
if (typeof window !== "undefined" && window.localStorage) {
  cachedTenantId = localStorage.getItem("tenantId");
}

instance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // config.headers.tenantid = '4783a636-1191-487a-8b09-55eca51b5036';
    // config.headers.tenantid = 'fbe108db-e236-48a7-8230-80d34c370800';
    // config.headers.tenantid = tenantId;
    config.headers.tenantid =
      cachedTenantId || localStorage.getItem("tenantId");

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.data?.responseCode === 401 &&
      !originalRequest._retry
    ) {
      if (error?.response?.request?.responseURL.includes("/auth/refresh")) {
        // alert("logout")
        window.location.href = "/logout";
      } else {
        originalRequest._retry = true;
        try {
          const accessToken = await refreshToken();
          if (!accessToken) {
            // alert("logout-2")
            window.location.href = "/logout";
          } else {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
