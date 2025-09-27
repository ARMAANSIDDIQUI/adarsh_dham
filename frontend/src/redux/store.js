import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';

// 1. Configuration for Redux Persist
const persistConfig = {
  key: 'root',
  storage,
  // Only persist the 'auth' slice
  whitelist: ['auth'], 
};

// 2. Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  booking: bookingReducer,
});

// 3. Create a persisted reducer wrapper
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // 4. Middleware to ignore redux-persist action types in the console warnings
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 5. Create a persistor object
export const persistor = persistStore(store);

// NOTE: You must now wrap your main App component with <PersistGate loading={null} persistor={persistor}>
