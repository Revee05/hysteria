"use client";

import React from "react";
import TextField from "@mui/material/TextField";

export default function EmailField({
  className = "",
  name = "email",
  label = "Email",
  register,
  error,
  placeholder = "nama@domain.com",
  ...props
}) {
  return (
    <TextField
      className={className}
      label={label}
      type="email"
      placeholder={placeholder}
      fullWidth
      variant="outlined"
      size="small"
      {...(register ? register(name) : {})}
      error={!!error}
      helperText={error?.message}
      {...props}
    />
  );
}
