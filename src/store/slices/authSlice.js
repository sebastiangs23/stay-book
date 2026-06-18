import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const getStoredUser = () => {
  const savedUser = localStorage.getItem("staybook_user");

  if (!savedUser || savedUser === "undefined" || savedUser === "null") {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("staybook_user");
    return null;
  }
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/users/sign-in", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to sign in."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/users", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create account."
      );
    }
  }
);

const initialUser = getStoredUser();

const initialState = {
  user: initialUser,
  token: null,
  isAuthenticated: Boolean(initialUser?.id),
  loading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;

      localStorage.removeItem("staybook_user");
      localStorage.removeItem("staybook_token");
    },

    clearAuthMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const user = action.payload;

        if (user?.id) {
          state.user = user;
          state.token = null;
          state.isAuthenticated = true;

          localStorage.setItem("staybook_user", JSON.stringify(user));
          localStorage.removeItem("staybook_token");
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = "Invalid login response from server.";
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;

        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const user = action.payload;

        if (user?.id) {
          state.user = user;
          state.token = null;
          state.isAuthenticated = true;
          state.successMessage = "Account created successfully.";

          localStorage.setItem("staybook_user", JSON.stringify(user));
          localStorage.removeItem("staybook_token");
        } else {
          state.successMessage =
            "Account created successfully. You can now sign in.";
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;

        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      });
  },
});

export const { logout, clearAuthMessages } = authSlice.actions;

export default authSlice.reducer;