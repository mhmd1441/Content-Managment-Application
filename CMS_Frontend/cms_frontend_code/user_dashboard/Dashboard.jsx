import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import UserHeader from "./components/UserHeader";
import "./styles/user.css";

export default function Dashboard() {
  return (
    <div className="user-theme">
      <CssBaseline enableColorScheme />
      <Box className="ud-wrap">
        <UserHeader />
        <main className="ud-main">
          <Outlet />
        </main>
      </Box>
    </div>
  );
}
