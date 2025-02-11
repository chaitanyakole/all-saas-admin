import React from "react";
import { useTranslation } from "next-i18next";
import { Box, Typography, Tooltip, useTheme, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import deleteIcon from "../../public/images/deleteIcon.svg";
import editIcon from "../../public/images/editIcon.svg";
import cohortIcon from "../../public/images/apartment.svg";
import addIcon from "../../public/images/addIcon.svg";

import Image from "next/image";
import { useRouter } from "next/router";

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
  const isActionAllowed = isCohortAdmin && !isLearnersPage;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
        pointerEvents: isActionAllowed ? "none" : "auto",
        opacity: isActionAllowed ? 0.5 : 1,
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
              if (!isActionAllowed) onAdd(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              color: disable ? theme?.palette?.secondary.contrastText : "",
              backgroundColor: "#EAF2FF",
              p: "10px",
            }}
          >
            <Image src={addIcon} alt="" />
            {/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
          </Box>
        </Tooltip>
      )}
      {allowEditIcon && (
        <>
          <Tooltip title={t("COMMON.EDIT")}>
            <Box
              onClick={() => {
                if (!isActionAllowed) onEdit(rowData);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isActionAllowed ? "not-allowed" : "pointer",
                backgroundColor: isActionAllowed ? "#d3d3d3" : "#E3EAF0",
                p: "10px",
              }}
            >
              <Image src={editIcon} alt="" />
            </Box>
          </Tooltip>

          <Tooltip title={t("COMMON.DELETE")}>
            <Box
              onClick={() => {
                if (!isActionAllowed) onDelete(rowData);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isActionAllowed ? "not-allowed" : "pointer",
                backgroundColor: isActionAllowed ? "#d3d3d3" : "#EAF2FF",
                p: "10px",
              }}
            >
              <Image src={deleteIcon} alt="" />
            </Box>
          </Tooltip>
        </>
      )}

      {userAction && (
        <Tooltip title={reassignType}>
          <Box
            onClick={() => {
              if (!isActionAllowed && reassignCohort) reassignCohort(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isActionAllowed ? "not-allowed" : "pointer",
              backgroundColor: isActionAllowed ? "#d3d3d3" : "#E5E5E5",
              p: "10px",
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
