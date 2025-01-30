// store.ts
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state with meetingNumber and password
interface AppState {
  meetingData: {
    meetingNumber: string;
    password: string;
  };
}

const initialState: AppState = {
  meetingData: {
    meetingNumber: "",
    password: "",
  },
};

// Create a slice (a reducer with actions)
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setMeetingData: (
      state,
      action: PayloadAction<{ meetingNumber: string; password: string }>
    ) => {
      state.meetingData = action.payload;
    },
    resetMeetingData: (state) => {
      state.meetingData = { meetingNumber: "", password: "" };
    },
  },
});

// Export actions
export const { setMeetingData, resetMeetingData } = appSlice.actions;

// Create the store
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

// Export RootState type for TypeScript
export type RootState = ReturnType<typeof store.getState>;
