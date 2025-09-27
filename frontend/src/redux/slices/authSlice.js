import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { jwtDecode } from 'jwt-decode';
import { REHYDRATE } from 'redux-persist';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isPersistLoaded: false, 
  token: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { phone, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { getState, rejectWithValue }) => {
    const state = getState().auth; 
    
    // **CRITICAL FIX:** Do not proceed with checkAuth logic until persistence has loaded.
    // This handles the race condition where getState().auth is still null/default.
    if (!state.isPersistLoaded) {
        // We will return a placeholder value and let the REHYDRATE handler below manage the token setting
        return { user: null, isAuthenticated: false }; 
    }

    // **CRITICAL:** Ensure API header is set before this request runs
    if (state.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    }

    if (!state.user || !state.token) {
        return rejectWithValue({ message: 'No session data found' });
    }

    try {
      const decoded = jwtDecode(state.token);
      if (decoded.exp * 1000 < Date.now()) {
        return rejectWithValue({ message: 'Token expired' });
      }
      
      return { user: state.user, isAuthenticated: true };

    } catch (error) {
      // If JWT decode fails or validation fails, this runs:
      api.defaults.headers.common['Authorization'] = null; // Clear header on failure
      return rejectWithValue({ message: 'Invalid token' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null; 
      // CRITICAL: Clear API header immediately on client-side logout
      api.defaults.headers.common['Authorization'] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handles data loaded by redux-persist
      .addCase(REHYDRATE, (state, action) => {
          state.isPersistLoaded = true;
          if (action.payload && action.payload.auth) {
            const token = action.payload.auth.token;
            // CRITICAL: Set API token immediately on rehydrate before any components fetch data
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // After rehydrate, dispatch checkAuth from a top-level component
                // to validate the token against the backend if needed.
            }
            // Inherit persisted state values if needed, although Redux Persist usually handles this automatically
            state.user = action.payload.auth.user || null;
            state.isAuthenticated = !!action.payload.auth.token;
            state.token = action.payload.auth.token || null;
          }
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Set API header immediately on successful login
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        api.defaults.headers.common['Authorization'] = null;
        state.error = action.payload || { message: 'Login failed' };
      })
      // --- checkAuth cases ---
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null; 
        api.defaults.headers.common['Authorization'] = null;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
