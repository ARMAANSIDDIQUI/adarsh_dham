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

// Async thunk for logging in a user
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

// Async thunk for checking authentication status on app load
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { getState, rejectWithValue }) => {
    const state = getState().auth; 
    
    if (!state.isPersistLoaded) {
      return { user: null, isAuthenticated: false }; 
    }

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
      api.defaults.headers.common['Authorization'] = null;
      return rejectWithValue({ message: 'Invalid token' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to log the user out
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null; 
      api.defaults.headers.common['Authorization'] = null;
    },
    // Action for PROFILE UPDATES (only changes user details)
    updateUser: (state, action) => {
        if (state.user && action.payload) {
            state.user = { ...state.user, ...action.payload };
        }
    },
    // Action for full login/session replacement (requires user AND token)
    setCredentials: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state, action) => {
          state.isPersistLoaded = true;
          if (action.payload && action.payload.auth) {
            const token = action.payload.auth.token;
            if (token) {
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
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

export const { logout, updateUser, setCredentials } = authSlice.actions;

export default authSlice.reducer;