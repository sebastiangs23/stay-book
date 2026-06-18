import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import roomsReducer from "../store/slices/roomsSlice";
import reservationsReducer from "../store/slices/reservationsSlice";
import submodulesReducer from "../store/slices/subModulesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    reservations: reservationsReducer,
    submodules: submodulesReducer,
  },
});
