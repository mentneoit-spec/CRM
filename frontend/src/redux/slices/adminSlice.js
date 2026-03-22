import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI, transportAPI } from '../../config/api';

const toApiErrorMessage = (error, fallback) => {
    const backendMessage = error?.response?.data?.message;
    const backendPath = error?.response?.data?.path;
    const message = backendMessage || error?.message || fallback;
    return backendPath ? `${message} (${backendPath})` : message;
};

// Async Thunks
export const fetchTeachers = createAsyncThunk('admin/fetchTeachers', async (params = {}, { rejectWithValue }) => {
    try {
        // Add default pagination if not provided
        const queryParams = { limit: 50, ...params };
        const response = await adminAPI.getTeachers(queryParams);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch teachers');
    }
});

export const createTeacher = createAsyncThunk('admin/createTeacher', async (data, { rejectWithValue }) => {
    try {
        const response = await adminAPI.createTeacher(data);
        // API interceptor unwraps response, so response is { success, message, data: { user, teacher } }
        return response?.data?.teacher || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create teacher');
    }
});

export const fetchStudents = createAsyncThunk('admin/fetchStudents', async (params = {}, { rejectWithValue }) => {
    try {
        // Add default pagination if not provided
        const queryParams = { limit: 50, ...params };
        const response = await adminAPI.getStudents(queryParams);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch students');
    }
});

export const createStudent = createAsyncThunk('admin/createStudent', async (data, { rejectWithValue }) => {
    try {
        const response = await adminAPI.createStudent(data);
        // API interceptor unwraps response, so response is { success, message, data: { user, student, loginCredentials } }
        return response?.data?.student || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create student');
    }
});

export const updateStudent = createAsyncThunk('admin/updateStudent', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.updateStudent(id, data);
        // API interceptor unwraps response, so response is { success, data: student }
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to update student');
    }
});

export const deleteStudent = createAsyncThunk('admin/deleteStudent', async (id, { rejectWithValue }) => {
    try {
        const response = await adminAPI.deleteStudent(id);
        return { id, response };
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to delete student');
    }
});

export const bulkImportStudents = createAsyncThunk('admin/bulkImportStudents', async ({ file, mode }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.bulkImportStudents(file, mode);
        return response;
    } catch (error) {
        return rejectWithValue(toApiErrorMessage(error, 'Failed to import students'));
    }
});

export const bulkImportTeachers = createAsyncThunk('admin/bulkImportTeachers', async ({ file, mode }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.bulkImportTeachers(file, mode);
        return response;
    } catch (error) {
        return rejectWithValue(toApiErrorMessage(error, 'Failed to import teachers'));
    }
});

export const bulkImportClasses = createAsyncThunk('admin/bulkImportClasses', async ({ file, mode }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.bulkImportClasses(file, mode);
        return response;
    } catch (error) {
        return rejectWithValue(toApiErrorMessage(error, 'Failed to import classes'));
    }
});

export const bulkImportSubjects = createAsyncThunk('admin/bulkImportSubjects', async ({ file, mode }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.bulkImportSubjects(file, mode);
        return response;
    } catch (error) {
        return rejectWithValue(toApiErrorMessage(error, 'Failed to import subjects'));
    }
});

export const bulkImportAdmissions = createAsyncThunk('admin/bulkImportAdmissions', async ({ file, mode }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.bulkImportAdmissions(file, mode);
        return response;
    } catch (error) {
        return rejectWithValue(toApiErrorMessage(error, 'Failed to import admissions'));
    }
});

export const fetchClasses = createAsyncThunk('admin/fetchClasses', async (params = {}, { rejectWithValue }) => {
    try {
        // Add default pagination if not provided
        const queryParams = { limit: 50, ...params };
        const response = await adminAPI.getClasses(queryParams);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch classes');
    }
});

export const createClass = createAsyncThunk('admin/createClass', async (data, { rejectWithValue }) => {
    try {
        const response = await adminAPI.createClass(data);
        // API interceptor unwraps response, so response is { success, message, data: sclass }
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create class');
    }
});

export const fetchAdmissions = createAsyncThunk('admin/fetchAdmissions', async (params = {}, { rejectWithValue }) => {
    try {
        // Add default pagination if not provided
        const queryParams = { limit: 50, ...params };
        const response = await adminAPI.getAdmissions(queryParams);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch admissions');
    }
});

export const fetchSubjects = createAsyncThunk('admin/fetchSubjects', async (params = {}, { rejectWithValue }) => {
    try {
        // Add default pagination if not provided
        const queryParams = { limit: 50, ...params };
        const response = await adminAPI.getSubjects(queryParams);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch subjects');
    }
});

export const createSubject = createAsyncThunk('admin/createSubject', async (data, { rejectWithValue }) => {
    try {
        const response = await adminAPI.createSubject(data);
        // API interceptor unwraps response, so response is { success, message, data: subject }
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create subject');
    }
});

export const fetchTeams = createAsyncThunk('admin/fetchTeams', async (params = {}, { rejectWithValue }) => {
    try {
        const response = await adminAPI.getTeams(params);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch team members');
    }
});

export const createTeamMember = createAsyncThunk('admin/createTeamMember', async (data, { rejectWithValue }) => {
    try {
        const response = await adminAPI.createTeamMember(data);
        // backend returns { success, data: { user, teamProfile } }
        const teamProfile = response?.data?.teamProfile;
        const user = response?.data?.user;
        const role = data?.role;
        if (teamProfile && role) {
            return { ...teamProfile, role, user };
        }
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create team member');
    }
});

export const fetchRoutes = createAsyncThunk('admin/fetchRoutes', async (_, { rejectWithValue }) => {
    try {
        const response = await transportAPI.getRoutes();
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch routes');
    }
});

export const createRoute = createAsyncThunk('admin/createRoute', async (data, { rejectWithValue }) => {
    try {
        const response = await transportAPI.createRoute(data);
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create route');
    }
});

export const fetchBuses = createAsyncThunk('admin/fetchBuses', async (_, { rejectWithValue }) => {
    try {
        const response = await transportAPI.getBuses();
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch buses');
    }
});

export const createBus = createAsyncThunk('admin/createBus', async (data, { rejectWithValue }) => {
    try {
        const response = await transportAPI.createBus(data);
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to create bus');
    }
});

export const approveAdmission = createAsyncThunk('admin/approveAdmission', async (id, { rejectWithValue }) => {
    try {
        const response = await adminAPI.approveAdmission(id);
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to approve admission');
    }
});

export const rejectAdmission = createAsyncThunk('admin/rejectAdmission', async ({ id, reason }, { rejectWithValue }) => {
    try {
        const response = await adminAPI.rejectAdmission(id, reason);
        return response?.data || null;
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to reject admission');
    }
});

export const fetchFees = createAsyncThunk('admin/fetchFees', async (params = {}, { rejectWithValue }) => {
    try {
        const response = await adminAPI.getFees(params);
        return response?.data || [];
    } catch (error) {
        return rejectWithValue(error?.message || error?.response?.data?.message || 'Failed to fetch fees');
    }
});

const initialState = {
    teachers: [],
    students: [],
    classes: [],
    subjects: [],
    teams: [],
    routes: [],
    buses: [],
    admissions: [],
    fees: [],
    loading: false,
    error: null,
    success: false,
    message: '',
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => { state.error = null; },
        clearAdminSuccess: (state) => { state.success = false; state.message = ''; },
        clearAdminStatus: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Teachers
            .addCase(fetchTeachers.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTeachers.fulfilled, (state, action) => { state.loading = false; state.teachers = action.payload; })
            .addCase(fetchTeachers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createTeacher.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createTeacher.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Teacher added!'; if (action.payload) state.teachers.push(action.payload); })
            .addCase(createTeacher.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Students
            .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchStudents.fulfilled, (state, action) => { state.loading = false; state.students = action.payload; })
            .addCase(fetchStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createStudent.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createStudent.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Student added!'; if (action.payload) state.students.push(action.payload); })
            .addCase(createStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(updateStudent.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(updateStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Student updated!';
                const updated = action.payload;
                if (updated?.id) {
                    const idx = state.students.findIndex(s => s.id === updated.id);
                    if (idx !== -1) state.students[idx] = { ...state.students[idx], ...updated };
                }
            })
            .addCase(updateStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(deleteStudent.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Student deleted!';
                const deletedId = action.payload?.id;
                if (deletedId) state.students = state.students.filter(s => s.id !== deletedId);
            })
            .addCase(deleteStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(bulkImportStudents.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(bulkImportStudents.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'Import completed!';
            })
            .addCase(bulkImportStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(bulkImportTeachers.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(bulkImportTeachers.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'Import completed!';
            })
            .addCase(bulkImportTeachers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(bulkImportClasses.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(bulkImportClasses.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'Import completed!';
            })
            .addCase(bulkImportClasses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(bulkImportSubjects.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(bulkImportSubjects.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'Import completed!';
            })
            .addCase(bulkImportSubjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(bulkImportAdmissions.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(bulkImportAdmissions.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.message = 'Import completed!';
            })
            .addCase(bulkImportAdmissions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Classes
            .addCase(fetchClasses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchClasses.fulfilled, (state, action) => { state.loading = false; state.classes = action.payload; })
            .addCase(fetchClasses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createClass.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createClass.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Class added!'; if (action.payload) state.classes.push(action.payload); })
            .addCase(createClass.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Subjects
            .addCase(fetchSubjects.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSubjects.fulfilled, (state, action) => { state.loading = false; state.subjects = action.payload; })
            .addCase(fetchSubjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createSubject.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createSubject.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Subject added!'; if (action.payload) state.subjects.push(action.payload); })
            .addCase(createSubject.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Teams
            .addCase(fetchTeams.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTeams.fulfilled, (state, action) => { state.loading = false; state.teams = action.payload; })
            .addCase(fetchTeams.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createTeamMember.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createTeamMember.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Team member added!'; if (action.payload) state.teams.push(action.payload); })
            .addCase(createTeamMember.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Transport Routes & Buses
            .addCase(fetchRoutes.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchRoutes.fulfilled, (state, action) => { state.loading = false; state.routes = action.payload; })
            .addCase(fetchRoutes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createRoute.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createRoute.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Route added!'; if (action.payload) state.routes.push(action.payload); })
            .addCase(createRoute.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(fetchBuses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchBuses.fulfilled, (state, action) => { state.loading = false; state.buses = action.payload; })
            .addCase(fetchBuses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createBus.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(createBus.fulfilled, (state, action) => { state.loading = false; state.success = true; state.message = 'Bus added!'; if (action.payload) state.buses.push(action.payload); })
            .addCase(createBus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Admissions
            .addCase(fetchAdmissions.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdmissions.fulfilled, (state, action) => { state.loading = false; state.admissions = action.payload; })
            .addCase(fetchAdmissions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(approveAdmission.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(approveAdmission.fulfilled, (state, action) => {
                state.loading = false; state.success = true; state.message = 'Admission Approved!';
                const idx = state.admissions.findIndex(a => a.id === action.payload.id);
                if (idx !== -1) state.admissions[idx] = action.payload;
            })
            .addCase(approveAdmission.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(rejectAdmission.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
            .addCase(rejectAdmission.fulfilled, (state, action) => {
                state.loading = false; state.success = true; state.message = 'Admission Rejected!';
                const idx = state.admissions.findIndex(a => a.id === action.payload.id);
                if (idx !== -1) state.admissions[idx] = action.payload;
            })
            .addCase(rejectAdmission.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Fees
            .addCase(fetchFees.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchFees.fulfilled, (state, action) => { state.loading = false; state.fees = action.payload; })
            .addCase(fetchFees.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { clearAdminError, clearAdminSuccess, clearAdminStatus } = adminSlice.actions;
export default adminSlice.reducer;
