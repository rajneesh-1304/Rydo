"use client";

import { Box, Button, Typography } from '@mui/material';
import styles from './header.module.scss';
import { AuthRole, AuthPage } from '../Login';

type LoginHeaderProps = {
  role: AuthRole;
  setRole: (role: AuthRole) => void;
  page: AuthPage;
  setPage: (page: AuthPage) => void;
};

const LoginHeader = ({ role, setRole, page, setPage }: LoginHeaderProps) => {
  const isLoginPage = page === 'login';
  const isCaptain = role === 'captain';

  const userText = isLoginPage ? "Don't have an account?" : "Already have an account?";
  const captainText = isLoginPage ? "Don't have a driver account?" : "Already a driver?";
  const buttonText = isLoginPage ? 'Register' : 'Login';

  return (
    <Box className={styles.header}>
      <Box
        className={styles['header-logo']}
        onClick={() => {
          setRole('captain');
          setPage('register');
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', color: '#000000' }}>
          Rydo
        </Typography>
        <span className={styles['captain-badge']}>{isCaptain ? 'Driver' : 'Rider'}</span>
      </Box>

      <Box className={styles['header-btns']}>
        <Typography className={styles['header-text']}>
          {isCaptain ? captainText : userText}
        </Typography>

        <Button
          className={styles['header-btn']}
          onClick={() => setPage(isLoginPage ? "register" : "login")}
        >
          {buttonText}
        </Button>

        <Button
          className={styles['role-switch-btn']}
          onClick={() => {
            if (isCaptain) {
              setRole('user');
              setPage('login');
            } else {
              setRole('captain');
              setPage('register');
            }
          }}
        >
          {isCaptain ? 'Rider Portal' : 'Driver Portal'}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginHeader;
