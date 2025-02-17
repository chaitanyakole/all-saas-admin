import React from "react";
import { useTranslation } from "next-i18next";
import { Box, Typography, Tooltip, Button } from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import AssessmentIcon from "@mui/icons-material/Assessment";
import deleteIcon from "../../public/images/deleteIcon.svg";
import editIcon from "../../public/images/editIcon.svg";
import cohortIcon from "../../public/images/apartment.svg";
import addIcon from "../../public/images/addIcon.svg";
import TimelineIcon from "@mui/icons-material/Timeline";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
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
}) => {
  const { t } = useTranslation();
  const router = useRouter();

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
    if (!buttonStates.editDelete.visible) return null;

    return (
      <>
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

        <Tooltip title={t("COMMON.DELETE")}>
          <Box
            onClick={() => buttonStates.editDelete.enabled && onDelete(rowData)}
            sx={{
              ...commonButtonStyles(buttonStates.editDelete.enabled),
              backgroundColor: buttonStates.editDelete.enabled
                ? "#EAF2FF"
                : "#d3d3d3",
            }}
          >
            <Image src={deleteIcon} alt="" />
          </Box>
        </Tooltip>
      </>
    );
  };
  const renderReportsButton = () => {
    if (!buttonStates.reports.visible) return null;
    const userRowData =
      rowData?.tenantId && !rowData?.userId
        ? { tenantId: rowData.tenantId, dashboardType: "default" }
        : rowData?.userId
          ? { userId: rowData.userId, dashboardType: "default" }
          : {};

    return (
      <Tooltip title={t("COMMON.METABASE_REPORTS")}>
        <Box
          onClick={() =>
            router.push({
              pathname: "/dashboard",
              query: { ...userRowData, from: router.pathname },
            })
          }
          sx={{
            ...commonButtonStyles(true),
            backgroundColor: "#EAF2FF",
          }}
        >
          <AssessmentIcon />
        </Box>
      </Tooltip>
    );
  };
  const renderResponseEventReportsButton = () => {
    if (!buttonStates.learnerReports.visible) return null;
    const userRowData =
      rowData?.tenantId && !rowData?.userId
        ? { tenantId: rowData.tenantId, dashboardType: "responseEvent" }
        : rowData?.userId
          ? { userId: rowData.userId, dashboardType: "responseEvent" }
          : {};

    return (
      <Tooltip title={t("COMMON.USER_RESPONSE_EVENT")}>
        <Box
          onClick={() =>
            router.push({
              pathname: "/dashboard",
              query: { ...userRowData, from: router.pathname },
            })
          }
          sx={{
            ...commonButtonStyles(true),
            backgroundColor: "#EAF2FF",
          }}
        >
          <QueryStatsIcon />
        </Box>
      </Tooltip>
    );
  };
  const renderUserJourneyReportsButton = () => {
    if (!buttonStates.learnerReports.visible) return null;
    const userRowData =
      rowData?.tenantId && !rowData?.userId
        ? { tenantId: rowData.tenantId, dashboardType: "userJourney" }
        : rowData?.userId
          ? { userId: rowData.userId, dashboardType: "userJourney" }
          : {};

    return (
      <Tooltip title={t("COMMON.USER_JOURNEY_REPORT")}>
        <Box
          onClick={() =>
            router.push({
              pathname: "/dashboard",
              query: { ...userRowData, from: router.pathname },
            })
          }
          sx={{
            ...commonButtonStyles(true),
            backgroundColor: "#EAF2FF",
          }}
        >
          <TimelineIcon />
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
      {renderReportsButton()}
      {renderReassignButton()}
      {renderUserJourneyReportsButton()}
      {renderResponseEventReportsButton()}
    </Box>
  );
};

export default ActionIcon;
