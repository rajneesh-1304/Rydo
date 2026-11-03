import React from "react";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box } from "@mui/material";
import Login from "@/components/login/Login";
import styles from "./login.module.scss";

export default function LoginPage() {
  return (
    <Box className={styles.wrapper}>
      <Link href="/" className={styles.backBtn}>
        <ArrowBackIcon fontSize="inherit" />
        <span>Back to Rydo</span>
      </Link>
      <Login />
    </Box>
  );
}


