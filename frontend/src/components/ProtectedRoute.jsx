/*import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  
  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If allowedRoles is provided, check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If user is logged in and has required role (or no role check), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
*/

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  // Extract role safely
  const role = user?.role || user?.user?.role;

  // Redirect unauthenticated users
  if (!user) return <Navigate to="/login" replace />;

  // Redirect unauthorized users
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
