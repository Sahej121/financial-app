import { configureStore } from '@reduxjs/toolkit';
import caReducer from './slices/caSlice';
import documentReducer from './slices/documentSlice';
import userReducer from './slices/userSlice';
import creditCardReducer from './slices/creditCardSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    ca: caReducer,
    documents: documentReducer,
    user: userReducer,
    creditCard: creditCardReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 