import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { Box, Typography, Tooltip, Button } from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import editIcon from "../../public/images/editIcon.svg";
import cohortIcon from "../../public/images/apartment.svg";
import addIcon from "../../public/images/addIcon.svg";
import MetabaseReportsMenu from "./MetabaseReportMenu";
import { ResetPasswordModal } from "./ResetPassword";

interface ActionCellProps {
  onEdit: (rowData: any) => void;
  onDelete: (rowData: any) => void;
  reassignCohort?: (rowData: any) => void;
  reassignType?: string;
  rowData: any;
  disable: boolean;
  addAction?: boolean;
  userAction?: boolean;
  roleButton?: boolean;
  allowEditIcon?: boolean;
  onAdd: (rowData: any) => void;
  showReports?: boolean;
  showLearnerReports?: boolean;
  showResetPassword?: boolean;
}

const ActionIcon: React.FC<ActionCellProps> = ({
  rowData,
  onEdit,
  onDelete,
  onAdd,
  reassignCohort,
  roleButton = false,
  addAction = false,
  userAction = false,
  allowEditIcon = false,
  reassignType,
  showReports,
  showLearnerReports = false,
  showResetPassword = false,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const isCohortAdmin = rowData?.userRoleTenantMapping?.code === "cohort_admin";
  const currentPage = router.pathname;

  const buttonStates = {
    add: {
      visible: roleButton || addAction,
      enabled: !isCohortAdmin || currentPage === "/cohorts",
    },
    editDelete: {
      visible: !roleButton || allowEditIcon,
      enabled: !isCohortAdmin || currentPage === "/learners",
    },
    reassign: {
      visible: userAction,
      enabled: !isCohortAdmin || currentPage === "/learners",
    },
    reports: {
      visible: showReports,
      enabled: true,
    },
    learnerReports: {
      visible: showLearnerReports,
      enabled: true,
    },
    resetPassword: {
      visible: showResetPassword,
      enabled: true,
    },
  };

  const handleResetPassword = (userData: any) => {
    setSelectedUser(userData);
    setIsResetModalOpen(true);
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setSelectedUser(null);
  };

  const commonButtonStyles = (enabled: boolean) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: enabled ? "pointer" : "not-allowed",
    p: "10px",
    opacity: enabled ? 1 : 0.5,
  });

  const renderAddButton = () => {
    if (!buttonStates.add.visible) return null;

    if (roleButton) {
      return (
        <Tooltip title={t("COMMON.ADD")}>
          <Button
            onClick={() => buttonStates.add.enabled && onAdd(rowData)}
            disabled={!buttonStates.add.enabled}
            sx={{
              ...commonButtonStyles(buttonStates.add.enabled),
              backgroundColor: buttonStates.add.enabled ? "#EAF2FF" : "#d3d3d3",
            }}
          >
            <Typography variant="body2" fontFamily="Poppins">
              {t("COMMON.ADD")}
            </Typography>
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip title={t("COMMON.ADD")}>
        <Box
          onClick={() => buttonStates.add.enabled && onAdd(rowData)}
          sx={{
            ...commonButtonStyles(buttonStates.add.enabled),
            backgroundColor: buttonStates.add.enabled ? "#EAF2FF" : "#d3d3d3",
          }}
        >
          <Image src={addIcon} alt="" />
        </Box>
      </Tooltip>
    );
  };

  const renderEditDeleteButtons = () => {
    if (!buttonStates.learnerReports.visible) return null;

    return (
      <Tooltip title={t("COMMON.EDIT")}>
        <Box
          onClick={() => buttonStates.editDelete.enabled && onEdit(rowData)}
          sx={{
            ...commonButtonStyles(buttonStates.editDelete.enabled),
            backgroundColor: buttonStates.editDelete.enabled
              ? "#E3EAF0"
              : "#d3d3d3",
          }}
        >
          <Image src={editIcon} alt="" />
        </Box>
      </Tooltip>
    );
  };

  const renderReassignButton = () => {
    if (!buttonStates.reassign.visible) return null;

    return (
      <Tooltip title={reassignType}>
        <Box
          onClick={() =>
            buttonStates.reassign.enabled && reassignCohort?.(rowData)
          }
          sx={{
            ...commonButtonStyles(buttonStates.reassign.enabled),
            backgroundColor: buttonStates.reassign.enabled
              ? "#E5E5E5"
              : "#d3d3d3",
          }}
        >
          <Image src={cohortIcon} alt="" />
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {renderAddButton()}
      {renderEditDeleteButtons()}
      {renderReassignButton()}

      <MetabaseReportsMenu
        buttonStates={buttonStates}
        onEdit={onEdit}
        onDelete={onDelete}
        onResetPassword={handleResetPassword}
        rowData={rowData}
      />

      <ResetPasswordModal
        open={isResetModalOpen}
        onClose={handleCloseResetModal}
        userData={selectedUser}
      />
    </Box>
  );
};

export default ActionIcon;
