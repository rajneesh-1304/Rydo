"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import LoginHeader from "./header/header";
import HeaderBody from "./body/body";
import styles from "./login.module.scss";

export type AuthRole = "user" | "captain";

const Login = () => {
  const [role, setRole] = useState<AuthRole>("user");

  return (
    <Box className={styles.container}>
      <LoginHeader role={role} setRole={setRole} />
      <HeaderBody role={role} setRole={setRole} />
    </Box>
  );
};

export default Login;