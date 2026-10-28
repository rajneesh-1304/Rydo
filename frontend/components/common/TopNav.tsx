"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HistoryIcon from "@mui/icons-material/History";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../login/header/header.module.scss";

export const TopNav: React.FC = () => {
  const router = useRouter();
  const { appMode, setAppMode, userProfile, setIsLoggedIn } = useTaxii();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isCaptain = appMode === "driver";

  const toggleMode = () => {
    setAppMode(isCaptain ? "rider" : "driver");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAnchorEl(null);
    router.push("/");
  };

  return (
    <Box className={styles.header}>
      {/* Brand logo matching LoginHeader */}
      <Box className={styles["header-logo"]} onClick={() => router.push("/dashboard")}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "20px",
            letterSpacing: "-0.5px",
            color: "#000000",
          }}
        >
          Taxii
        </Typography>
        <span className={styles["captain-badge"]}>
          {isCaptain ? "Driver" : "Rider"}
        </span>
      </Box>

      {/* Buttons matching LoginHeader */}
      <Box className={styles["header-btns"]}>
        <Button
          className={styles["role-switch-btn"]}
          onClick={() => router.push("/profile")}
        >
          {isCaptain ? "Driver Profile" : "My Bookings"}
        </Button>

        <Button className={styles["role-switch-btn"]} onClick={toggleMode}>
          {isCaptain ? "Rider Portal" : "Driver Portal"}
        </Button>

        <Button
          className={styles["header-btn"]}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px !important",
          }}
        >
          <Avatar
            src={userProfile.avatar}
            alt={userProfile.name}
            sx={{ width: 24, height: 24 }}
          />
          <span>{userProfile.name.split(" ")[0]}</span>
        </Button>
      </Box>

      {/* Profile menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: "12px",
              minWidth: 180,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              border: "1px solid #eef2f6",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            router.push("/profile");
          }}
          sx={{ fontSize: "13px", fontWeight: 500, py: 1 }}
        >
          {/* <PersonOutlineIcon fontSize="small" sx={{ mr: 1, color: "#64748b" }} /> */}
          View Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            router.push("/profile");
          }}
          sx={{ fontSize: "13px", fontWeight: 500, py: 1 }}
        >
          <HistoryIcon fontSize="small" sx={{ mr: 1, color: "#64748b" }} />
          {isCaptain ? "Trip Ledger" : "Ride History"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            toggleMode();
            setAnchorEl(null);
          }}
          sx={{ fontSize: "13px", fontWeight: 500, py: 1 }}
        >
          <SwapHorizIcon fontSize="small" sx={{ mr: 1, color: "#64748b" }} />
          Switch to {isCaptain ? "Rider" : "Driver"}
        </MenuItem>

        <Box sx={{ my: 0.5, borderTop: "1px solid #f1f5f9" }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            fontSize: "13px",
            fontWeight: 500,
            py: 1,
            color: "#ef4444",
          }}
        >
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Log Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TopNav;
