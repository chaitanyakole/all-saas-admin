import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";

interface RowData {
  tenantId?: string;
  userId?: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [rowData, setRowData] = useState<RowData | undefined>();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (router.query) {
      setRowData(router.query as RowData);
    }
  }, [router.query]);

  const metabaseUrl = useMemo(() => {
    if (router.query.from === "/tenant") {
      return `${process.env.NEXT_PUBLIC_METABASE_URL_TENANTID}${rowData?.tenantId}`;
    } else if (router.query.from === "/learners") {
      return `${process.env.NEXT_PUBLIC_METABASE_URL_USERID}${rowData?.userId}`;
    }
    return "";
  }, [router.query.from, rowData]);

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
          onError={() => setIsError(true)}
          title="metabase-dashboard"
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
