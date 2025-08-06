import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./logInSignUp/Login.jsx";
import SignUp from "./logInSignUp/SignUp.jsx";
import Dashboard from "../dashboard/Dashboard.jsx";
import { Box } from "@mui/material";

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Fix: Also allow `/` to show Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Box className="App" sx={{ height: "100vh", overflowY: "auto" }}>
                <Dashboard />
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