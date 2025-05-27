/*
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
*/

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
