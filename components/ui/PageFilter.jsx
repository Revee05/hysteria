"use client";

import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function PageFilter({ perPage = 10, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="per-page-label">Per page</InputLabel>
      <Select
        labelId="per-page-label"
        value={perPage}
        label="Per page"
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={50}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
      </Select>
    </FormControl>
  );
}
