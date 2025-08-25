import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaSpinner } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'Employee',
  });

  const { name, email, password, password2, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // In the useEffect hook
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password,
        role,
      };

      dispatch(register(userData));
    }
  };

  return (
    <div className="flex justify-center items-center px-4 min-h-screen bg-base-200">
      <div className="overflow-hidden w-full max-w-md rounded-lg shadow-xl bg-base-100">
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">FinShield</h1>
            <p className="mt-2 text-base-content/70">Create a new account</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1 text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FaUser className="w-5 h-5 text-base-content/50" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    className="block py-3 pr-3 pl-10 w-full rounded-md border shadow-sm border-base-300 focus:ring-primary focus:border-primary bg-base-100"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FaEnvelope className="w-5 h-5 text-base-content/50" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className="block py-3 pr-3 pl-10 w-full rounded-md border shadow-sm border-base-300 focus:ring-primary focus:border-primary bg-base-100"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block mb-1 text-sm font-medium">
                  Role
                </label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FaUserTag className="w-5 h-5 text-base-content/50" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={handleChange}
                    className="block py-3 pr-3 pl-10 w-full rounded-md border shadow-sm border-base-300 focus:ring-primary focus:border-primary bg-base-100"
                    required
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-1 text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FaLock className="w-5 h-5 text-base-content/50" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    className="block py-3 pr-3 pl-10 w-full rounded-md border shadow-sm border-base-300 focus:ring-primary focus:border-primary bg-base-100"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password2" className="block mb-1 text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FaLock className="w-5 h-5 text-base-content/50" />
                  </div>
                  <input
                    type="password"
                    id="password2"
                    name="password2"
                    value={password2}
                    onChange={handleChange}
                    className="block py-3 pr-3 pl-10 w-full rounded-md border shadow-sm border-base-300 focus:ring-primary focus:border-primary bg-base-100"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="flex justify-center px-4 py-3 w-full text-white rounded-md border border-transparent shadow-sm bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="mr-2 w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
