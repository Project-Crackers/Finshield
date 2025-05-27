import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <div className="flex justify-center items-center px-4 min-h-screen bg-base-200">
      <div className="overflow-hidden p-8 w-full max-w-md text-center rounded-lg shadow-xl bg-base-100">
        <FaExclamationTriangle className="mx-auto mb-4 text-6xl text-warning" />
        <h1 className="mb-4 text-4xl font-bold">403</h1>
        <h2 className="mb-4 text-2xl font-semibold">Access Denied</h2>
        <p className="mb-6 text-base-content/70">
          You don't have permission to access this page.
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

export default Unauthorized;