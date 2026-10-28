"use client";

import React from "react";
import TopNav from "@/components/common/TopNav";
import ProfileView from "@/components/profile/ProfileView";
import { Box } from "@mui/material";

export default function ProfilePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
      }}
    >
      <TopNav />
      <Box sx={{ flex: 1 }}>
        <ProfileView />
      </Box>
    </Box>
  );
}
