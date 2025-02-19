// next.config.mjs
/** @type {import('next').NextConfig} */
import nextI18nextConfig from "./next-i18next.config.js";
const url = process.env.NEXT_PUBLIC_BASE_URL;
// const url = "http://localhost:3000";

const nextConfig = {
  eslint: {
    // Disabling on production builds because we're running checks on PRs via GitHub Actions.
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  reactStrictMode: false,
  i18n: nextI18nextConfig.i18n,
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "https://all-saas-keycloak.tekdinext.com/api/",
  //     },
  //   ];
  // },
};

export default nextConfig;
