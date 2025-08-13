import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import "../styles/user.css";
import TouchLogo from "@/assets/TouchLogo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function UserHeader() {
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
          <span className="ud-brand-text">Touch</span>
        </Link>

        <nav className="ud-iconbar  backgro ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <AccountCircleIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/user_dashboard/settings" aria-label="Settings">
            <Settings size={22} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
