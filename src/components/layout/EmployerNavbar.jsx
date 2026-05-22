import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function EmployerNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  
  // ดึงข้อมูล User จาก LocalStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login/employer');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `text-base transition-colors ${isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-700 hover:text-[#2B5292]'}`;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-20 flex items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <Link to="/employer/dashboard" className="flex items-center">
            <div className="bg-[#2B5292] text-white font-bold text-2xl px-4 py-1.5 rounded-xl flex items-center border-[3px] border-[#93c5fd]">
              <span>หางาน</span>
              <span className="text-[#93c5fd]">.com</span>
            </div>
          </Link>
        </div>

        {/* Center Section: Links */}
        <div className="hidden md:flex space-x-8">
          <Link to="/employer/create-job" className={getLinkClass('/employer/create-job')}>{t('createJob')}</Link>
          <Link to="/employer/history" className={getLinkClass('/employer/history')}>{t('history')}</Link>
          <Link to="/employer/pricing" className={getLinkClass('/employer/pricing')}>{t('pricing')}</Link>
        </div>

        {/* Right Section: User & Logout */}
        <div className="flex items-center space-x-6">
          {user && (
            <div className="hidden lg:flex items-center space-x-2 text-gray-700">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[#2B5292]">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">{user.company || user.username}</span>
                <span className="text-[10px] text-gray-500">Employer</span>
              </div>
            </div>
          )}
          
          {/* Language Switcher */}
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

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

