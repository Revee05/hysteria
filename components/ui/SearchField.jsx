"use client";

import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

const SearchField = React.forwardRef(function SearchField(
  { placeholder = "Search...", className = "", value, onChange, name, ...props },
  ref
) {
  return (
    <TextField
      inputRef={ref}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth
      variant="outlined"
      size="small"
      className={className}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton edge="start" size="small" tabIndex={-1} aria-hidden>
              <SearchIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
});

export default SearchField;
