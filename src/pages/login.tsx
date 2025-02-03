import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import keycloak, { initKeycloak } from "../utils/keycloak";
import Loader from "../components/Loader";
import { Box } from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { registerUser } from "@/services/LoginService";

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loginWithKeycloak = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/tenant");
          return;
        }

        const authenticated = await initKeycloak();
        if (authenticated) {
          await registerUser();
          router.push("/tenant");
        } else {
          console.error("User is not authenticated");
        }
      } catch (error) {
        console.error("Error logging in with Keycloak:", error);
      } finally {
        setLoading(false);
      }
    };

    loginWithKeycloak();
  }, []);

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "white", height: "100vh" }}>
        <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />
      </Box>
    );
  }

  return null;
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
