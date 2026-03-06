import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search,
  FilterList,
  GetApp,
  Delete,
  Edit,
  Visibility,
  MoreVert,
} from '@mui/icons-material';

const DataTable = ({
  title,
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  onExport,
  searchable = true,
  selectable = false,
  actions = true,
  customActions,
  emptyMessage = 'No data available',
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filter and sort data
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((column) => {
      const value = row[column.field];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const sortedData = filteredData.sort((a, b) => {
    if (!orderBy) return 0;
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle actions menu
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentRow(null);
  };

  const handleAction = (action) => {
    if (action === 'view' && onView) onView(currentRow);
    if (action === 'edit' && onEdit) onEdit(currentRow);
    if (action === 'delete' && onDelete) onDelete(currentRow);
    handleMenuClose();
  };

  // Render cell value
  const renderCellValue = (row, column) => {
    const value = row[column.field];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'status') {
      return (
        <Chip
          label={value}
          size="small"
          color={
            value === 'active' || value === 'completed' || value === 'approved'
              ? 'success'
              : value === 'pending'
              ? 'warning'
              : value === 'inactive' || value === 'rejected'
              ? 'error'
              : 'default'
          }
        />
      );
    }

    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }

    if (column.type === 'currency') {
      return value ? `₹${value.toLocaleString()}` : '-';
    }

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value || '-';
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: 'primary.light',
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
            {selected.length} selected
          </Typography>
        ) : (
          <Typography sx={{ flex: '1 1 100%' }} variant="h6">
            {title}
          </Typography>
        )}

        {selected.length > 0 ? (
          <Tooltip title="Delete">
            <IconButton onClick={() => onBulkDelete && onBulkDelete(selected)}>
              <Delete />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {searchable && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {onExport && (
              <Tooltip title="Export">
                <IconButton onClick={onExport}>
                  <GetApp />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sortDirection={orderBy === column.field ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : 'asc'}
                      onClick={() => handleRequestSort(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
              {actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    hover
                    key={row.id || index}
                    selected={isItemSelected}
                    sx={{ cursor: selectable ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={(event) => handleClick(event, row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.field} align={column.align || 'left'}>
                        {renderCellValue(row, column)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {onView && (
          <MenuItem onClick={() => handleAction('view')}>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            View
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction('edit')}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => handleAction('delete')}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
        {customActions &&
          customActions.map((action, index) => (
            <MenuItem key={index} onClick={() => action.onClick(currentRow)}>
              {action.icon && <Box sx={{ mr: 1 }}>{action.icon}</Box>}
              {action.label}
            </MenuItem>
          ))}
      </Menu>
    </Paper>
  );
};

export default DataTable;
