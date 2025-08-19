import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings, User } from "lucide-react"; // ✅ icons only
import "../styles/user.css";
import TouchLogo from "@/assets/TouchLogo.png";

export default function UserHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // close on outside click or ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="ud-topbar">
      <div className="ud-topbar-inner">
        <Link to="/user_dashboard" className="ud-brand" aria-label="touch">
          <img
            src={TouchLogo}
            alt="Touch"
            className="ud-brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <br/>
          <span className="ud-brand-text">Touch</span>
        </Link>

        <nav
          className="ud-iconbar ml-auto flex items-center gap-4"
          ref={menuRef}
        >
          <div className="ud-dropdown">
            <button
              id="user-menu-trigger"
              className="ud-profile-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls="user-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <User className="ud-profile-icon w-6 h-6" aria-hidden="true" />
              <span className="sr-only">Open user menu</span>
            </button>

            {open && (
              <div
                id="user-menu"
                role="menu"
                aria-labelledby="user-menu-trigger"
                className="ud-menu"
              >
                <div className="ud-menu-label" role="presentation">
                  My Account
                </div>
                <hr className="ud-menu-sep" />
                <Link
                  to="/user_dashboard/profile"
                  role="menuitem"
                  tabIndex={0}
                  className="ud-menu-item"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
          <br />
          <br />
          <Link to="/user_dashboard/settings" aria-label="Settings">
            <Settings className="w-[22px] h-[22px]" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
