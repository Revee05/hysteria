"use client";

import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function PasswordField({
  name = "password",
  label = "Password",
  register,
  error,
  className = "",
  placeholder = "••••••••",
  ...props
}) {
  const [show, setShow] = useState(false);

  const handleToggle = () => setShow((s) => !s);

  return (
    <TextField
      className={className}
      label={label}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      fullWidth
      variant="outlined"
      size="small"
      {...(register ? register(name) : {})}
      error={!!error}
      helperText={error?.message}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleToggle}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              size="small"
              aria-label="toggle password visibility"
            >
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}
