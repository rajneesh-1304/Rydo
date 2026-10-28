import UserDashboard from "@/components/dashboard/user-dashboard";
import React from "react";

const page = () => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      <UserDashboard />
    </div>
  );
};

export default page;