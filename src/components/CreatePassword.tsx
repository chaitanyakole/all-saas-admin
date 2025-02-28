import React, { useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface PasswordFieldsProps {
  onChange: (passwordData: {
    oldPassword?: string;
    password: string;
    confirmPassword: string;
    isValid: boolean;
  }) => void;
  editPassword?: boolean;
}

const PasswordFields: React.FC<PasswordFieldsProps> = ({
  onChange,
  editPassword = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [samePasswordError, setSamePasswordError] = useState(false);
  const [showValidationMessages, setShowValidationMessages] = useState(false);
  const [visibility, setVisibility] = useState({
    oldPassword: false,
    password: false,
    confirmPassword: false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setShowValidationMessages(!!value);
    validatePassword(value);
    if (samePasswordError) {
      setSamePasswordError(false);
    }

    if (editPassword && value === oldPassword && value !== "") {
      setSamePasswordError(true);
    } else {
      setSamePasswordError(false);
    }

    if (confirmPassword) {
      setConfirmPasswordError(confirmPassword !== value);
    }

    updateParentForm(oldPassword, value, confirmPassword);
  };

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOldPassword(value);
    if (oldPasswordError) {
      setOldPasswordError(false);
    }

    // Check if new password is same as old (for edit mode)
    if (value === password && value !== "") {
      setSamePasswordError(true);
    } else {
      setSamePasswordError(false);
    }

    updateParentForm(value, password, confirmPassword);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value !== password);
    updateParentForm(oldPassword, password, value);
  };

  const validatePassword = (value: string) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 8;

    const isValid =
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      isValidLength;
    setPasswordError(!isValid);

    return isValid;
  };

  const updateParentForm = (
    oldPwd: string,
    newPwd: string,
    confirmPwd: string
  ) => {
    const isFormValid =
      !passwordError &&
      !confirmPasswordError &&
      !samePasswordError &&
      newPwd &&
      confirmPwd &&
      (!editPassword || (editPassword && oldPwd));

    const data: any = {
      password: newPwd,
      confirmPassword: confirmPwd,
      isValid: isFormValid,
    };

    if (editPassword) {
      data["oldPassword"] = oldPwd;
    }

    onChange(data);
  };

  const handleToggleVisibility = (field: keyof typeof visibility) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <>
      {editPassword && (
        <Box sx={{ width: "100%" }}>
          <TextField
            id="old-password"
            name="old-password-field"
            autoComplete="new-password"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleToggleVisibility("oldPassword")}
                    edge="end"
                  >
                    {visibility.oldPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            type={visibility.oldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={handleOldPasswordChange}
            error={oldPasswordError}
            helperText={
              oldPasswordError && t("LOGIN_PAGE.CURRENT_PASSWORD_NOT")
            }
            label={t("LOGIN_PAGE.OLD_PASSWORD")}
            fullWidth
            sx={{
              ".MuiFormHelperText-root.Mui-error": {
                color: theme.palette.error.main,
              },
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          margin: editPassword ? "1.8rem 0 0" : "0",
        }}
      >
        <TextField
          id="password"
          name="new-password-field"
          autoComplete="new-password"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleToggleVisibility("password")}
                  edge="end"
                >
                  {visibility.password ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          type={visibility.password ? "text" : "password"}
          value={password}
          onChange={handlePasswordChange}
          error={passwordError || samePasswordError}
          FormHelperTextProps={{
            sx: {
              color:
                passwordError || samePasswordError
                  ? theme.palette.error.main
                  : "inherit",
            },
          }}
          helperText={
            (passwordError && t("LOGIN_PAGE.YOUR_PASSWORD_NEED")) ||
            (samePasswordError && t("LOGIN_PAGE.PASSWORD_SAME_AS_OLD"))
          }
          label={t("LOGIN_PAGE.PASSWORD")}
          fullWidth
          sx={{
            ".MuiFormHelperText-root.Mui-error": {
              color:
                passwordError || samePasswordError
                  ? theme.palette.error.main
                  : "inherit",
            },
          }}
        />
      </Box>

      {showValidationMessages && (
        <Box sx={{ mt: 0.8, pl: "16px" }}>
          <Typography variant="body2">
            <Box
              sx={{
                color:
                  password.match(/[A-Z]/) && password.match(/[a-z]/)
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                fontSize: "12px",
                fontWeight: "400",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <CheckIcon sx={{ fontSize: "15px" }} />{" "}
              {t("LOGIN_PAGE.INCLUDE_BOTH")}
            </Box>
            <Box
              sx={{
                color: password.match(/\d/)
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontSize: "12px",
                fontWeight: "400",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                pt: 0.3,
              }}
            >
              <CheckIcon sx={{ fontSize: "15px" }} />{" "}
              {t("LOGIN_PAGE.INCLUDE_NUMBER")}
            </Box>
            <Box
              sx={{
                color: password.match(/[!@#$%^&*(),.?":{}|<>]/)
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontSize: "12px",
                fontWeight: "400",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                pt: 0.3,
              }}
            >
              <CheckIcon sx={{ fontSize: "15px" }} />{" "}
              {t("LOGIN_PAGE.INCLUDE_SPECIAL")}
            </Box>
            <Box
              sx={{
                color:
                  password.length >= 8
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                fontSize: "12px",
                fontWeight: "400",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                pt: 0.3,
              }}
            >
              <CheckIcon sx={{ fontSize: "15px" }} />
              {t("LOGIN_PAGE.MUST_BE_AT")}
            </Box>
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          margin: password ? "0 0 0" : "2rem 0 0",
        }}
      >
        <TextField
          id="confirm-password"
          name="confirm-password-field"
          autoComplete="new-password"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleToggleVisibility("confirmPassword")}
                  edge="end"
                >
                  {visibility.confirmPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          type={visibility.confirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={confirmPasswordError}
          helperText={confirmPasswordError && t("LOGIN_PAGE.NOT_MATCH")}
          label={t("LOGIN_PAGE.CONFIRM_PASSWORD")}
          fullWidth
          sx={{
            ".MuiFormHelperText-root.Mui-error": {
              color: theme.palette.error.main,
            },
          }}
        />
      </Box>
    </>
  );
};

export default PasswordFields;
