import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserTable from "@/components/UserTable";
import { useTranslation } from "next-i18next";
import { Role } from "@/utils/app.constant";

const Learners: React.FC = () => {
  const { t } = useTranslation();
  const [openAddLearnerModal, setOpenAddLearnerModal] = React.useState(false);

  const handleOpenAddLearnerModal = () => {
    setOpenAddLearnerModal(true);
  };
  const handleAddLearnerClick = () => {
    handleOpenAddLearnerModal();
  };
  return (
    <>
      <UserTable
        role={Role.STUDENT}
        userType={t("SIDEBAR.LEARNERS")}
        searchPlaceholder={t("LEARNERS.SEARCHBAR_PLACEHOLDER")}
        handleAddUserClick={handleAddLearnerClick}
      />
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Learners;
