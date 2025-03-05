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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userData: {
    tenantId?: string;
    username?: string;
    name?: string;
  };
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

  const validatePasswords = (): boolean => {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError(t("COMMON.PASSWORDS_DO_NOT_MATCH"));
      return false;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isValidLength = newPassword.length >= 8;

    if (!isValidLength) {
      setError(t("COMMON.PASSWORD_LENGTH_ERROR"));
      return false;
    }

    if (!hasUpperCase) {
      setError(t("COMMON.PASSWORD_UPPERCASE_ERROR"));
      return false;
    }

    if (!hasLowerCase) {
      setError(t("COMMON.PASSWORD_LOWERCASE_ERROR"));
      return false;
    }

    if (!hasNumber) {
      setError(t("COMMON.PASSWORD_NUMBER_ERROR"));
      return false;
    }

    if (!hasSpecialChar) {
      setError(t("COMMON.PASSWORD_SPECIAL_CHAR_ERROR"));
      return false;
    }

    setError("");
    return true;
  };

  const handleResetConfirm = async () => {
    if (!validatePasswords()) return;

    setIsLoading(true);
    setError("");

    const userObj = {
      userName: userData?.username,
      newPassword: newPassword,
    };

    try {
      const response = await resetPassword(userObj, userData?.tenantId);
      if (response?.responseCode !== 200) {
        throw new Error(t("COMMON.PASSWORD_RESET_FAILED"));
      }

      showToastMessage(t("COMMON.PASSWORD_RESET_SUCCESSFUL"), "success");
      handleClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("COMMON.UNEXPECTED_ERROR");

      setError(errorMessage);
      showToastMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "400px",
          width: "100%",
        },
      }}
      fullWidth
    >
      <DialogTitle>{t("COMMON.RESET_PASSWORD")}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("COMMON.RESET_PASSWORD_FOR_USER")}{" "}
            <strong>{userData?.name}</strong>
          </Typography>

          <TextField
            fullWidth
            type="password"
            label={t("COMMON.NEW_PASSWORD")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            error={!!error}
            helperText={error && newPassword ? error : ""}
            aria-describedby="password-requirements"
            InputProps={{
              sx: {
                "& input": {
                  WebkitTextSecurity: "disc",
                },
              },
            }}
          />

          <TextField
            fullWidth
            type="password"
            label={t("COMMON.CONFIRM_PASSWORD")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            error={!!error}
            helperText={error && confirmPassword ? error : ""}
            aria-describedby="password-requirements"
            InputProps={{
              sx: {
                "& input": {
                  WebkitTextSecurity: "disc",
                },
              },
            }}
          />

          <Box
            id="password-requirements"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 2,
              p: 1,
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <InfoOutlinedIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              {t("COMMON.PASSWORD_COMPLEXITY_REQUIREMENTS")}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("COMMON.CANCEL")}
        </Button>
        <Button
          onClick={handleResetConfirm}
          variant="contained"
          color="primary"
          disabled={isLoading || !newPassword || !confirmPassword}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {t("COMMON.RESET_PASSWORD")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
