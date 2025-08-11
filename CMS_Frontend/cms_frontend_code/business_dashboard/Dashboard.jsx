import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppNavbar from "../super_dashboard/components/AppNavbar";
import AppTheme from "../shared-theme/AppTheme";
import { Outlet } from "react-router-dom";
import "./styles/business.css";
import { Link } from "react-router-dom";

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

      {/* Make the outer shell take the full viewport width/height */}
      <Box
        className="bd-wrap"
        sx={{ display: "flex", minHeight: "100vh", width: "100%" }}
      >
        <Box
          component="main"
          className="bd-scroll"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%", // <<< important
            alignItems: "stretch", // <<< important
          }}
        >
          <AppNavbar />

          {/* Top nav (optional) */}
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

          {/* Page content */}
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
