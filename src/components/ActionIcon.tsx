import React from "react";
import { useTranslation } from "next-i18next";
import { Box, Typography, Tooltip, useTheme, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import deleteIcon from "../../public/images/deleteIcon.svg";
import editIcon from "../../public/images/editIcon.svg";
import cohortIcon from "../../public/images/apartment.svg";
import addIcon from "../../public/images/addIcon.svg";
import Dashboard from "@/pages/dashboard";
import Image from "next/image";
import { useRouter } from "next/router";
import AssessmentIcon from "@mui/icons-material/Assessment"; // MUI report icon
import ApartmentIcon from "@mui/icons-material/Apartment"; // MUI cohort icon
import AddIcon from "@mui/icons-material/Add";
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
  disable = false,
  allowEditIcon = false,
  reassignType,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();

  const isCohortAdmin = rowData?.userRoleTenantMapping?.code === "cohort_admin";
  const isLearnersPage = router.pathname === "/learners";
  const isCohortPage = router.pathname === "/cohorts";

  const showEditDeleteButtons = true;
  const isActionAllowed = isCohortAdmin && !isLearnersPage;
  const isAddEnabled = isCohortAdmin && isCohortPage;
  const isEditDeleteEnabled = isLearnersPage || !isCohortAdmin;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {roleButton && (
        <Tooltip title={t("COMMON.ADD")}>
          <Button
            onClick={() => {
              if (!isActionAllowed) onAdd(rowData);
            }}
            disabled={isActionAllowed}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isActionAllowed ? "not-allowed" : "pointer",
              backgroundColor: isActionAllowed ? "#d3d3d3" : "#EAF2FF",
              p: "10px",
            }}
          >
            <Typography variant="body2" fontFamily={"Poppins"}>
              {t("COMMON.ADD")}
            </Typography>
          </Button>
        </Tooltip>
      )}

      {addAction && (
        <Tooltip title={t("COMMON.ADD")}>
          <Box
            onClick={() => {
              if (isAddEnabled) onAdd(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isAddEnabled ? "pointer" : "not-allowed",
              color: isAddEnabled ? "" : theme?.palette?.secondary.contrastText,
              backgroundColor: isAddEnabled ? "#EAF2FF" : "#d3d3d3",
              p: "10px",
              opacity: isAddEnabled ? 1 : 0.5,
            }}
          >
            <Image src={addIcon} alt="" />
          </Box>
        </Tooltip>
      )}

      {(showEditDeleteButtons || allowEditIcon) && (
        <>
          <Tooltip title={t("COMMON.EDIT")}>
            <Box
              onClick={() => {
                if (isEditDeleteEnabled) onEdit(rowData);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isEditDeleteEnabled ? "pointer" : "not-allowed",
                backgroundColor: isEditDeleteEnabled ? "#E3EAF0" : "#d3d3d3",
                p: "10px",
                opacity: isEditDeleteEnabled ? 1 : 0.5,
              }}
            >
              <Image src={editIcon} alt="" />
            </Box>
          </Tooltip>

          <Tooltip title={t("COMMON.DELETE")}>
            <Box
              onClick={() => {
                if (isEditDeleteEnabled) onDelete(rowData);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isEditDeleteEnabled ? "pointer" : "not-allowed",
                backgroundColor: isEditDeleteEnabled ? "#EAF2FF" : "#d3d3d3",
                p: "10px",
                opacity: isEditDeleteEnabled ? 1 : 0.5,
              }}
            >
              <Image src={deleteIcon} alt="" />
            </Box>
          </Tooltip>
          <Tooltip title={t("COMMON.METABASE_REPORTS")}>
            <Box
              onClick={() => {
                router.push({
                  pathname: "/dashboard",
                  query: rowData,
                });
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "#EAF2FF",
                p: "10px",
                opacity: 1,
              }}
            >
              <AssessmentIcon />
            </Box>
          </Tooltip>
        </>
      )}

      {userAction && (
        <Tooltip title={reassignType}>
          <Box
            onClick={() => {
              if (isEditDeleteEnabled && reassignCohort)
                reassignCohort(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isEditDeleteEnabled ? "pointer" : "not-allowed",
              backgroundColor: isEditDeleteEnabled ? "#E5E5E5" : "#d3d3d3",
              p: "10px",
              opacity: isEditDeleteEnabled ? 1 : 0.5,
            }}
          >
            <Image src={cohortIcon} alt="" />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionIcon;
