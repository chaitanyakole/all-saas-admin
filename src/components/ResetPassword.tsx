import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { resetPassword } from "@/services/LoginService";
import { showToastMessage } from "./Toastify";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userData: any;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  userData,
}) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleResetConfirm = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);
    setError("");
    const tenantid = userData?.tenantId;
    const userObj = {
      userName: userData?.username,
      newPassword: newPassword,
    };

    try {
      const response = await resetPassword(userObj, tenantid);
      if (response?.responseCode !== 200) {
        throw new Error("Failed to reset password");
      }
      showToastMessage(t("COMMON.PASSWORD_RESET_SUCCESSFUL"), "success");
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      showToastMessage(t("COMMON.PASSWORD_RESET_FAILED"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("COMMON.RESET_PASSWORD")}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Reset password for user: <strong>{userData?.name}</strong>
          </Typography>

          <TextField
            fullWidth
            type="password"
            label={t("COMMON.NEW_PASSWORD")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            error={!!error}
          />

          <TextField
            fullWidth
            type="password"
            label={t("COMMON.CONFIRM_PASSWORD")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            error={!!error}
            helperText={error}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("COMMON.CANCEL")}
        </Button>
        <Button
          onClick={handleResetConfirm}
          variant="contained"
          sx={{ color: "white" }}
          disabled={isLoading || !newPassword || !confirmPassword}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {t("COMMON.RESET_PASSWORD")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
