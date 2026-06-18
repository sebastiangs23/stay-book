import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchReservations = createAsyncThunk(
  "reservations/fetchReservations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/reservations", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load reservations.",
      );
    }
  },
);

export const fetchMyReservations = createAsyncThunk(
  "reservations/fetchMyReservations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/reservations/my", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load your reservations.",
      );
    }
  },
);

export const createReservation = createAsyncThunk(
  "reservations/createReservation",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/reservations", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create reservation.",
      );
    }
  },
);

export const cancelReservation = createAsyncThunk(
  "reservations/cancelReservation",
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(
        `/reservations/${reservationId}`,
        {
          status: "CANCELLED",
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to cancel reservation.",
      );
    }
  },
);

const initialState = {
  reservations: [],
  selectedReservation: null,
  loading: false,
  error: null,
  successMessage: null,
};

const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    clearReservationsMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      })

      .addCase(fetchMyReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      })

      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.push(action.payload);
        state.successMessage = "Reservation created successfully.";
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      })

      .addCase(cancelReservation.fulfilled, (state, action) => {
        const updatedReservation = action.payload;

        state.reservations = state.reservations.map((reservation) =>
          reservation.id === updatedReservation.id
            ? updatedReservation
            : reservation,
        );

        state.successMessage = "Reservation cancelled successfully.";
      });
  },
});

export const { clearReservationsMessages } = reservationsSlice.actions;

export default reservationsSlice.reducer;
