import { useEffect, useRef, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppNavbar from "../super_dashboard/components/AppNavbar";
import AppTheme from "../shared-theme/AppTheme";
import { Outlet } from "react-router-dom";
import "./styles/business.css";
import { Link, useLocation } from "react-router-dom";
import SideMenu from "./pages/Menu/SideMenu.jsx";

export default function BusinessDashboard(props) {
  const [open, setOpen] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onDocClick = (e) => {
      if (!navRef.current?.contains(e.target)) setOpen(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => setOpen(null), [location.pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (id) => setOpen((cur) => (cur === id ? null : id));

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <Box className="bd-wrap" sx={{ display: "flex" }}>
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

          <div className="bd-topbar border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
            <div
              ref={navRef}
              className="bd-topbar-inner mx-auto grid h-14 grid-cols-3 items-center px-4"
            >
              <div />

              <div className="flex items-center justify-center gap-8">
                <div className="relative">
                  <button
                    onClick={() => toggle("menu")}
                    aria-haspopup="menu"
                    aria-expanded={open === "menu"}
                    className="rounded-md px-4 py-2 text-[15px] md:text-base text-neutral-100 whitespace-nowrap hover:bg-neutral-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  >
                    Menu
                  </button>
                  {open === "menu" && (
                    <div className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 w-auto bg-transparent border-0 p-0 shadow-none">
                      {" "}
                      <nav className="py-2" role="menu" aria-label="Menu">
                        <Link
                          to="menu"
                          role="menuitem"
                          className="inline-flex items-center whitespace-nowrap rounded-full
              px-[2mm] py-[1mm] !bg-neutral-900/90
              !text-neutral-100 visited:!text-neutral-100 !no-underline
              hover:!bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600
              leading-none"
                        >
                          All Menus
                        </Link>
                      </nav>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggle("content")}
                    aria-haspopup="menu"
                    aria-expanded={open === "content"}
                    className="rounded-md px-4 py-2 text-[15px] md:text-base text-neutral-100 whitespace-nowrap hover:bg-neutral-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  >
                    Content Section
                  </button>
                  {open === "content" && (
                    <div className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 w-auto bg-transparent border-0 p-0 shadow-none">
                      {" "}
                      <nav className="py-2" role="menu" aria-label="Content">
                        <Link
                          to="content"
                          role="menuitem"
                          className="inline-flex items-center whitespace-nowrap rounded-full
              px-[2mm] py-[1mm] !bg-neutral-900/90
              !text-neutral-100 visited:!text-neutral-100 !no-underline
              hover:!bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600
              leading-none"
                        >
                          Browse All Content
                        </Link>
                      </nav>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggle("profile")}
                    aria-haspopup="menu"
                    aria-expanded={open === "profile"}
                    className="rounded-md px-4 py-2 text-[15px] md:text-base text-neutral-100 whitespace-nowrap hover:bg-neutral-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                  >
                    Profile
                  </button>
                  {open === "profile" && (
                    <div className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 w-auto bg-transparent border-0 p-0 shadow-none">
                      {" "}
                      <nav className="py-2" role="menu" aria-label="Profile">
                        <Link
                          to="profile"
                          role="menuitem"
                          className="inline-flex items-center whitespace-nowrap rounded-full
              px-[2mm] py-[1mm] !bg-neutral-900/90
              !text-neutral-100 visited:!text-neutral-100 !no-underline
              hover:!bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600
              leading-none"
                        >
                          Edit Profile
                        </Link>
                      </nav>
                    </div>
                  )}
                </div>
              </div>

              <div className="justify-self-end">
                <input
                  type="search"
                  placeholder="Search…"
                  className="hidden md:block w-auto rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                />
              </div>
            </div>
          </div>

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
