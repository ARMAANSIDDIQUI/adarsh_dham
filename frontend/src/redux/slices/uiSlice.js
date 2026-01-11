import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'en', // 'en' or 'hi'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
