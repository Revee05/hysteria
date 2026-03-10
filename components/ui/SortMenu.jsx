"use client";

import { useState } from "react";
// Tooltip removed to avoid overlapping the popup menu
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SortIcon from '@mui/icons-material/Sort';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function SortMenu({ value = 'terbaru', onChange, className }) {
  const [anchor, setAnchor] = useState(null);

  const handleClose = () => setAnchor(null);
  const handleSelect = (mode) => {
    if (onChange) onChange(mode);
    setAnchor(null);
  };

  return (
    <div className={className || 'flex-none'}>
      <IconButton
        aria-label="Urutkan item"
        onClick={(e) => setAnchor(e.currentTarget)}
        className="h-10 w-10 border border-zinc-300 rounded-full bg-stone-100 text-pink-500 shadow-md hover:bg-pink-50 transition"
        sx={{ bgcolor: "white"}}
      >
        <SortIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose} keepMounted>
          <MenuItem onClick={() => handleSelect('terbaru')} selected={value === 'terbaru'}>
            <ListItemIcon>
              <AccessTimeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Terbaru</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSelect('terlama')} selected={value === 'terlama'}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Terlama</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSelect('a-z')} selected={value === 'a-z'}>
            <ListItemIcon>
              <SortByAlphaIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>A → Z</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSelect('z-a')} selected={value === 'z-a'}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Z → A</ListItemText>
          </MenuItem>
      </Menu>
    </div>
  );
}
