import { Box } from "@mui/material";
import React, { useEffect } from "react";
import Loader from "../components/Loader";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/tenant");
      }
    }
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
