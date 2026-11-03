import UserDashboard from "@/components/dashboard/user-dashboard";
import React from "react";
import styles from "./dashboard.module.scss";

const page = () => {
  return (
    <div className={styles.dashboardWrapper}>
      <UserDashboard />
    </div>
  );
};

export default page;