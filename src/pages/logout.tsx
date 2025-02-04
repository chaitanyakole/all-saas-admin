import { useEffect } from "react";
import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { logout } from "@/utils/keycloak";
function Logout() {
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => {
    const userLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.log(error);
      }
    };
    userLogout();
    if (typeof window !== "undefined" && window.localStorage) {
      // Specify the keys you want to keep
      const keysToKeep = [
        "preferredLanguage",
        "mui-mode",
        "mui-color-scheme-dark",
        "mui-color-scheme-light",
        "hasSeenTutorial",
      ];
      // Retrieve the values of the keys to keep
      const valuesToKeep: { [key: string]: any } = {};
      keysToKeep.forEach((key: string) => {
        valuesToKeep[key] = localStorage.getItem(key);
      });

      // Clear all local storage
      localStorage.clear();

      // Re-add the keys to keep with their values
      keysToKeep.forEach((key: string) => {
        if (valuesToKeep[key] !== null) {
          // Check if the key exists and has a value
          localStorage.setItem(key, valuesToKeep[key]);
        }
      });
    }
  }, []);

  return <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />;
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Logout;
