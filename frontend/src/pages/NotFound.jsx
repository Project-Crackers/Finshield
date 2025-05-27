import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="max-w-md w-full bg-base-100 rounded-lg shadow-xl overflow-hidden text-center p-8">
        <FaExclamationTriangle className="text-warning text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-base-content/70 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/dashboard" 
          className="btn btn-primary"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;