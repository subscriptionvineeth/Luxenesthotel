import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import logo from '../assets/logo.jpg';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [isAdminStatus, setIsAdminStatus] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const isAdminUser = await isAdmin(user.id);
        setIsAdminStatus(isAdminUser);
        console.log('Admin status for user:', user.id, 'is_admin:', isAdminUser);
      }
    };

    checkAdminStatus();
  }, [user, isAdmin]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAdminStatus(false);
      setIsProfileMenuOpen(false);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              to="/" 
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
            >
              <img 
                src={logo} 
                alt="Hotel Logo" 
                className="h-14 w-auto py-2 object-contain"
              />
            </Link>
            <nav className="ml-8 flex space-x-4 items-center">
              <Link
                to="/rooms"
                className="text-gray-600 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Rooms
              </Link>
              {user && (
                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Bookings
                </Link>
              )}
              {isAdminStatus && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm hidden sm:block">{user.email}</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </Link>
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Bookings
                      </Link>
                      {isAdminStatus && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}