import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ toggleTheme, theme, children }) => {
  return (
    <div className="flex h-screen bg-base-200">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content - with left padding to prevent overlap */}
      <div className="flex-1 flex flex-col ml-16">
        <Navbar toggleTheme={toggleTheme} theme={theme} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;