"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

export default function DataTable({ columns = [], rows = [], loading = false, getRowId = (r) => r.id, onRowClick = null }) {
  const headerRefs = useRef([]);
  const [colWidths, setColWidths] = useState(() =>
    columns.map((col, i) => {
      if (typeof col.width === 'number') return col.width;
      // first column default small (for ID), others default normal (undefined so layout can size)
      return i === 0 ? 60 : undefined;
    })
  );
  const resizingRef = useRef({ index: -1, startX: 0, startWidth: 0 });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize widths from DOM after mount
  useLayoutEffect(() => {
    const widths = columns.map((_, i) => {
      const el = headerRefs.current[i];
      return el ? el.getBoundingClientRect().width : undefined;
    });
    setColWidths((prev) =>
      widths.map((w, i) => {
        if (prev && typeof prev[i] === 'number') return prev[i];
        if (typeof columns[i]?.width === 'number') return columns[i].width;
        if (typeof w === 'number') return w;
        return i === 0 ? 60 : 160;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.length]);

  // Mouse handlers for resizing
  const onMouseMove = useCallback((e) => {
    const r = resizingRef.current;
    if (r.index === -1) return;
    const delta = e.clientX - r.startX;
    const newWidth = Math.max(40, Math.round(r.startWidth + delta));
    setColWidths((prev) => {
      const next = [...prev];
      next[r.index] = newWidth;
      return next;
    });
  }, []);

  const onMouseUp = useCallback(() => {
    resizingRef.current.index = -1;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  const handleMouseDown = (e, index) => {
    const startWidth = headerRefs.current[index]?.getBoundingClientRect().width || colWidths[index] || 120;
    resizingRef.current = { index, startX: e.clientX, startWidth };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Compute left offsets for frozen columns (columns with `freeze: true`)
  const leftOffsets = [];
  (function computeLefts() {
    let acc = 0;
    columns.forEach((col, i) => {
      const effectiveFreeze = !!col.freeze && (!isMobile || i === 0);
      if (effectiveFreeze) {
        leftOffsets[i] = acc;
        acc += (colWidths[i] ?? 0);
      } else {
        leftOffsets[i] = undefined;
      }
    });
  })();

  // compute a sensible minWidth for the table so columns don't collapse on small screens
  const totalMinWidth = columns.reduce((acc, col, i) => {
    const w = colWidths[i] ?? (typeof col.width === 'number' ? col.width : 160);
    return acc + (typeof w === 'number' ? w : 160);
  }, 0);

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <TableContainer component={Paper} className="bg-white rounded-none sm:rounded-lg border-0 sm:border border-zinc-200">
        <Table
          size="small"
          aria-label="data table"
          className="min-w-full divide-y divide-zinc-200"
          sx={{ tableLayout: 'fixed', minWidth: Math.max(totalMinWidth, 600) }}
        >
          <TableHead className="bg-zinc-50">
            <TableRow>
              {columns.map((col, i) => {
                const width = colWidths[i];
                const isFrozen = !!col.freeze && (!isMobile || i === 0);
                const stickySx = isFrozen
                  ? {
                      position: 'sticky',
                      left: leftOffsets[i],
                      zIndex: 3,
                      backgroundColor: (theme) => theme.palette.background.paper,
                      '&::after': (theme) => ({
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        backgroundColor: theme.palette.divider,
                      }),
                    }
                  : {};
                return (
                  <TableCell
                    key={col.field}
                    ref={(el) => (headerRefs.current[i] = el)}
                    align={col.headerAlign || col.align || 'left'}
                    className={col.headerClassName || 'px-3 sm:px-6 py-2 sm:py-3 text-xs font-bold text-zinc-900 uppercase tracking-wider'}
                    sx={{
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: width ?? 'auto',
                      maxWidth: width ?? 'none',
                      minWidth: { xs: 80, sm: 40 },
                      borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                      ...stickySx,
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{col.headerName}</span>
                      <div
                        onMouseDown={(e) => handleMouseDown(e, i)}
                        style={{ position: 'absolute', right: -8, top: 0, bottom: 0, width: 12, cursor: 'col-resize', zIndex: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 2 }}
                        role="separator"
                        aria-orientation="horizontal"
                      >
                        <div style={{ width: 1, height: '60%', background: 'rgba(148,163,184,0.4)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody className="bg-white divide-y divide-zinc-200">
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="px-3 sm:px-6 py-6 sm:py-8">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-zinc-500 text-xs sm:text-sm">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col, i) => {
                    const width = colWidths[i];
                    const isFrozen = !!col.freeze && (!isMobile || i === 0);
                    const stickySx = isFrozen
                      ? {
                          position: 'sticky',
                          left: leftOffsets[i],
                          zIndex: 2,
                          backgroundColor: (theme) => theme.palette.background.paper,
                          '&::after': (theme) => ({
                            content: '""',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            backgroundColor: theme.palette.divider,
                          }),
                        }
                      : {};
                    const firstBorder = i === 0 ? { borderLeft: (theme) => `1px solid ${theme.palette.divider}` } : {};
                    return (
                      <TableCell
                        key={col.field}
                        align={col.align || 'left'}
                        className={col.className || 'px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-zinc-900'}
                        sx={{
                          whiteSpace: { xs: 'normal', sm: 'nowrap' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: width ?? 'auto',
                          maxWidth: width ?? 'none',
                          minWidth: { xs: 80, sm: 40 },
                          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                          ...firstBorder,
                          ...stickySx,
                        }}
                      >
                        {col.render ? col.render(row) : (row[col.field] ?? '-')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
