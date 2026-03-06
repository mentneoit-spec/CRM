import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TableSortLabel, Box, TextField, Button, Chip,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Stack
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onAdd,
  searchFields = [],
  title = '',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  actions = true,
  actionsWidth = 120
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState(columns[0]?.field || '');
  const [order, setOrder] = useState('asc');
  const [searchText, setSearchText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    
    return data.filter(row => {
      return (searchFields.length > 0 ? searchFields : Object.keys(row))
        .some(field => {
          const value = row[field];
          return value && value.toString().toLowerCase().includes(searchText.toLowerCase());
        });
    });
  }, [data, searchText, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, orderBy, order]);

  // Paginate data
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (onDelete && selectedRow) {
      onDelete(selectedRow);
    }
    setDeleteDialogOpen(false);
    setSelectedRow(null);
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {title && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{title}</h2>
          {onAdd && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{ textTransform: 'none', fontSize: '1rem' }}
            >
              Add New
            </Button>
          )}
        </Box>
      )}

      {/* Search Bar */}
      <TextField
        placeholder="Search..."
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setPage(0);
        }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
        }}
        sx={{ mb: 2, width: '300px' }}
        size="small"
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.align || 'left'}
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        padding: '12px 16px',
                        minWidth: column.minWidth || 100
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === column.field}
                        direction={orderBy === column.field ? order : 'asc'}
                        onClick={() => handleSort(column.field)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  {actions && <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => (
                    <TableRow
                      key={row.id || idx}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: '#fafafa' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={`${row.id}-${column.field}`}
                          align={column.align || 'left'}
                          sx={{ padding: '12px 16px' }}
                        >
                          {column.render
                            ? column.render(row[column.field], row)
                            : row[column.field]}
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell sx={{ padding: '12px 16px' }}>
                          <Stack direction="row" spacing={1}>
                            {onEdit && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEdit(row)}
                                  sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(row)}
                                  sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={sortedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this record? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;
