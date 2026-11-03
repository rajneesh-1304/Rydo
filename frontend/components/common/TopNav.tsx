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
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "./TopNav.module.scss";

export const TopNav: React.FC = () => {
  const router = useRouter();
  const { appMode, userProfile, setIsLoggedIn } = useTaxii();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isCaptain = appMode === "driver";

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAnchorEl(null);
    router.push("/");
  };

  return (
    <Box className={styles.header}>
      <Box className={styles.headerLogo} onClick={() => router.push("/dashboard")}>
        <Typography className={styles.brandName}>
          Taxii
        </Typography>
        <span className={styles.roleBadge}>
          {isCaptain ? "Driver" : "Rider"}
        </span>
      </Box>

      <Box className={styles.headerBtns}>
        <Button
          className={styles.roleSwitchBtn}
          onClick={() => router.push("/profile")}
        >
          {isCaptain ? "Driver Profile" : "My Bookings"}
        </Button>

        <Button
          className={styles.userBtn}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar
            src={userProfile.avatar}
            alt={userProfile.name}
            sx={{ width: 24, height: 24 }}
          />
          <span>{userProfile.name.split(" ")[0]}</span>
        </Button>
      </Box>

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
          {isCaptain ? "View Driver Profile" : "View Profile"}
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
