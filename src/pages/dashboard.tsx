import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useRef } from "react";

interface RowData {
  tenantId?: string;
  userId?: string;
  dashboardType?: string;
}

const Dashboard = () => {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [rowData, setRowData] = useState<RowData | undefined>();
  const [isError, setIsError] = useState(false);
  const [iframeHeight, setIframeHeight] = useState("800px");

  useEffect(() => {
    if (router.query) {
      setRowData(router.query as RowData);
    }
  }, [router.query]);

  const metabaseUrl = useMemo(() => {
    if (router.query.from === "/tenant") {
      return `${process.env.NEXT_PUBLIC_METABASE_URL_TENANTID}${rowData?.tenantId}`;
    } else if (
      router.query.from === "/learners" &&
      rowData?.dashboardType === "default"
    ) {
      return `${process.env.NEXT_PUBLIC_METABASE_URL_USERID}${rowData?.userId}`;
    } else if (
      router.query.from === "/learners" &&
      rowData?.dashboardType === "responseEvent"
    ) {
      return `${process.env.NEXT_PUBLIC_METABASE_URL_USER_RESPONSE_EVENT}${rowData?.userId}`;
    } else if (
      router.query.from === "/learners" &&
      rowData?.dashboardType === "userJourney"
    ) {
      return `${process.env.NEXT_PUBLIC_METABASE_URL_USER_JOURNEY}${rowData?.userId}`;
    }

    return "";
  }, [router.query.from, rowData]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== process.env.NEXT_PUBLIC_METABASE_URL) return;
      const newHeight = event.data?.height;
      if (newHeight) {
        setIframeHeight(`${newHeight}px`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div>
      {isError ? (
        <p style={{ fontWeight: "bold" }}>
          User ID is missing. Please go back and try again.
        </p>
      ) : (
        <iframe
          ref={iframeRef}
          src={metabaseUrl}
          width="100%"
          height={iframeHeight}
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
