import React from "react";
import { Link } from "@mui/material";
import Image from "next/image";
import LogoDark from "../../../../public/logo-saas.png";
import { useRouter } from "next/router";

const LogoIcon = () => {
  const router = useRouter();
  return (
    <>
      <Image
        src={LogoDark}
        alt="LogoDark"
        style={{
          maxWidth: "280px",
          height: "auto",
          transition: "transform 0.2s ease",
          cursor: "pointer",
          objectFit: "contain",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onClick={() => {
          router.push("/tenant");
        }}
      />
    </>
  );
};

export default LogoIcon;
