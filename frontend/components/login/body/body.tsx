"use client";

import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTaxii } from "@/context/TaxiiContext";

import styles from "./body.module.scss";
import {
    captainLoginSchema,
    captainRegisterSchema,
    loginSchema,
    registerSchema,
} from "./body.schema";
import { AuthPage, AuthRole } from "../Login";

type Props = {
    role: AuthRole;
    setRole: (role: AuthRole) => void;
    page: AuthPage;
    setPage: (page: AuthPage) => void;
};

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type CaptainRegisterFormData = z.infer<typeof captainRegisterSchema>;
type CaptainLoginFormData = z.infer<typeof captainLoginSchema>;

const HeaderBody = ({ role, setRole, page, setPage }: Props) => {
    const [showPassword, setShowPassword] = useState(false);

    const isCaptain = role === "captain";
    const isRegister = page === "register";

    const userRegisterForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const userLoginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const captainRegisterForm = useForm<CaptainRegisterFormData>({
        resolver: zodResolver(captainRegisterSchema),
        defaultValues: {
            agreeTerms: false,
        },
    });

    const captainLoginForm = useForm<CaptainLoginFormData>({
        resolver: zodResolver(captainLoginSchema),
    });

    const router = useRouter();
    const { setIsLoggedIn, setAppMode } = useTaxii();

    const onUserRegisterSubmit = (data: RegisterFormData) => {
        console.log("Passenger Register:", data);
        setIsLoggedIn(true);
        setAppMode("rider");
        router.push("/dashboard");
    };

    const onUserLoginSubmit = (data: LoginFormData) => {
        console.log("Passenger Login:", data);
        setIsLoggedIn(true);
        setAppMode("rider");
        router.push("/dashboard");
    };

    const onCaptainRegisterSubmit = (data: CaptainRegisterFormData) => {
        console.log("Captain Register:", data);
        setIsLoggedIn(true);
        setAppMode("driver");
        router.push("/dashboard");
    };

    const onCaptainLoginSubmit = (data: CaptainLoginFormData) => {
        console.log("Captain Login:", data);
        setIsLoggedIn(true);
        setAppMode("driver");
        router.push("/dashboard");
    };

    // Hero banner text configurations
    const getHeroTitle = () => {
        if (isCaptain) {
            return isRegister ? "Drive when\nyou want" : "Welcome back,\nCaptain";
        }
        return isRegister ? "Ride anywhere,\nanytime" : "Welcome back,\nRider";
    };

    const getHeroSubtitle = () => {
        if (isCaptain) {
            return isRegister
                ? "Be your own boss. Get paid.\nMake a difference."
                : "Sign in to view your rides,\nearnings and daily trips.";
        }
        return isRegister
            ? "Request a ride in seconds.\nFast, safe, and reliable."
            : "Sign in to book rides,\ntrack trips and view your history.";
    };

    return (
        <Box className={styles.container}>
            <Box className={styles.splitCard}>
                {/* Left Side: Hero Banner */}
                <Box className={styles.heroBanner}>
                    <Box className={styles.brandRow}>
                        <Typography className={styles.brandName}>Rydo</Typography>
                        <Typography className={styles.brandRole}>
                            {isCaptain ? "Driver" : "Rider"}
                        </Typography>
                    </Box>

                    <Box className={styles.heroContent}>
                        <Typography className={styles.heroTitle}>
                            {getHeroTitle()}
                        </Typography>
                        <Typography className={styles.heroSubtitle}>
                            {getHeroSubtitle()}
                        </Typography>
                    </Box>

                    <Box className={styles.heroImageContainer}>
                        <Image
                            src="/driver-hero.jpg"
                            alt="Car illustration"
                            width={420}
                            height={250}
                            className={styles.heroImage}
                            priority
                        />
                    </Box>
                </Box>

                {/* Right Side: Form Area */}
                <Box className={styles.formArea}>
                    <Box className={styles.formHeader}>
                        <Typography className={styles.title}>
                            {isCaptain
                                ? isRegister
                                    ? "Create your driver account"
                                    : "Sign in to your driver account"
                                : isRegister
                                    ? "Create your rider account"
                                    : "Sign in to your account"}
                        </Typography>
                        <Typography className={styles.subtitle}>
                            {isRegister
                                ? "Fill in your details to get started with Rydo."
                                : "Enter your credentials to access your dashboard."}
                        </Typography>
                    </Box>

                    {/* 1. CAPTAIN REGISTER */}
                    {isCaptain && isRegister && (
                        <Box
                            component="form"
                            className={styles.form}
                            onSubmit={captainRegisterForm.handleSubmit(onCaptainRegisterSubmit)}
                        >
                            <Box className={styles.field}>
                                <Typography className={styles.label}>Full name</Typography>
                                <TextField
                                    size="small"
                                    placeholder="Enter your full name"
                                    className={styles.textfield}
                                    {...captainRegisterForm.register("fullName")}
                                    error={!!captainRegisterForm.formState.errors.fullName}
                                    helperText={captainRegisterForm.formState.errors.fullName?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Email address</Typography>
                                <TextField
                                    size="small"
                                    placeholder="you@example.com"
                                    className={styles.textfield}
                                    {...captainRegisterForm.register("email")}
                                    error={!!captainRegisterForm.formState.errors.email}
                                    helperText={captainRegisterForm.formState.errors.email?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MailIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Mobile number</Typography>
                                <TextField
                                    size="small"
                                    placeholder="+91 98765 43210"
                                    className={styles.textfield}
                                    {...captainRegisterForm.register("mobileNumber")}
                                    error={!!captainRegisterForm.formState.errors.mobileNumber}
                                    helperText={captainRegisterForm.formState.errors.mobileNumber?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneOutlinedIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Password</Typography>
                                <TextField
                                    size="small"
                                    placeholder="Create a password"
                                    type={showPassword ? "text" : "password"}
                                    className={styles.textfield}
                                    {...captainRegisterForm.register("password")}
                                    error={!!captainRegisterForm.formState.errors.password}
                                    helperText={captainRegisterForm.formState.errors.password?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOffIcon fontSize="small" />
                                                        ) : (
                                                            <VisibilityIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box>
                                <label className={styles.checkboxContainer}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        {...captainRegisterForm.register("agreeTerms")}
                                    />
                                    <span className={styles.checkboxText}>
                                        I agree to the Rydo Driver <span>Terms and Conditions</span> and{" "}
                                        <span>Privacy Policy</span>.
                                    </span>
                                </label>
                                {captainRegisterForm.formState.errors.agreeTerms && (
                                    <Typography color="error" variant="caption" sx={{ display: "block", mt: 0.5 }}>
                                        {captainRegisterForm.formState.errors.agreeTerms.message}
                                    </Typography>
                                )}
                            </Box>

                            <Button
                                className={styles.submitBtn}
                                type="submit"
                                fullWidth
                                variant="contained"
                            >
                                <span>Create Account</span>
                                <ArrowForwardIcon fontSize="small" />
                            </Button>
                        </Box>
                    )}

                    {/* 2. CAPTAIN LOGIN */}
                    {isCaptain && !isRegister && (
                        <Box
                            component="form"
                            className={styles.form}
                            onSubmit={captainLoginForm.handleSubmit(onCaptainLoginSubmit)}
                        >
                            <Box className={styles.field}>
                                <Typography className={styles.label}>Email address</Typography>
                                <TextField
                                    size="small"
                                    placeholder="you@example.com"
                                    className={styles.textfield}
                                    {...captainLoginForm.register("email")}
                                    error={!!captainLoginForm.formState.errors.email}
                                    helperText={captainLoginForm.formState.errors.email?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MailIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Password</Typography>
                                <TextField
                                    size="small"
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    className={styles.textfield}
                                    {...captainLoginForm.register("password")}
                                    error={!!captainLoginForm.formState.errors.password}
                                    helperText={captainLoginForm.formState.errors.password?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOffIcon fontSize="small" />
                                                        ) : (
                                                            <VisibilityIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Button
                                className={styles.submitBtn}
                                type="submit"
                                fullWidth
                                variant="contained"
                            >
                                <span>Sign In</span>
                                <ArrowForwardIcon fontSize="small" />
                            </Button>
                        </Box>
                    )}

                    {/* 3. PASSENGER REGISTER */}
                    {!isCaptain && isRegister && (
                        <Box
                            component="form"
                            className={styles.form}
                            onSubmit={userRegisterForm.handleSubmit(onUserRegisterSubmit)}
                        >
                            <Box className={styles.field}>
                                <Typography className={styles.label}>Full name</Typography>
                                <TextField
                                    size="small"
                                    placeholder="Enter your full name"
                                    className={styles.textfield}
                                    {...userRegisterForm.register("fullName")}
                                    error={!!userRegisterForm.formState.errors.fullName}
                                    helperText={userRegisterForm.formState.errors.fullName?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Email address</Typography>
                                <TextField
                                    size="small"
                                    placeholder="you@example.com"
                                    className={styles.textfield}
                                    {...userRegisterForm.register("email")}
                                    error={!!userRegisterForm.formState.errors.email}
                                    helperText={userRegisterForm.formState.errors.email?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MailIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Mobile number (Optional)</Typography>
                                <TextField
                                    size="small"
                                    placeholder="+91 98765 43210"
                                    className={styles.textfield}
                                    {...userRegisterForm.register("mobileNumber")}
                                    error={!!userRegisterForm.formState.errors.mobileNumber}
                                    helperText={userRegisterForm.formState.errors.mobileNumber?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneOutlinedIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Password</Typography>
                                <TextField
                                    size="small"
                                    placeholder="Create a password"
                                    type={showPassword ? "text" : "password"}
                                    className={styles.textfield}
                                    {...userRegisterForm.register("password")}
                                    error={!!userRegisterForm.formState.errors.password}
                                    helperText={userRegisterForm.formState.errors.password?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOffIcon fontSize="small" />
                                                        ) : (
                                                            <VisibilityIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Button
                                className={styles.submitBtn}
                                type="submit"
                                fullWidth
                                variant="contained"
                            >
                                <span>Create Account</span>
                                <ArrowForwardIcon fontSize="small" />
                            </Button>
                        </Box>
                    )}

                    {/* 4. PASSENGER LOGIN */}
                    {!isCaptain && !isRegister && (
                        <Box
                            component="form"
                            className={styles.form}
                            onSubmit={userLoginForm.handleSubmit(onUserLoginSubmit)}
                        >
                            <Box className={styles.field}>
                                <Typography className={styles.label}>Email address</Typography>
                                <TextField
                                    size="small"
                                    placeholder="you@example.com"
                                    className={styles.textfield}
                                    {...userLoginForm.register("email")}
                                    error={!!userLoginForm.formState.errors.email}
                                    helperText={userLoginForm.formState.errors.email?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MailIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Box className={styles.field}>
                                <Typography className={styles.label}>Password</Typography>
                                <TextField
                                    size="small"
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    className={styles.textfield}
                                    {...userLoginForm.register("password")}
                                    error={!!userLoginForm.formState.errors.password}
                                    helperText={userLoginForm.formState.errors.password?.message}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon className={styles.inputIcon} fontSize="small" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <VisibilityOffIcon fontSize="small" />
                                                        ) : (
                                                            <VisibilityIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>

                            <Button
                                className={styles.submitBtn}
                                type="submit"
                                fullWidth
                                variant="contained"
                            >
                                <span>Sign In</span>
                                <ArrowForwardIcon fontSize="small" />
                            </Button>
                        </Box>
                    )}

                    {/* Divider */}
                    <Box className={styles.divider}>
                        <Typography className={styles.dividerText}>OR</Typography>
                    </Box>

                    {/* Google Button */}
                    <Button className={styles.googleBtn} fullWidth>
                        <Image
                            src="/google.svg"
                            alt="Google"
                            width={18}
                            height={18}
                        />
                        <Typography className={styles.googleBtnText}>
                            Continue with Google
                        </Typography>
                    </Button>

                    {/* Footer Navigation */}
                    <Box className={styles.footer}>
                        <Typography className={styles.footerLink}>
                            {isRegister ? "Already have an account?" : "Don't have an account?"}
                            <button
                                type="button"
                                onClick={() => setPage(isRegister ? "login" : "register")}
                            >
                                {isRegister ? "Sign in" : "Sign up"}
                            </button>
                        </Typography>

                        <button
                            type="button"
                            className={styles.roleToggleLink}
                            onClick={() => {
                                setRole(isCaptain ? "user" : "captain");
                                setPage(isRegister ? "register" : "login");
                            }}
                        >
                            {isCaptain
                                ? "Looking to ride instead? Join as a passenger"
                                : "Looking to drive instead? Sign in as Captain"}
                        </button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default HeaderBody;