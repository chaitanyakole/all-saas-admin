import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Tooltip, Divider } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TimelineIcon from "@mui/icons-material/Timeline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

interface ButtonState {
  visible: boolean | undefined;
  enabled: boolean | undefined;
}
interface ButtonStates {
  add: ButtonState;
  editDelete: ButtonState;
  reassign: ButtonState;
  reports: ButtonState;
  learnerReports: ButtonState;
}
interface MetabaseDashboardProps {
  onEdit: (rowData: any) => void;
  onDelete: (rowData: any) => void;
  rowData: any;
  buttonStates: ButtonStates;
}
// Interface for individual button state

const MetabaseReportsMenu: React.FC<MetabaseDashboardProps> = ({
  buttonStates,
  onEdit,
  onDelete,
  rowData,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const getUserRowData = (dashboardType: string) => {
    return rowData?.tenantId && !rowData?.userId
      ? { tenantId: rowData.tenantId, dashboardType }
      : rowData?.userId
        ? { userId: rowData.userId, dashboardType }
        : {};
  };
  const handleNavigation = (type: string) => {
    const userRowData: object = getUserRowData(type);
    router.push({
      pathname: "/dashboard",
      query: { ...userRowData, from: router.pathname },
    });
    handleClose();
  };

  const handleEdit = () => {
    if (buttonStates.editDelete.enabled) {
      onEdit(rowData);
      handleClose();
    }
  };

  const handleDelete = () => {
    if (buttonStates.editDelete.enabled) {
      onDelete(rowData);
      handleClose();
    }
  };

  const reportMenuItems = [
    {
      visible: buttonStates.reports.visible,
      type: "default",
      title: t("COMMON.METABASE_REPORTS"),
      icon: <AssessmentIcon />,
      onClick: () => handleNavigation("default"),
    },
    {
      visible: buttonStates.learnerReports.visible,
      type: "responseEvent",
      title: t("COMMON.USER_RESPONSE_EVENT"),
      icon: <QueryStatsIcon />,
      onClick: () => handleNavigation("responseEvent"),
    },
    {
      visible: buttonStates.learnerReports.visible,
      type: "userJourney",
      title: t("COMMON.USER_JOURNEY_REPORT"),
      icon: <TimelineIcon />,
      onClick: () => handleNavigation("userJourney"),
    },
  ];

  const actionMenuItems = [
    {
      visible:
        buttonStates.editDelete.visible && !buttonStates.learnerReports.visible,
      title: t("COMMON.EDIT"),
      icon: <EditOutlinedIcon />,
      onClick: handleEdit,
      disabled: !buttonStates.editDelete.enabled,
    },
    {
      visible: buttonStates.editDelete.visible,
      title: t("COMMON.DELETE"),
      icon: <DeleteOutlineIcon sx={{ color: "red" }} />,
      onClick: handleDelete,
      disabled: !buttonStates.editDelete.enabled,
    },
  ];

  // Check if any menu items are visible
  const hasVisibleItems = [...reportMenuItems, ...actionMenuItems].some(
    (item) => item.visible
  );

  if (!hasVisibleItems) return null;

  return (
    <>
      <Tooltip title={t("MASTER.ACTIONS")}>
        <IconButton
          onClick={handleClick}
          sx={{
            backgroundColor: "#EAF2FF",
            "&:hover": {
              backgroundColor: "#d5e3f7",
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "actions-button",
        }}
      >
        {reportMenuItems.map(
          (item, index) =>
            item.visible && (
              <MenuItem
                key={`report-${index}`}
                onClick={item.onClick}
                sx={{
                  gap: 1,
                  minWidth: 200,
                }}
              >
                {item.icon}
                {item.title}
              </MenuItem>
            )
        )}

        {/* Add divider if both report and action items are visible */}
        {reportMenuItems.some((item) => item.visible) &&
          actionMenuItems.some((item) => item.visible)}

        {actionMenuItems.map(
          (item, index) =>
            item.visible && (
              <MenuItem
                key={`action-${index}`}
                onClick={item.onClick}
                disabled={item.disabled}
                sx={{
                  gap: 1,
                  minWidth: 200,
                  opacity: item.disabled ? 0.5 : 1,
                  "& .MuiImage-root": {
                    width: 24,
                    height: 24,
                  },
                }}
              >
                {item.icon}
                {item.title}
              </MenuItem>
            )
        )}
      </Menu>
    </>
  );
};

export default MetabaseReportsMenu;
