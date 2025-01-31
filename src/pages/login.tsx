import { useEffect } from "react";
import { useRouter } from "next/router";
import keycloak from "../utils/keycloak";
import Loader from "../components/Loader";
import { Box } from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const loginWithKeycloak = async () => {
      if (typeof window === "undefined" || !keycloak) return;
      try {
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/tenant");
          return;
        }

        // Initialize Keycloak and login
        const authenticated = await keycloak.init({
          onLoad: "login-required",
          redirectUri: `${window.location.origin}/tenant`,
        });

        if (authenticated) {
          localStorage.setItem("token", keycloak.token || "");
        }
      } catch (error) {
        console.error("Error logging in with Keycloak:", error);
      }
    };

    loginWithKeycloak();
  }, []);

  return (
    <Box sx={{ backgroundColor: "white", height: "100vh" }}>
      <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />
    </Box>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default LoginPage;
