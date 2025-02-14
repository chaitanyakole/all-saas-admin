import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Menu,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Divider,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { Check, Close, Delete } from "@mui/icons-material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import {
  fetchInvitationsRequest,
  updateInvitation,
} from "@/services/InvitationService";
import { showToastMessage } from "@/components/Toastify";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

// Mock API response (can be replaced with actual API call)
interface Invitation {
  invitationId?: string;
  tenantId?: string;
  cohortId?: string;
  cohortName?: string;
  invitedTo?: string;
  invitedBy?: string;
  invitationStatus?: string;
  sentAt?: string;
  updatedAt?: string;
}

const InvitationMenu = () => {
  // State variables
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Invitation | null>(null);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>(
    []
  );
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  // Notification states
  const [notifications, setNotifications] = useState<Invitation[]>([]);
  const [currentNotification, setCurrentNotification] =
    useState<Invitation | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  // Menu open state
  const open = Boolean(anchorEl);
  const router = useRouter();

  const fetchInitialInvitations = async () => {
    try {
      const response = await fetchInvitationsRequest();

      const received = response.receivedInvitations.filter(
        (inv: Invitation) => inv.invitationStatus === "Pending"
      );

      const sent = response.sentInvitations.filter(
        (inv: Invitation) => inv.invitationStatus === "Pending"
      );
      setSentInvitations(sent);
      setReceivedInvitations(received);
      setNotificationCount(received.length);

      // Transform into notifications
      const newNotifications = received.map((invitation: Invitation) => ({
        id: invitation.invitationId,
        cohortName: invitation.cohortName,
        invitedBy: invitation.invitedBy,
      }));

      setNotifications(newNotifications);
    } catch (err) {
      setError("Failed to fetch invitations");
    }
  };
  // Fetch initial invitations on component mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInitialInvitations();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Notification cycling logic
  useEffect(() => {
    if (notifications.length === 0) return;

    // If no current notification, show the first one
    if (!currentNotification) {
      setCurrentNotification(notifications[0]);
    }

    // Set a timer to cycle through notifications
    const timer = setTimeout(() => {
      // Remove current notification
      setNotifications((prev) => prev.slice(1));
      // Clear current notification
      setCurrentNotification(null);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [notifications, currentNotification]);

  // Handle menu open
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    // Clear current notification when menu opens
    setCurrentNotification(null);
    setNotifications([]);
    setTabValue(1); // Open Received tab
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
    setError("");
    setSuccess("");
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setCurrentNotification(null);
    setNotifications((prev) => prev.slice(1));
  };

  // Handle take action - open menu
  const handleTakeAction = () => {
    const notificationTrigger = document.getElementById("notification-trigger");
    if (notificationTrigger) {
      handleClick({ currentTarget: notificationTrigger });
    }
  };
  ///revoke invitation
  const deleteInvitation = async (invitationId: string | undefined) => {
    setLoading(true);
    try {
      setSentInvitations((prev) =>
        prev.filter((invite) => invite.invitationId !== invitationId)
      );
      showToastMessage("Invitation deleted successfully", "success");
    } catch (err) {
      showToastMessage("Failed to delete invitation", "error");
    }
    setLoading(false);
    setConfirmDelete(null);
  };
  // Update invitation status
  const updateInvitationStatus = async (
    tenantId: any,
    invitationId: string | undefined,
    invitationStatus: string | undefined
  ) => {
    try {
      // Simulate API call
      const respose = await updateInvitation({
        invitationId,
        invitationStatus,
        tenantId,
      });

      if (respose.responseCode === 200) {
        if (invitationStatus === "Accepted") {
          showToastMessage(t("COHORTINVITATION.ACCEPTED_SUCCESS"), "success");
          router.push("/cohorts");
        } else if (invitationStatus === "Revoked") {
          showToastMessage(t("COHORTINVITATION.REVOKED_SUCCESS"), "success");
        } else {
          showToastMessage(t("COHORTINVITATION.REJECTED_SUCCESS"), "success");
        }
        fetchInitialInvitations();
      } else {
        showToastMessage(t("COHORTINVITATION.ERROR_UPDATING_REQUEST"), "error");
      }
    } catch (err) {
      setError("Failed to update invitation status");
      showToastMessage(t("COHORTINVITATION.ERROR_UPDATING_REQUEST"), "error");
    }
  };

  return (
    <>
      {/* Notification Display */}
      {currentNotification && (
        <Stack
          spacing={2}
          sx={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1400,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ width: "250%!important" }}
          >
            <Alert
              severity="info"
              icon={
                <ErrorOutlinedIcon
                  fontSize="inherit"
                  sx={{ color: "#FBBC05" }}
                />
              }
              onClose={handleCloseNotification}
              action={
                <>
                  <Button
                    variant="contained"
                    onClick={handleTakeAction}
                    sx={{
                      bgcolor: "#E7EBEF",
                      color: "#001E2D",
                      borderRadius: 0,
                      marginRight: "15px",
                    }}
                  >
                    {t("COHORTINVITATION.TAKE_ACTION")}
                  </Button>
                  <IconButton
                    sx={{
                      bgcolor: "#E7EBEF",
                      color: "#001E2D",
                      borderRadius: 0,
                      mr: "5px",
                    }}
                    onClick={handleCloseNotification}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </>
              }
              color="info"
              sx={{ width: "200%", bgcolor: "#FFF3CB" }}
            >
              {t("COHORTINVITATION.INVITED_AS_ADMIN")}:{" "}
              {currentNotification.cohortName}
            </Alert>
          </Snackbar>
        </Stack>
      )}

      {/* Notification Icon */}
      <IconButton
        id="notification-trigger"
        onClick={handleClick}
        sx={{ color: "white" }}
      >
        <Badge
          overlap="circular"
          badgeContent={notificationCount}
          color="error"
        >
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      {/* Invitation Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: "400px",
            maxHeight: "80vh",
            mt: "32px",
            position: "fixed",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Error and Success Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {success}
            </Alert>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label={t("COHORTINVITATION.SENT")} />
            <Tab label={t("COHORTINVITATION.RECEIVED")} />
          </Tabs>

          {/* Sent Invitations */}

          {tabValue === 0 && (
            <Stack spacing={1} sx={{ maxHeight: "400px", overflow: "auto" }}>
              {sentInvitations.length === 0 && (
                <Typography sx={{ textAlign: "center" }}>
                  {t("COHORTINVITATION.NO_PENDING_REQUESTS_SENT")}
                </Typography>
              )}
              {sentInvitations.map((invitation) => (
                <Card key={invitation.invitationId} variant="outlined">
                  <CardContent sx={{ "&:last-child": { pb: 2 }, p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          width: "65%",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          display: "block",
                        }}
                      >
                        Invited to <b>{invitation.invitedTo}</b> to join cohort{" "}
                        <b>{invitation.cohortName}</b>
                      </Typography>

                      <Tooltip title="Revoke Invitation">
                        <Button
                          size="small"
                          onClick={() =>
                            updateInvitationStatus(
                              invitation.tenantId,
                              invitation.invitationId,
                              "Revoked"
                            )
                          }
                          variant="outlined"
                          sx={{ borderRadius: "15px" }}
                        >
                          Revoke Invitation
                        </Button>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
          {/* Received Invitations */}
          {tabValue === 1 && (
            <Stack spacing={1} sx={{ maxHeight: "400px", overflow: "auto" }}>
              {notificationCount === 0 && (
                <Typography sx={{ textAlign: "center" }}>
                  {t("COHORTINVITATION.NO_PENDING_INVITATIONS")}
                </Typography>
              )}
              {receivedInvitations.map((invitation) => (
                <Card key={invitation.invitationId} variant="outlined">
                  <CardContent sx={{ "&:last-child": { pb: 2 }, p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          width: "75%",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          display: "block",
                        }}
                      >
                        {t("COHORTINVITATION.INVITED_BY")}{" "}
                        <b>{invitation.invitedBy}</b> to cohort{" "}
                        <b>{invitation.cohortName}</b>
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Tooltip
                          title={t("COHORTINVITATION.ACCEPT_INVITATION")}
                        >
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() =>
                              updateInvitationStatus(
                                invitation.tenantId,
                                invitation.invitationId,
                                "Accepted"
                              )
                            }
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={t("COHORTINVITATION.REJECT_INVITATION")}
                        >
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() =>
                              updateInvitationStatus(
                                invitation.tenantId,
                                invitation.invitationId,
                                "Rejected"
                              )
                            }
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Menu>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Invitation</DialogTitle>
        <DialogContent>
          <Typography>
            {t("COHORTINVITATION.DELETE_CONFIRMATION")}{" "}
            {confirmDelete?.invitedTo}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>
            {" "}
            {t("COHORTINVITATION.CANCEL")}
          </Button>
          <Button
            color="error"
            onClick={() => deleteInvitation(confirmDelete?.invitationId)}
          >
            {t("COHORTINVITATION.REVOKE")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvitationMenu;
