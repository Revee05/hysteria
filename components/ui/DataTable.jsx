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
    <TableContainer component={Paper} className="bg-white rounded-lg border border-zinc-200">
      <Table size="small" aria-label="data table" className="min-w-full divide-y divide-zinc-200">
        <TableHead className="bg-zinc-50">
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.field} className={col.headerClassName || 'px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider'}>
                {col.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody className="bg-white divide-y divide-zinc-200">
          {loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" className="px-6 py-8">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" className="px-6 py-8 text-center text-zinc-500">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((col) => (
                  <TableCell key={col.field} className={col.className || 'px-6 py-4 whitespace-nowrap text-sm text-zinc-900'}>
                    {col.render ? col.render(row) : (row[col.field] ?? '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
