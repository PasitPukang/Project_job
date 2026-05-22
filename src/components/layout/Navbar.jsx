import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  
  // Read user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-20 flex items-center justify-between">
        {/* Left Section: Logo & Links */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <div className="bg-[#2B5292] text-white font-bold text-2xl px-4 py-1.5 rounded-xl flex items-center border-[3px] border-[#93c5fd]">
              <span>หางาน</span>
              <span className="text-[#93c5fd]">.com</span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-6 text-gray-700 font-medium text-[15px]">
            <Link to="/" className="hover:text-[#2B5292]">{t('home')}</Link>
            <Link to="/search" className="hover:text-[#2B5292]">{t('findJobs')}</Link>
            <Link to="#" className="hover:text-[#2B5292]">{t('aboutCompany')}</Link>
            {user?.role === 'employer' && (
               <Link to="/employer/dashboard" className="text-[#2B5292] font-bold">{t('dashboard')}</Link>
            )}
          </div>
        </div>

        {/* Right Section: Auth & Language */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-1.5 cursor-pointer hover:bg-gray-50">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white">
                  <User size={14} />
                </div>
                <span className="text-gray-700 font-medium text-sm">{user.name || user.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#4a6b9c] hover:bg-[#3a5885] text-white px-5 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <span>{t('login')}</span>
                <ChevronDown size={16} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-[#4a6b9c] rounded-lg shadow-lg flex flex-col overflow-hidden">
                  <Link to="/login/seeker" className="px-4 py-2 text-white hover:bg-[#3a5885] text-sm text-center border-b border-[#5b7ba8]">
                    {t('seekerPortal')}
                  </Link>
                  <Link to="/login/employer" className="px-4 py-2 text-white hover:bg-[#3a5885] text-sm text-center">
                    {t('employerPortal')}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm font-medium">
            <button 
              onClick={() => setLanguage('th')} 
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${language === 'th' ? 'bg-[#4a6b9c] text-white' : 'text-gray-400 hover:text-gray-600 border border-gray-200'}`}
            >
              TH
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => setLanguage('en')} 
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${language === 'en' ? 'bg-[#4a6b9c] text-white' : 'text-gray-400 hover:text-gray-600 border border-gray-200'}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

