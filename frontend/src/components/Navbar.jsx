import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { getNotifications, markAsRead, markAllAsRead } from '../features/notifications/notificationSlice';
import { FaBell, FaUser, FaBars, FaMoon, FaSun, FaEnvelope, FaIdCard, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, toggleTheme, theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  
  useEffect(() => {
    // Fetch notifications when component mounts
    dispatch(getNotifications());
    
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(() => {
      dispatch(getNotifications());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };
  
  
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    
    // Check if name is directly on user object or nested
    const userName = user.name || (user.user && user.user.name) || '';
    
    if (!userName) return 'U';
    
    return userName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to safely access user properties
  const getUserProperty = (property) => {
    if (!user) return null;
    
    // Try to access property directly from user object
    if (user[property]) return user[property];
    
    // If not found, check if it's nested in a user property
    if (user.user && user.user[property]) return user.user[property];
    
    return null;
  };

  // Log user data for debugging
  useEffect(() => {
    console.log('Current user data:', user);
  }, [user]);

  return (
    <nav className="px-4 py-3 border-b bg-base-200 border-base-300 md:px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-base-content hover:bg-base-300 focus:outline-none"
          >
           
          </button>
          <h1 className="hidden overflow-hidden ml-4 text-2xl font-bold text-blue-700 whitespace-nowrap md:block text-primary">FinShield</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-base-300 focus:outline-none"
          >
            {theme === 'dark' ? (
              <FaSun className="w-5 h-5" />
            ) : (
              <FaMoon className="w-5 h-5" />
            )}
          </button>
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full hover:bg-base-300 focus:outline-none"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="inline-flex absolute top-0 right-0 justify-center items-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full transform translate-x-1/2 -translate-y-1/2 bg-error">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border shadow-lg bg-base-100 border-base-300">
                <div className="flex justify-between items-center p-3 border-b border-base-300">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => dispatch(markAllAsRead())}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-96">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification._id}
                        className={`p-3 border-b border-base-300 hover:bg-base-200 cursor-pointer ${!notification.read ? 'bg-base-200' : ''}`}
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="mt-1 text-xs text-base-content/70">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-center text-base-content/70">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 text-center border-t border-base-300">
                  <Link 
                    to="/notifications" 
                    className="text-xs text-primary hover:underline"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary text-primary-content">
                {getUserProperty('profileImage') ? (
                  <img 
                    src={getUserProperty('profileImage')} 
                    alt={getUserProperty('name') || 'User'} 
                    className="object-cover w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-sm font-semibold">{getUserInitials()}</span>
                )}
              </div>
              <span className="hidden font-medium md:block">{getUserProperty('name') || 'User'}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-md border shadow-lg bg-base-100 border-base-300">
                {/* User Info Section */}
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex justify-center items-center w-14 h-14 rounded-full bg-primary text-primary-content">
                      {getUserProperty('profileImage') ? (
                        <img 
                          src={getUserProperty('profileImage')} 
                          alt={getUserProperty('name') || 'User'} 
                          className="object-cover w-14 h-14 rounded-full"
                        />
                      ) : (
                        <span className="text-xl font-semibold">{getUserInitials()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold">{getUserProperty('name') || 'User'}</p>
                      <div className="flex items-center mt-1">
                        <FaEnvelope className="mr-1 w-3 h-3 text-base-content/70" />
                        <span className="text-xs truncate text-base-content/70">{getUserProperty('email') || 'user@example.com'}</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                          <FaIdCard className="mr-1 w-3 h-3" />
                          {getUserProperty('role') || 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu Options */}
                <div>
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 text-sm transition-colors hover:bg-base-200"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaUser className="mr-3 w-4 h-4 text-primary" />
                    <span>View & Edit Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-4 py-3 w-full text-sm text-left transition-colors text-error hover:bg-base-200"
                  >
                    <FaSignOutAlt className="mr-3 w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;