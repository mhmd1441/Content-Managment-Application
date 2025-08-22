import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
   if (loading) return null;                 // or a spinner
   if (!user) return <Navigate to="/login" replace />;
   return children ?? <Outlet />;            // <Outlet/> enables nesting
 }