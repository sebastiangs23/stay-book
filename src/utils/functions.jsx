import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getStoredUser } from "../utils/utils";

export function RoleRoute({ children, allowedRoles }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export function PlaceholderPage({ title }) {
  return (
    <div className="pb-24 md:pb-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-500">
          This page will be implemented in the next step.
        </p>
      </div>
    </div>
  );
}
