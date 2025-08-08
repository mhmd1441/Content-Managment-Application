import React from "react";
import Login from "./logInSignUp/Login.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./logInSignUp/SignUp.jsx";
import SuperDashboard from "../super_dashboard/Dashboard.jsx";
import BusinessDashboard from "../business_dashboard/Dashboard.jsx";
import UserDashboard from "../user_dashboard/Dashboard.jsx";
import { Box } from "@mui/material";
import MainGrid from "../super_dashboard/components/MainGrid.jsx";
import MenuList from "../super_dashboard/menuComponents.jsx";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Fix: Also allow `/` to show Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/super_dashboard"
          element={
            <ProtectedRoute>
              <Box className="App" sx={{ height: "100vh", overflowY: "auto" }}>
                <SuperDashboard />
              </Box>
            </ProtectedRoute>
          }
        >
          <Route index element={<MainGrid />} />
          <Route path="menu" element={<MenuList />} />
        </Route>

        <Route
          path="/business_dashboard"
          element={
            <ProtectedRoute>
              <Box className="App" sx={{ height: "100vh", overflowY: "auto" }}>
                <BusinessDashboard />
              </Box>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user_dashboard"
          element={
            <ProtectedRoute>
              <Box className="App" sx={{ height: "100vh", overflowY: "auto" }}>
                <UserDashboard />
              </Box>
            </ProtectedRoute>
          }
        />
        {/* Optional fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
