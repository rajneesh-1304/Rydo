"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import styles from "./header.module.scss";
import { AuthRole } from "../Login";

type LoginHeaderProps = {
  role: AuthRole;
  setRole: (role: AuthRole) => void;
};

const LoginHeader = ({ role, setRole }: LoginHeaderProps) => {
  const isCaptain = role === "captain";

  return (
    <Box component="header" className={styles.header}>
      <Box
        className={styles.headerLogo}
        onClick={() => setRole("user")}
        role="button"
        tabIndex={0}
      >
        <Typography component="span" className={styles.logoTitle}>
          Rydo
        </Typography>
        <Box component="span" className={styles.captainBadge}>
          {isCaptain ? "Driver" : "Rider"}
        </Box>
      </Box>

      <Box className={styles.headerBtns}>
        <Typography component="p" className={styles.headerText}>
          {isCaptain ? "Looking to book a ride instead?" : "Want to drive with Rydo?"}
        </Typography>

        <Button
          type="button"
          className={styles.roleSwitchBtn}
          onClick={() => setRole(isCaptain ? "user" : "captain")}
        >
          {isCaptain ? "Switch to Rider Portal" : "Switch to Driver Portal"}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginHeader;


