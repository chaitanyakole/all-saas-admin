import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "next-i18next";

const ProtectedRoute = ({ children }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { loading } = useAuth();
  const authCheckAttempts = useRef(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const maxAttempts = 5;
  const checkInterval = 300;

  useEffect(() => {
    if (
      router.pathname === "/login" ||
      router.pathname === "/super-admin-login"
    ) {
      setIsAuthenticated(true);
      return;
    }

    if (isAuthenticated) {
      return;
    }
    if (loading) {
      return;
    }

    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      const isSuperAdmin =
        localStorage.getItem("superAdminLoggedIn") === "true";
      const userId = localStorage.getItem("userId");

      authCheckAttempts.current += 1;

      if (token || isSuperAdmin || userId) {
        setIsAuthenticated(true);
        return true;
      }

      if (authCheckAttempts.current >= maxAttempts) {
        router.push("/login");
        return true;
      }

      return false;
    };

    if (checkAuthentication()) {
      return;
    }

    const intervalId = setInterval(() => {
      if (checkAuthentication()) {
        clearInterval(intervalId);
      }
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [loading, router.pathname, router, isAuthenticated]);

  if (
    loading ||
    (!isAuthenticated &&
      router.pathname !== "/login" &&
      router.pathname !== "/super-admin-login")
  ) {
    return <p>{t("COMMON.LOADING")}</p>;
  }
  return children;
};

export default ProtectedRoute;
