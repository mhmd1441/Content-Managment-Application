import React from "react";
import Login from "./logIn/Login.jsx";
import ContentSectionList from "../super_dashboard/components/contentSectionList.jsx";
import SignUp from "../super_dashboard/components/User/UserCreation.jsx";
import  SuperDashboard from "../super_dashboard/Dashboard.jsx";
import  UserDashboard from "../user_dashboard/Dashboard.jsx";
import  BusinessDashboard from "../business_dashboard/Dashboard.jsx";
import MainGrid from "../super_dashboard/components/MainGrid.jsx";
import MenuList from "../super_dashboard/components/Menu/MenuList.jsx";
import Department from "../super_dashboard/components/DepartmentList.jsx";
import Feedback from "../business_dashboard/pages/Menu/leftMenu/feedback.jsx";
import Settings from "../business_dashboard/pages/Menu/leftMenu/settings.jsx";
import About from "../business_dashboard/pages/Menu/leftMenu/about.jsx";
import AnalyticsDashboard from "../business_dashboard/Analytics.jsx";
import ProtectedRoute from "./auth/ProtectedRoute";
import BusinessMenus from "../business_dashboard/pages/Menu/BusinessMenus.jsx";
import BusinessMenuDetail from "../business_dashboard/pages/Menu/BusinessMenuDetail.jsx";
import BusinessContentList from "../business_dashboard/pages/Menu/BusinessContentList.jsx";
import BusinessUsers from "../business_dashboard/pages/User/UserList.jsx";
import User from "../super_dashboard/components/User/UserList.jsx";
import BusinessAllContent from "../business_dashboard/pages/ContentSection/AllContent.jsx";
import BusinessProfile from "../business_dashboard/pages/ProfileSection/Profile.jsx";
import UserHome from "../user_dashboard/pages/Home.jsx";
import AddContentSection from "../business_dashboard/pages/Creation/addContentSection.jsx";
import AddMenu from "../business_dashboard/pages/Creation/addMenu.jsx";
import { Routes, Route, Navigate } from "react-router-dom";



export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<ProtectedRoute />}>
        <Route
          path="/super_dashboard"
          element={
            <div className="App h-screen overflow-y-auto">
              <SuperDashboard />
            </div>
          }
        >
          <Route index element={<MainGrid />} />
          <Route path="menu" element={<MenuList />} />
          <Route path="content-section" element={<ContentSectionList />} />
          <Route path="department" element={<Department />} />
          <Route path="user" element={<User />} />
        </Route>

        <Route
          path="/business_dashboard"
          element={
            <div className="App h-screen overflow-y-auto">
              <BusinessDashboard />
            </div>
          }
        >
          <Route index element={<BusinessMenus />} />
          <Route path="analyticsDashboard" element={<AnalyticsDashboard />} />
          <Route path="addContentSection" element={<AddContentSection />} />
          <Route path="addMenu" element={<AddMenu />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="menu/:menuId" element={<BusinessMenuDetail />} />
          <Route path="menu/:menuId/child/:childId" element={<BusinessContentList />} />
          <Route path="users" element={<BusinessUsers />} />
          <Route path="content" element={<BusinessAllContent />} />
          <Route path="profile" element={<BusinessProfile />} />
        </Route>

        <Route
          path="/user_dashboard"
          element={
            <div className="App h-screen overflow-y-auto">
              <UserDashboard />
            </div>
          }
        >
          <Route index element={<UserHome />} />
        </Route>
      </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}