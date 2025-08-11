import React from "react";
import Login from "./logInSignUp/Login.jsx";
import ContentSectionList from "../super_dashboard/components/contentSectionList.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "../super_dashboard/components/User/UserCreation.jsx";
import SuperDashboard from "../super_dashboard/Dashboard.jsx";
import BusinessDashboard from "../business_dashboard/Dashboard.jsx";
import UserDashboard from "../user_dashboard/Dashboard.jsx";
import { Box } from "@mui/material";
import MainGrid from "../super_dashboard/components/MainGrid.jsx";
import MenuList from "../super_dashboard/components/MenuList.jsx";
import Department from "../super_dashboard/components/DepartmentList.jsx";
import User from "../super_dashboard/components/User/UserList.jsx";
import Feedback from "../super_dashboard/components/feedback.jsx";
import Settings from "../super_dashboard/components/settings.jsx";
import About from "../super_dashboard/components/about.jsx";
import ProtectedRoute from "./auth/ProtectedRoute";
import BusinessMenus from "../business_dashboard/pages/Menu/BusinessMenus.jsx";
import BusinessMenuDetail from "../business_dashboard/pages/Menu/BusinessMenuDetail.jsx";
import BusinessContentList from "../business_dashboard/pages/Menu/BusinessContentList.jsx";
import BusinessUsers from "../business_dashboard/pages/User/UserList.jsx";
import BusinessAllContent from "../business_dashboard/pages/ContentSection/AllContent.jsx";
import BusinessProfile from "../business_dashboard/pages/ProfileSection/Profile.jsx";

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
          <Route path="content-section" element={<ContentSectionList />} />
          <Route path="department" element={<Department />} />
          <Route path="user" element={<User />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="feedback" element={<Feedback />} />
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
        >
          <Route index element={<BusinessMenus />} />
          <Route path="menu/:menuId" element={<BusinessMenuDetail />} />
          <Route
            path="menu/:menuId/child/:childId"
            element={<BusinessContentList />}
          />
          <Route path="users" element={<BusinessUsers />} />
          <Route path="content" element={<BusinessAllContent />} />
          <Route path="profile" element={<BusinessProfile />} />
        </Route>

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
