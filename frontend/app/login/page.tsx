"use client";

import React from "react";
import Login from "@/components/login/Login";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <Button
        onClick={() => router.push("/")}
        startIcon={<ArrowBackIcon />}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 100,
          color: "#1e293b",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(6px)",
          borderRadius: "20px",
          px: 2,
          py: 0.8,
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          "&:hover": {
            backgroundColor: "#ffffff",
          },
        }}
      >
        Back to Taxii
      </Button>
      <Login />
    </Box>
  );
}
