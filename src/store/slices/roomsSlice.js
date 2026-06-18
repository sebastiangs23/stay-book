import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const normalizeRoomsResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: null,
    };
  }

  return {
    data: payload?.data || [],
    meta: payload?.meta || null,
  };
};

export const fetchRooms = createAsyncThunk(
  "rooms/fetchRooms",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/rooms", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load rooms.",
      );
    }
  },
);

export const fetchRoomById = createAsyncThunk(
  "rooms/fetchRoomById",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load room details.",
      );
    }
  },
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/rooms", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create room.",
      );
    }
  },
);

export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async ({ roomId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/rooms/${roomId}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to update room.",
      );
    }
  },
);

export const deactivateRoom = createAsyncThunk(
  "rooms/deactivateRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/rooms/${roomId}/deactivate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to deactivate room.",
      );
    }
  },
);

const initialState = {
  rooms: [],
  selectedRoom: null,
  meta: null,
  loading: false,
  error: null,
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearSelectedRoom(state) {
      state.selectedRoom = null;
    },

    clearRoomsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;

        const normalized = normalizeRoomsResponse(action.payload);

        state.rooms = normalized.data;
        state.meta = normalized.meta;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      })

      .addCase(fetchRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;
      })

      .addCase(createRoom.fulfilled, (state, action) => {
        const room = action.payload?.room || action.payload;

        if (room?.id) {
          state.rooms.push(room);
        }
      })

      .addCase(updateRoom.fulfilled, (state, action) => {
        const updatedRoom = action.payload?.room || action.payload;

        if (!updatedRoom?.id) return;

        state.rooms = state.rooms.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room,
        );

        if (state.selectedRoom?.id === updatedRoom.id) {
          state.selectedRoom = updatedRoom;
        }
      })

      .addCase(deactivateRoom.fulfilled, (state, action) => {
        const updatedRoom = action.payload?.room || action.payload;

        if (!updatedRoom?.id) return;

        state.rooms = state.rooms.map((room) =>
          room.id === updatedRoom.id ? updatedRoom : room,
        );
      });
  },
});

export const { clearSelectedRoom, clearRoomsError } = roomsSlice.actions;

export default roomsSlice.reducer;
