import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { initGA } from "../utils/googleAnalytics";
import { useEffect, useRef, useState } from "react";
import { AuthProvider } from "../context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { telemetryFactory } from "../utils/telemetry";
import FullLayout from "@/components/layouts/FullLayout";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import customTheme from "../styles/customTheme";
import "./../styles/style.css";
import keycloak from "../utils/keycloak";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "react-circular-progressbar/dist/styles.css";
import { getUserId, registerUser } from "@/services/LoginService";
import { getUserDetailsInfo } from "@/services/UserList";
import { useRouter } from "next/router";

function App({ Component, pageProps }: AppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authInitialized = useRef(false);
  const userDetailsFetched = useRef(false);
  const router = useRouter();
  useEffect(() => {
    telemetryFactory.init();
    // Analytics initialization would go here too if needed
    // if (!window.GA_INITIALIZED) {
    //   initGA(`G-6NVMB20J4Z`);
    //   window.GA_INITIALIZED = true;
    // }
  }, []);

  useEffect(() => {
    if (authInitialized.current) return;

    const handleAuth = async () => {
      authInitialized.current = true;
      if (router.pathname === "/super-admin-login") {
        localStorage.setItem("superAdminLoggedIn", "true");
        return;
      }
      const superAdminLoggedIn =
        localStorage.getItem("superAdminLoggedIn") === "true";
      if (superAdminLoggedIn) {
        setIsAuthenticated(false);
        return;
      }

      if (!keycloak) {
        console.log("Keycloak instance not available");
        return;
      }

      if (keycloak.authenticated) {
        setIsAuthenticated(true);
        return;
      }
      try {
        const redirectUri = `${window.location.origin}/tenant`;
        const authenticated = await keycloak.init({
          onLoad: "login-required",
          redirectUri,
        });

        if (!authenticated) return;
        setIsAuthenticated(true);

        if (keycloak.token) {
          localStorage.setItem("token", keycloak.token);
          await registerUser();
        }
        if (keycloak.refreshToken) {
          localStorage.setItem("refreshToken", keycloak.refreshToken);
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
      }
    };

    handleAuth();
  }, [router.isReady]);

  useEffect(() => {
    if (!isAuthenticated || userDetailsFetched.current) return;

    const fetchUserDetails = async () => {
      try {
        userDetailsFetched.current = true;
        const userResponse = await getUserId();
        if (!userResponse) return;
        localStorage.setItem("userId", userResponse.userId || "");
        localStorage.setItem("name", userResponse.name || "");

        const tenantId = userResponse.tenantData?.[0]?.tenantId || "";
        localStorage.setItem("tenantId", tenantId);

        if (userResponse?.userId) {
          const response = await getUserDetailsInfo(userResponse.userId, true);
          localStorage.setItem("adminInfo", JSON.stringify(response?.userData));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated]);

  const renderComponent = () => {
    if (pageProps.noLayout) {
      return <Component {...pageProps} />;
    } else {
      return (
        <FullLayout>
          <Component {...pageProps} />
        </FullLayout>
      );
    }
  };

  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60 * 24,
          staleTime: 1000 * 60 * 60 * 24,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <CssVarsProvider theme={customTheme}>
          {renderComponent()}
          <ToastContainer
            position="bottom-left"
            autoClose={3000}
            stacked={false}
          />
        </CssVarsProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default appWithTranslation(App);
