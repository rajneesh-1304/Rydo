"use client";

import React from "react";
import { Box } from "@mui/material";
import TopNav from "@/components/common/TopNav";
import RiderExperience from "@/components/rider/RiderExperience";
import DriverExperience from "@/components/driver/DriverExperience";
import { useTaxii } from "@/context/TaxiiContext";

import styles from "./UserDashboard.module.scss";

const UserDashboard = () => {
  const { appMode } = useTaxii();

  return (
    <Box className={styles.dashboardContainer}>
      <TopNav />
      <Box className={styles.contentWrapper}>
        {appMode === "rider" ? <RiderExperience /> : <DriverExperience />}
      </Box>
    </Box>
  );
};

export default UserDashboard;