"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BadgeIcon from "@mui/icons-material/Badge";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  BikeIcon,
  AutoIcon,
  MiniIcon,
  SedanIcon,
} from "../common/VehicleIcons";
import { useTaxii, BookingItem } from "@/context/TaxiiContext";
import styles from "./ProfileView.module.scss";

export const ProfileView: React.FC = () => {
  const router = useRouter();
  const {
    appMode,
    riderProfile,
    driverProfile,
    bookings,
    setSelectedCab,
    setPickupLocation,
    setDropoffLocation,
    setRiderStep,
    setRidesSearched,
    setIsLoggedIn,
  } = useTaxii();

  const isDriver = appMode === "driver";
  const [activeFilter, setActiveFilter] = useState<"All" | "Completed" | "Active">("All");

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Completed") return b.status === "Completed";
    if (activeFilter === "Active") return b.status === "In Progress";
    return true;
  });

  const getCabIcon = (type: string) => {
    switch (type) {
      case "Bike":
        return <BikeIcon size={22} />;
      case "Auto":
        return <AutoIcon size={22} />;
      case "Mini":
        return <MiniIcon size={24} />;
      case "Sedan":
      default:
        return <SedanIcon size={26} />;
    }
  };

  const handleRebook = (b: BookingItem) => {
    setSelectedCab(b.cabType);
    setPickupLocation(b.pickup);
    setDropoffLocation(b.dropoff);
    setRiderStep("booking");
    setRidesSearched(true);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.splitCard}>
        {isDriver ? (
          <>
            <Box className={styles.heroBanner}>
              <div>
                <div className={styles.profileTop}>
                  <Image
                    src={driverProfile.avatar}
                    alt={driverProfile.name}
                    width={76}
                    height={76}
                    className={styles.avatar}
                  />
                  <Typography className={styles.userName}>
                    {driverProfile.name}
                  </Typography>
                  <div className={styles.userRole}>
                    <span>★ {driverProfile.rating}</span>
                    <span>•</span>
                    <span className={styles.captainRoleLabel}>
                      Captain (Driver)
                    </span>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <div className={styles.statVal}>{driverProfile.totalRides}</div>
                    <div className={styles.statLbl}>Trips Completed</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statItem}>
                    <div className={styles.statVal}>{driverProfile.acceptanceRate}%</div>
                    <div className={styles.statLbl}>Acceptance</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statItem}>
                    <div className={`${styles.statVal} ${styles.statValGreen}`}>
                      ₹{driverProfile.totalEarnings}
                    </div>
                    <div className={styles.statLbl}>Total Earned</div>
                  </div>
                </div>

                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <DirectionsCarIcon fontSize="small" sx={{ color: "#64748b" }} />
                    <span>
                      {driverProfile.vehicleDetails} • {driverProfile.vehiclePlate}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <BadgeIcon fontSize="small" sx={{ color: "#64748b" }} />
                    <span>DL: {driverProfile.licenseNumber}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <AccountBalanceIcon fontSize="small" sx={{ color: "#10b981" }} />
                    <span>Payout: HDFC Bank **** 4812 (Verified)</span>
                  </div>

                  <div className={styles.infoItem}>
                    <PhoneIcon fontSize="small" sx={{ color: "#64748b" }} />
                    <span>{driverProfile.phone}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <EmailIcon fontSize="small" sx={{ color: "#64748b" }} />
                    <span>{driverProfile.email}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <VerifiedUserIcon fontSize="small" sx={{ color: "#10b981" }} />
                    <span className={styles.verifiedDocText}>
                      All Driver Documents Verified
                    </span>
                  </div>
                </div>
              </div>

              <Button className={styles.logoutBtn} onClick={handleLogout}>
                Log Out
              </Button>
            </Box>

            <Box className={styles.contentArea}>
              <div className={styles.headerRow}>
                <div>
                  <Typography className={styles.title}>
                    Driver Trip & Earnings Ledger
                  </Typography>
                  <Typography className={styles.subtitle}>
                    Showing all completed passenger trips and daily settlements
                  </Typography>
                </div>
              </div>

              <div className={styles.bookingsList}>
                {filteredBookings.map((b) => (
                  <div key={b.id} className={styles.bookingCard}>
                    <div className={styles.bookingTop}>
                      <div className={styles.cabBadge}>
                        {getCabIcon(b.cabType)}
                        <div>
                          <div className={styles.cabTypeTitle}>
                            {b.cabType} Trip Completed
                          </div>
                          <div className={styles.cabPlate}>
                            Passenger: Rajneesh K. • Vehicle: {b.vehicleModel}
                          </div>
                        </div>
                      </div>
                      <div className={styles.bookingFare}>+ ₹{b.price}</div>
                    </div>

                    <div className={styles.routeTimeline}>
                      <div className={styles.routeItem}>
                        <div className={styles.dotGreen} />
                        <strong>Pickup:</strong>
                        <span>{b.pickup}</span>
                      </div>
                      <div className={styles.routeItem}>
                        <div className={styles.dotRed} />
                        <strong>Drop:</strong>
                        <span>{b.dropoff}</span>
                      </div>
                    </div>

                    <div className={styles.bookingBottom}>
                      <div className={styles.bookingBottomMeta}>
                        <span className={styles.statusChip}>✓ Completed</span>
                        <span>{b.date} • {b.time}</span>
                        <span>• Paid via UPI</span>
                      </div>
                      <span className={styles.payoutCreditBadge}>
                        ✓ Credited to HDFC Bank
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Box>
          </>
        ) : (
          <>
            <Box className={styles.heroBanner}>
              <div>
                <div className={styles.profileTop}>
                  <Image
                    src={riderProfile.avatar}
                    alt={riderProfile.name}
                    width={76}
                    height={76}
                    className={styles.avatar}
                  />
                  <Typography className={styles.userName}>
                    {riderProfile.name}
                  </Typography>
                  <div className={styles.userRole}>
                    <span>★ {riderProfile.rating}</span>
                    <span>•</span>
                    <span className={styles.passengerRoleLabel}>
                      Verified Passenger
                    </span>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <div className={styles.statVal}>{riderProfile.totalRides}</div>
                    <div className={styles.statLbl}>Rides Taken</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statItem}>
                    <div className={styles.statVal}>{riderProfile.completionRate}%</div>
                    <div className={styles.statLbl}>On-Time Rate</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statItem}>
                    <div className={`${styles.statVal} ${styles.statValBlue}`}>
                      ₹{riderProfile.walletBalance}
                    </div>
                    <div className={styles.statLbl}>Taxii Wallet</div>
                  </div>
                </div>

                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <PhoneIcon fontSize="small" sx={{ color: "#64748b" }} />
                    <span>{riderProfile.phone}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <EmailIcon fontSize="small" sx={{ color: "#64748b" }} />
                    <span>{riderProfile.email}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <HomeIcon fontSize="small" sx={{ color: "#10b981" }} />
                    <span>Home: {riderProfile.savedPlaces[0].address}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <WorkIcon fontSize="small" sx={{ color: "#3b82f6" }} />
                    <span>Work: {riderProfile.savedPlaces[1].address}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <AccountBalanceWalletIcon fontSize="small" sx={{ color: "#f59e0b" }} />
                    <span>UPI • Google Pay (Active)</span>
                  </div>
                </div>
              </div>

              <Button className={styles.logoutBtn} onClick={handleLogout}>
                Log Out
              </Button>
            </Box>

            <Box className={styles.contentArea}>
              <div className={styles.headerRow}>
                <div>
                  <Typography className={styles.title}>
                    Your Ride History
                  </Typography>
                  <Typography className={styles.subtitle}>
                    View and manage all past trips booked with Taxii
                  </Typography>
                </div>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setRiderStep("booking");
                    setRidesSearched(false);
                    router.push("/dashboard");
                  }}
                  sx={{
                    color: "#000000",
                    borderColor: "#000000",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "12px",
                    "&:hover": {
                      borderColor: "#333333",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  Book New Ride
                </Button>
              </div>

              <div className={styles.filterTabs}>
                {(["All", "Completed", "Active"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`${styles.tabBtn} ${
                      activeFilter === filter ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter} {filter === "All" && `(${bookings.length})`}
                  </button>
                ))}
              </div>

              <div className={styles.bookingsList}>
                {filteredBookings.length === 0 ? (
                  <div className={styles.emptyStateMsg}>
                    No bookings found.
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div key={b.id} className={styles.bookingCard}>
                      <div className={styles.bookingTop}>
                        <div className={styles.cabBadge}>
                          {getCabIcon(b.cabType)}
                          <div>
                            <div className={styles.cabTypeTitle}>
                              {b.cabType} Ride
                            </div>
                            <div className={styles.cabPlate}>
                              Driver: {b.driverName} • {b.vehicleModel}
                            </div>
                          </div>
                        </div>
                        <div className={styles.bookingFare}>₹{b.price}</div>
                      </div>

                    <div className={styles.routeTimeline}>
                      <div className={styles.routeItem}>
                        <div className={styles.dotGreen} />
                        <strong>Pickup:</strong>
                        <span>{b.pickup}</span>
                      </div>
                      <div className={styles.routeItem}>
                        <div className={styles.dotRed} />
                        <strong>Drop:</strong>
                        <span>{b.dropoff}</span>
                      </div>
                    </div>

                    <div className={styles.bookingBottom}>
                      <div className={styles.bookingBottomMeta}>
                        <span className={styles.statusChip}>{b.status}</span>
                        <span>{b.date} • {b.time}</span>
                        <span>• {b.paymentMethod}</span>
                      </div>

                      <button
                        type="button"
                        className={styles.rebookBtn}
                        onClick={() => handleRebook(b)}
                      >
                        Book Again
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Box>
        </>
      )}
    </Box>
  </Box>
  );
};

export default ProfileView;
