import { configureStore } from "@reduxjs/toolkit";
import rideReducer from "./slices/rideSlice";
import driverReducer from "./slices/driverSlice";
import locationReducer from "./slices/locationSlice";
import chatReducer from "./slices/chatSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    ride: rideReducer,
    driver: driverReducer,
    location: locationReducer,
    chat: chatReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

