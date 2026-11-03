"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage } from "@/store/slices/chatSlice";
import { socketService } from "@/services/socketService";
import styles from "../RiderExperience.module.scss";

type ChatDriverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
};

const QUICK_CHIPS = [
  "I am at the gate",
  "OTP is ready",
  "Coming in 1 minute",
  "Where are you stopped?",
];

export const ChatDriverModal: React.FC<ChatDriverModalProps> = ({
  isOpen,
  onClose,
  driverName,
}) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);
  const rideId = useAppSelector((state) => state.ride.rideId);
  const riderProfile = useAppSelector((state) => state.user.riderProfile);

  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg = {
      id: `msg-${Date.now()}`,
      rideId,
      sender: riderProfile.name,
      senderRole: "rider" as const,
      text,
      time: timeStr,
    };

    // 1. Redux
    dispatch(addMessage(newMsg));

    // 2. WebSocket
    socketService.sendMessage({
      rideId,
      senderId: "u-rajneesh-38",
      senderName: riderProfile.name,
      senderRole: "rider",
      text,
    });

    setChatInput("");

    // Simulate driver reply after 2s for interactive feedback if alone in demo
    setTimeout(() => {
      const driverReply = {
        id: `msg-reply-${Date.now()}`,
        rideId,
        sender: driverName,
        senderRole: "driver" as const,
        text: "Got it! Reaching your pickup pin right away.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      dispatch(addMessage(driverReply));
    }, 2200);
  };

  return (
    <Box className={styles.modalOverlay} onClick={onClose}>
      <Box className={styles.chatModalCard} onClick={(e) => e.stopPropagation()}>
        <Box className={styles.chatHeader}>
          <Box>
            <Typography component="h3" className={styles.chatTitle}>
              Captain {driverName}
            </Typography>
            <Typography className={styles.chatSubtitle}>
              Live in-ride messaging • Real-time
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "#64748b" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className={styles.chatMessagesContainer} ref={scrollRef}>
          {messages.map((m) => {
            const isMe = m.senderRole === "rider";
            return (
              <Box
                key={m.id}
                className={`${styles.chatMessageRow} ${
                  isMe ? styles.chatRowRight : styles.chatRowLeft
                }`}
              >
                <Box
                  className={`${styles.chatBubble} ${
                    isMe ? styles.bubbleRider : styles.bubbleDriver
                  }`}
                >
                  <Typography className={styles.chatSenderLabel}>
                    {isMe ? "You" : driverName} • {m.time}
                  </Typography>
                  <Typography className={styles.chatText}>{m.text}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box className={styles.quickChipsRow}>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.quickChipBtn}
              onClick={() => handleSend(chip)}
            >
              {chip}
            </button>
          ))}
        </Box>

        <Box className={styles.chatInputRow}>
          <input
            type="text"
            placeholder="Type your message..."
            className={styles.chatInput}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button
            type="button"
            className={styles.sendMsgBtn}
            onClick={() => handleSend()}
            disabled={!chatInput.trim()}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatDriverModal;
