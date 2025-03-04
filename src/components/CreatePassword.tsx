import React, { useState } from "react";
import { WidgetProps } from "@rjsf/utils";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const PasswordCreate = (props: WidgetProps) => {
  const {
    id,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled,
    readonly,
    autofocus,
    required,

    rawErrors = [],
  } = props;

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  // Check if there are validation errors
  const hasError = rawErrors && rawErrors.length > 0;

  return (
    <TextField
      id={id}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur ? (e) => onBlur(id, e.target.value) : undefined}
      onFocus={onFocus ? (e) => onFocus(id, e.target.value) : undefined}
      required={required}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      type={showPassword ? "text" : "password"}
      fullWidth
      margin="normal"
      error={hasError}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordCreate;
