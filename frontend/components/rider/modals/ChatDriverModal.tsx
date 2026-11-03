"use client";

import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import styles from "../RiderExperience.module.scss";

type ChatDriverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
};

export const ChatDriverModal: React.FC<ChatDriverModalProps> = ({
  isOpen,
  onClose,
  driverName,
}) => {
  const [chatInput, setChatInput] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    if (chatInput.trim()) {
      setChatInput("");
    }
    onClose();
  };

  return (
    <Box className={styles.modalOverlay} onClick={onClose}>
      <Box className={styles.chatModalCard} onClick={(e) => e.stopPropagation()}>
        <Typography component="h3" className={styles.chatTitle}>
          Chat with Captain {driverName}
        </Typography>

        <Box className={styles.chatMsgBubble}>
          <strong>{driverName}:</strong> Hi! I am arriving now. Please keep your 4-digit OTP ready!
        </Box>

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

        <Button type="button" className={styles.primaryBtn} onClick={handleSend}>
          Send Message
        </Button>
      </Box>
    </Box>
  );
};

export default ChatDriverModal;
