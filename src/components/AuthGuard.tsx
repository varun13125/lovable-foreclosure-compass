
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthGuard() {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-law-teal" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Special route permissions
  if (location.pathname === '/master-admin' && authState.user.role !== 'system_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated, render the protected route
  return <Outlet />;
}
