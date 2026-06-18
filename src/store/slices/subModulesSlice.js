import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchSubmodules = createAsyncThunk(
  "submodules/fetchSubmodules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/submodule");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load submodules.",
      );
    }
  },
);

const initialState = {
  submodules: [],
  loading: false,
  error: null,
};

const submodulesSlice = createSlice({
  name: "submodules",
  initialState,
  reducers: {
    clearSubmodulesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmodules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmodules.fulfilled, (state, action) => {
        state.loading = false;

        const currentUser = JSON.parse(localStorage.getItem('staybook_user'));

        if(action.payload?.data && currentUser.role === "GUEST"){
          action.payload.data = action.payload.data.filter((sub) => !sub.isPrivate);
        }

        state.submodules = action.payload?.data || [];
      })
      .addCase(fetchSubmodules.rejected, (state, action) => {
        state.loading = false;
        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      });
  },
});

export const { clearSubmodulesError } = submodulesSlice.actions;

export default submodulesSlice.reducer;
