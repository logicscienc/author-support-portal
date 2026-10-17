
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { homePathFor } from "../utils/navigation";

export default function ProtectedRoute({ role }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  // The login page lives at "/"
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // Wrong role? Send them to their own dashboard.
  if (role && user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}