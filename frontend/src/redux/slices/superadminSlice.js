import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { superAdminAPI } from '../../config/api';

// Async Thunks
export const fetchColleges = createAsyncThunk(
    'superadmin/fetchColleges',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.getColleges(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch colleges');
        }
    }
);

export const createCollege = createAsyncThunk(
    'superadmin/createCollege',
    async (collegeData, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.createCollege(collegeData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create college');
        }
    }
);

export const fetchCollegeDetails = createAsyncThunk(
    'superadmin/fetchCollegeDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.getCollege(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch college details');
        }
    }
);

export const updateCollege = createAsyncThunk(
    'superadmin/updateCollege',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.updateCollege(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update college');
        }
    }
);

export const suspendCollege = createAsyncThunk(
    'superadmin/suspendCollege',
    async (id, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.suspendCollege(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to suspend college');
        }
    }
);

export const createAdmin = createAsyncThunk(
    'superadmin/createAdmin',
    async (adminData, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.createAdmin(adminData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create admin');
        }
    }
);

export const fetchAnalytics = createAsyncThunk(
    'superadmin/fetchAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.getAnalytics();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch analytics');
        }
    }
);

export const fetchAuditLogs = createAsyncThunk(
    'superadmin/fetchAuditLogs',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await superAdminAPI.getAuditLogs(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch audit logs');
        }
    }
);

const initialState = {
    colleges: [],
    currentCollege: null,
    analytics: null,
    auditLogs: [],
    loading: false,
    error: null,
    success: false,
    message: '',
};

const superadminSlice = createSlice({
    name: 'superadmin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Colleges
            .addCase(fetchColleges.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColleges.fulfilled, (state, action) => {
                state.loading = false;
                state.colleges = action.payload;
            })
            .addCase(fetchColleges.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create College
            .addCase(createCollege.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createCollege.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'College created successfully!';
                state.colleges.unshift(action.payload);
            })
            .addCase(createCollege.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch College Details
            .addCase(fetchCollegeDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollegeDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCollege = action.payload;
            })
            .addCase(fetchCollegeDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update College
            .addCase(updateCollege.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCollege.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'College updated successfully!';
                const index = state.colleges.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.colleges[index] = action.payload;
                }
                if (state.currentCollege?.id === action.payload.id) {
                    state.currentCollege = action.payload;
                }
            })
            .addCase(updateCollege.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Suspend College
            .addCase(suspendCollege.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(suspendCollege.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'College suspended successfully!';
                const index = state.colleges.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.colleges[index] = action.payload;
                }
                if (state.currentCollege?.id === action.payload.id) {
                    state.currentCollege = action.payload;
                }
            })
            .addCase(suspendCollege.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Admin
            .addCase(createAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Admin created successfully!';
            })
            .addCase(createAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Analytics
            .addCase(fetchAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(fetchAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Audit Logs
            .addCase(fetchAuditLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.auditLogs = action.payload;
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccess } = superadminSlice.actions;
export default superadminSlice.reducer;
