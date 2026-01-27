"use client";

import React, { useRef } from "react";
import Button from "@mui/material/Button";
import UploadFileIcon from "@mui/icons-material/UploadFile";

/**
 * Reusable UploadButton for admin UI
 * Props:
 * - accept: string (file accept)
 * - multiple: boolean
 * - label: string
 * - variant: 'text'|'outlined'|'contained'
 * - size: 'small'|'medium'|'large'
 * - onFiles: fn(FileList|Array<File>)
 * - disabled: boolean
 */
export default function UploadButton({
  accept = "image/*,video/*",
  multiple = false,
  label = "Upload",
  variant = "outlined",
  size = "small",
  onFiles = () => {},
  disabled = false,
  startIcon = <UploadFileIcon />,
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (!files) return;
    // pass FileList directly
    onFiles(files);
    // reset input so same file can be re-selected
    e.target.value = null;
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      <Button
        variant={variant}
        size={size}
        startIcon={startIcon}
        onClick={handleClick}
        disabled={disabled}
      >
        {label}
      </Button>
    </div>
  );
}
