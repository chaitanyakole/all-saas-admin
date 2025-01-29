import { Box } from "@mui/material";
import React, { useEffect } from "react";
import Loader from "../components/Loader";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { showToastMessage } from "@/components/Toastify";
import { getUserDetailsInfo } from "@/services/UserList";
import { Storage } from "@/utils/app.constant";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { Role } from "@/utils/app.constant";

const LoginPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const setAdminInformation = useSubmittedButtonStore(
    (state: any) => state.setAdminInformation
  );

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/tenant");
      }
    }
  }, []);

  const fetchUserDetail = async () => {
    let userId;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        userId = localStorage.getItem(Storage.USER_ID);
      }
      const fieldValue = true;
      if (userId) {
        const response = await getUserDetailsInfo(userId, fieldValue);

        const userInfo = response?.userData;
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("adminInfo", JSON.stringify(userInfo));
          localStorage.setItem("stateName", userInfo?.customFields[0]?.value);
        }

        if (userInfo.tenantData?.[0]?.roleName === Role.LOGIN_LEARNER) {
          const errorMessage = t("LOGIN_PAGE.ACCESS_DENIED");
          showToastMessage(errorMessage, "error");
          localStorage.removeItem("token");
        } else {
          setAdminInformation(userInfo);
          router.push("/tenant");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserDetail();
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
