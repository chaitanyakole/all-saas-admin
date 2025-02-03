import Keycloak from "keycloak-js";

let keycloakInstance: Keycloak | null = null;

if (typeof window !== "undefined") {
  keycloakInstance = new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "",
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "",
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
  });
}

export const initKeycloak = async (): Promise<boolean> => {
  if (!keycloakInstance) return false;
  
  try {
    const authenticated = await keycloakInstance.init({
      onLoad: "login-required",
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    });

    if (authenticated) {
      localStorage.setItem("token", keycloakInstance.token || "");
      localStorage.setItem("refreshToken", keycloakInstance.refreshToken || "");
    }

    return authenticated;
  } catch (error) {
    console.error("Keycloak initialization failed:", error);
    return false;
  }
};

export const logout = async () => {
  if (!keycloakInstance) return;
  try {
    await keycloakInstance.logout({
      redirectUri: window.location.origin + "/login",
    });
    localStorage.clear();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default keycloakInstance;