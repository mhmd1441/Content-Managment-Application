import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppTheme from "../shared-theme/AppTheme";
import { AuthProvider } from "@/auth/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import ActivityTracker from "@/activity/ActivityTracker.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppTheme>
      <AuthProvider>
        <BrowserRouter>
          <ActivityTracker
            enabledPaths={[
              "/super_dashboard",
              "/business_dashboard",
              "/user_dashboard",
            ]}
            heartbeatMs={30_000}
          />
          <App />
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  </StrictMode>
);
