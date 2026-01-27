import React, { useEffect, useRef } from 'react'
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
    width: anchor === 'left' || anchor === 'right' ? { xs: '100%', md: 480 } : '100% ',
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

  // lock body scroll while the sheet is open (also lock html element)
  useLockBodyScroll(open);

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      transitionDuration={transitionDuration}
      // override MUI container/root to ensure drawer can reach top edge
      slotProps={{
        root: {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 1300,
          },
        },
      }}
      ModalProps={{
        sx: { 
          display: 'flex', 
          alignItems: 'stretch',
          position: 'fixed !important',
          top: '0 !important',
          left: '0 !important',
          width: '100% !important',
          height: '100% !important',
          margin: '0 !important',
          padding: '0 !important',
          transform: 'none !important',
        },
      }}
      BackdropProps={{
        sx: defaultBackdropSx,
        className: backdropClassName,
      }}
      PaperProps={{
        sx: {
          ...defaultPaperSx,
          // ensure paper fills vertical space and sits at the absolute top
          position: 'fixed',
          inset: '0 auto 0 0',
          top: 0,
          right: 0,
          height: '100vh',
          margin: 0,
          padding: 0,
          borderRadius: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
        },
        className: paperClassName,
      }}
    >
      <Box className={className} sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0, m: 0 }}>
        {title !== null && (
          <>
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
          </>
        )}

        <Box sx={{ p: title !== null ? { xs: 3, md: 2 } : 0, overflow: 'auto', flex: 1 }}>{children}</Box>

        {footer && (
          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>{footer}</Box>
        )}
      </Box>
    </Drawer>
  );
}

// prevent body scroll when a Sheet is open (useful for full-screen drawers)
function useLockBodyScroll(open) {
  const origRef = useRef({ body: '', html: '', saved: false });

  useEffect(() => {
    // capture the current ref object so the cleanup uses the same snapshot
    const current = origRef.current;

    // when opening, save the current values once and then lock
    if (open) {
      if (!current.saved) {
        current.body = document.body.style.overflow;
        current.html = document.documentElement.style.overflow;
        current.saved = true;
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('sheet-open');
    } else {
      // restore saved values when closing
      document.body.style.overflow = current.body || '';
      document.documentElement.style.overflow = current.html || '';
      document.body.classList.remove('sheet-open');
      current.saved = false;
    }

    return () => {
      document.body.style.overflow = current.body || '';
      document.documentElement.style.overflow = current.html || '';
      document.body.classList.remove('sheet-open');
      current.saved = false;
    };
  }, [open]);
}
