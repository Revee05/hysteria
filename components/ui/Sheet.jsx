import React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'

// Shared Sheet component (bottom sheet) using MUI Drawer.
// Props:
// - open: boolean
// - onClose: function
// - title: string | node
// - children: node
// - footer: node (optional)
// - anchor: 'bottom' | 'left' | 'right' | 'top' (default: 'bottom')
// - paperSx: additional sx for Paper
// - className: custom className applied to root container Box
// - paperClassName: custom className applied to the Drawer Paper
// Example usage:
// <Sheet open={open} onClose={handleClose} title="Detail">
//   <YourContent />
// </Sheet>

export default function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  anchor = 'bottom',
  paperSx = {},
  className = '',
  paperClassName = '',
  backdropSx = {},
  backdropClassName = '',
  transitionDuration = 300,
  hideClose = false,
}) {
  // sensible defaults for a right-fullscreen sheet
  const defaultPaperSx = {
    borderTopLeftRadius: anchor === 'bottom' ? 12 : 0,
    borderTopRightRadius: anchor === 'bottom' ? 12 : 0,
    borderBottomLeftRadius: anchor === 'top' ? 12 : 0,
    borderBottomRightRadius: anchor === 'top' ? 12 : 0,
    // full-height for left/right anchors; limit height for top/bottom anchors
    maxHeight: anchor === 'bottom' || anchor === 'top' ? '90vh' : '100vh',
    // responsive width: full viewport on xs, constrained on md+
    width: anchor === 'left' || anchor === 'right' ? { xs: '100vw', md: 480 } : '100% ',
    // ensure right anchor takes full viewport height and aligns to right
    ...(anchor === 'right' ? { height: '100vh' } : {}),
    ...paperSx,
  };

  const defaultBackdropSx = {
    // subtle dark overlay with blur for Figma-like effect
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    ...backdropSx,
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      transitionDuration={transitionDuration}
      BackdropProps={{
        sx: defaultBackdropSx,
        className: backdropClassName,
      }}
      PaperProps={{
        sx: defaultPaperSx,
        className: paperClassName,
      }}
    >
      <Box className={className} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: 18 }}>
            {title}
          </Typography>
          {!hideClose && (
            <IconButton onClick={onClose} size="small" aria-label="close sheet" sx={{ p: 1 }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
        <Divider />

        <Box sx={{ p: { xs: 3, md: 2 }, overflow: 'auto', flex: 1 }}>{children}</Box>

        {footer && (
          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>{footer}</Box>
        )}
      </Box>
    </Drawer>
  );
}
