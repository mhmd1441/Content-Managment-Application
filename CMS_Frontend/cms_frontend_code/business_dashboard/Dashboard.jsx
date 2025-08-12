import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppNavbar from "../super_dashboard/components/AppNavbar";
import AppTheme from "../shared-theme/AppTheme";
import { Outlet } from "react-router-dom";
import "./styles/business.css";
import { Link } from "react-router-dom";
import SideMenu from "./pages/Menu/SideMenu.jsx";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function BusinessDashboard(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <Box
        className="bd-wrap"
        sx={{ display: "flex"}}
      >
        <SideMenu />
        <Box
          component="main"
          className="bd-scroll"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%",
            alignItems: "stretch",
          }}
        >
          <AppNavbar />

          <Box className="bd-topbar">
            <div className="bd-topbar-inner">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink asChild>
                        <Link to="/business_dashboard">All Menus</Link>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      Content Section
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink asChild>
                        <Link to="/business_dashboard/content">
                          Browse All Content
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Profile</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink asChild>
                        <Link to="/business_dashboard/profile">
                          Edit Profile
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              width: "100%",
              display: "block",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
