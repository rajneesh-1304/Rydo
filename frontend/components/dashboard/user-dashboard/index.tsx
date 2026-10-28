"use client";

import React from "react";
import { Box } from "@mui/material";
import TopNav from "@/components/common/TopNav";
import RiderExperience from "@/components/rider/RiderExperience";
import DriverExperience from "@/components/driver/DriverExperience";
import { useTaxii } from "@/context/TaxiiContext";

const UserDashboard = () => {
  const { appMode } = useTaxii();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
      }}
    >
      <TopNav />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {appMode === "rider" ? <RiderExperience /> : <DriverExperience />}
      </Box>
    </Box>
  );
};

export default UserDashboard;