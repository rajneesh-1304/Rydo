"use client";

import { Box } from '@mui/material';
import React, { useState } from 'react';
import LoginHeader from './header/header';
import HeaderBody from './body/body';
import styles from './login.module.scss';

export type AuthRole = "user" | "captain";
export type AuthPage = "login" | "register";

const Login = () => {
  const [role, setRole] = useState<AuthRole>("captain");
  const [page, setPage] = useState<AuthPage>("register");

  return (
    <Box className={styles.container}>
      <LoginHeader role={role} setRole={setRole} page={page} setPage={setPage} />
      <HeaderBody role={role} setRole={setRole} page={page} setPage={setPage} />
    </Box>
  );
};

export default Login;