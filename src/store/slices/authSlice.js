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

const getStoredToken = () => {
  const savedToken = localStorage.getItem("staybook_token");

  if (!savedToken || savedToken === "undefined" || savedToken === "null") {
    return null;
  }

  return savedToken;
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/users/sign-in", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to sign in.",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/users", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create account.",
      );
    }
  },
);

const initialUser = getStoredUser();
const initialToken = getStoredToken();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialUser?.id && initialToken),
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
        state.successMessage = null;

        const { user, accessToken } = action.payload;

        if (user?.id && accessToken) {
          state.user = user;
          state.token = accessToken;
          state.isAuthenticated = true;

          localStorage.setItem("staybook_user", JSON.stringify(user));
          localStorage.setItem("staybook_token", accessToken);
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = "Invalid login response from server.";

          localStorage.removeItem("staybook_user");
          localStorage.removeItem("staybook_token");
        }
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.successMessage = null;

        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;

        localStorage.removeItem("staybook_user");
        localStorage.removeItem("staybook_token");
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.successMessage =
          "Account created successfully. You can now sign in.";

        // Register only creates the account.
        // Login is the one that creates the session/token.
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;

        localStorage.removeItem("staybook_user");
        localStorage.removeItem("staybook_token");
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.successMessage = null;

        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      });
  },
});

export const { logout, clearAuthMessages } = authSlice.actions;

export default authSlice.reducer;
