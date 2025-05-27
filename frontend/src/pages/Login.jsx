import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess || user) {
      navigate('/dashboard');
    }
    
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    const userData = {
      email,
      password,
    };
    
    try {
      // Dispatch login action
      await dispatch(login(userData)).unwrap();
      //navigate('/dashboard');
    } catch (error) {
      // Handle error
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex justify-center items-center px-4 min-h-screen bg-base-200">
      <div className="overflow-hidden w-full max-w-md rounded-lg shadow-xl bg-base-100">
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">FinShield</h1>
            <p className="mt-2 text-base-content/70">Sign in to your account</p>
          </div>
          
          <form onSubmit={onSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FaUser className="w-5 h-5 text-base-content/50" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    className="block py-3 pr-3 pl-10 w-full rounded-md border shadow-sm border-base-300 focus:ring-primary focus:border-primary bg-base-100"
                    placeholder="you@example.com"
                    required
                  />
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
                    onChange={onChange}
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
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
