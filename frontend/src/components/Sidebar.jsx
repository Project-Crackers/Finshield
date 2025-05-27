import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaMoneyBillWave,
  FaLink,
  FaBell,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import React from "react";
import { useSelector } from "react-redux";
import finLogo from "/public/finlogo.png"; // Import the logo properly

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get user role, handling different user object structures
  const getUserRole = () => {
    if (!user) return null;
    return user.role || (user.user && user.user.role);
  };

  const userRole = getUserRole();

  return (
    <div className="relative sidebar-container">
      {/* Sidebar with hover effect */}
      <div className="fixed top-0 left-0 z-10 w-16 h-screen transition-all duration-300 ease-in-out sidebar bg-base-300 hover:w-64 group">
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center p-4">
            <div className="overflow-hidden text-xl font-bold whitespace-nowrap text-primary">
              <img src={finLogo} alt="FinShield Logo" className="w-8 h-8" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 mt-6">
            <ul className="px-2 space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive("/dashboard") || isActive("/")
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <FaHome className="h-5 w-5 min-w-[20px]" />
                  <span className="overflow-hidden ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Dashboard
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/expenses"
                  className={`flex items-center p-3 rounded-lg transition-colors ${ isActive("/expenses")
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <FaMoneyBillWave className="h-5 w-5 min-w-[20px]" />
                  <span className="overflow-hidden ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Expenses
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/incomes"
                  className={`flex items-center p-3 rounded-lg transition-colors ${ isActive("/incomes")
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <FaChartLine  className="h-5 w-5 min-w-[20px]" />
                  <span className="overflow-hidden ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Incomes
                  </span>
                </Link>
              </li>

              {/* Only show blockchain view to Admin and Manager */}
              {(userRole === "Admin" || userRole === "Manager") && (
                <li>
                  <Link
                    to="/blockchain"
                    className={`flex items-center p-3 rounded-lg transition-colors ${ isActive("/blockchain")
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-200"
                    }`}
                  >
                    <FaLink className="h-5 w-5 min-w-[20px]" />
                    <span className="overflow-hidden ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Blockchain View
                    </span>
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/notifications"
                  className={`flex items-center p-3 rounded-lg transition-colors ${ isActive("/notifications")
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <FaBell className="h-5 w-5 min-w-[20px]" />
                  <span className="overflow-hidden ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Notifications
                  </span>
                </Link>
              </li>

              {/* Admin-only User Management */}
              {userRole === "Admin" && (
                <li>
                  <Link
                    to="/admin/users"
                    className={`flex items-center p-3 rounded-lg transition-colors ${ isActive("/admin/users")
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-200"
                    }`}
                  >
                    <FaUsers className="h-5 w-5 min-w-[20px]" />
                    <span className="overflow-hidden ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      User Management
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
