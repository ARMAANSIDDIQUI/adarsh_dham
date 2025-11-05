import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications/unread-count');
      return res.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/notifications/mark-as-read');
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const markOneAsRead = createAsyncThunk(
  'notifications/markOneAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/notifications/${notificationId}/mark-as-read`);
      return res.data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

const initialState = {
  unreadCount: 0,
  status: 'idle',
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetNotificationCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.status = 'succeeded';
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markOneAsRead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markOneAsRead.fulfilled, (state) => {
        state.status = 'succeeded';
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markOneAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetNotificationCount } = notificationSlice.actions;
export default notificationSlice.reducer;
