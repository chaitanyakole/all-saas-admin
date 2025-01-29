import Keycloak from "keycloak-js";


const keycloakInstance =
  typeof window !== "undefined"
    ? new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "",
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "",
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
      })
    : null;
export const logout = async () => {
  try {    
    if (keycloakInstance) {
      await keycloakInstance.logout({
        redirectUri: window.location.origin + "/login",
      });
      localStorage.clear();
    }

  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default keycloakInstance;