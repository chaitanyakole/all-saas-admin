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
        if (typeof window !== "undefined" && window.localStorage) {
          const keysToKeep = [
            "preferredLanguage",
            "mui-mode",
            "mui-color-scheme-dark",
            "mui-color-scheme-light",
            "hasSeenTutorial",
          ];

          const valuesToKeep: { [key: string]: any } = {};
          keysToKeep.forEach((key) => {
            valuesToKeep[key] = localStorage.getItem(key);
          });

          localStorage.clear();

          keysToKeep.forEach((key) => {
            if (valuesToKeep[key] !== null) {
              localStorage.setItem(key, valuesToKeep[key]);
            }
          });
        }
        router.push("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    userLogout();
  }, [router]);

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
