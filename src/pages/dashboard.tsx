import HeaderComponent from "@/components/HeaderComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [isError, setIsError] = useState(false);

  // Validate userId
  useEffect(() => {
    if (!userId) {
      setIsError(true);
    }
  }, [userId]);

  const metabaseUrl = `${process.env.NEXT_PUBLIC_METABASE_URL}${userId}`;

  return (
    <div>
      {isError ? (
        <p style={{ fontWeight: "bold" }}>
          User ID is missing. Please go back and try again.
        </p>
      ) : (
        <iframe
          src={metabaseUrl}
          width="100%"
          height="600px"
          style={{ border: "none" }}
          onError={() => setIsError(true)} // Handle iframe load failure
        />
      )}

      {isError && (
        <p>
          Dashboard not available. Please check your access or try again later.
        </p>
      )}
    </div>
  );
};
export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Dashboard;
