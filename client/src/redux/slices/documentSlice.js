import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    uploading: false,
    error: null,
  },
  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.documents.push(action.payload);
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearDocuments } = documentSlice.actions;
export default documentSlice.reducer; 