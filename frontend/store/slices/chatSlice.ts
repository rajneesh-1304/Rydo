import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: string;
  rideId?: string;
  sender: string;
  senderRole: "rider" | "driver";
  text: string;
  time: string;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  unreadCount: number;
}

const initialState: ChatState = {
  isOpen: false,
  messages: [
    {
      id: "init-1",
      sender: "Amit Kumar",
      senderRole: "driver",
      text: "Hi! I am arriving now. Please keep your 4-digit OTP ready!",
      time: "10:42 AM",
    },
  ],
  unreadCount: 0,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
      if (action.payload) {
        state.unreadCount = 0;
      }
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      if (!state.isOpen) {
        state.unreadCount += 1;
      }
    },
    clearChat: (state) => {
      state.messages = [];
      state.unreadCount = 0;
    },
    markRead: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setChatOpen, addMessage, clearChat, markRead } = chatSlice.actions;

export default chatSlice.reducer;

