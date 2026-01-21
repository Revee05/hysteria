"use client";

import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

export default function DataTable({ columns = [], rows = [], loading = false, getRowId = (r) => r.id }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <TableContainer component={Paper} className="bg-white rounded-none sm:rounded-lg border-0 sm:border border-zinc-200">
        <Table size="small" aria-label="data table" className="min-w-full divide-y divide-zinc-200">
          <TableHead className="bg-zinc-50">
            <TableRow>
              {columns.map((col) => (
                <TableCell 
                  key={col.field} 
                  align={col.headerAlign || col.align || 'left'} 
                  className={col.headerClassName || 'px-3 sm:px-6 py-2 sm:py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider'}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {col.headerName}
                </TableCell>
              ))}
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
                <TableRow key={getRowId(row)} hover>
                  {columns.map((col) => (
                    <TableCell 
                      key={col.field} 
                      align={col.align || 'left'} 
                      className={col.className || 'px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-zinc-900'}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {col.render ? col.render(row) : (row[col.field] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
