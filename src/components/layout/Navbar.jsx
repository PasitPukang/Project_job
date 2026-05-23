import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  
  // Read user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsUserDropdownOpen(false);
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
            <div className="relative">
              <div 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors select-none"
              >
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white">
                  <User size={14} />
                </div>
                <span className="text-gray-700 font-medium text-sm max-w-[120px] truncate">{user.name || user.username}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </div>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 flex flex-col">
                  {user.role === 'seeker' ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400 font-medium">{language === 'th' ? 'ผู้สมัครงาน' : 'Job Seeker'}</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">{user.name || user.username}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2"
                      >
                        <span>{language === 'th' ? 'แผงควบคุม (Dashboard)' : 'Dashboard'}</span>
                      </Link>
                      <Link 
                        to="/profile?tab=resume" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2"
                      >
                        <span>{language === 'th' ? 'เรซูเม่ของฉัน (My Resume)' : 'My Resume'}</span>
                      </Link>
                      <Link 
                        to="/profile?tab=applications" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2"
                      >
                        <span>{language === 'th' ? 'งานที่สมัคร (Applications)' : 'Applied Jobs'}</span>
                      </Link>
                      <Link 
                        to="/profile?tab=saved" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2"
                      >
                        <span>{language === 'th' ? 'งานที่บันทึก (Saved Jobs)' : 'Saved Jobs'}</span>
                      </Link>
                      <Link 
                        to="/profile?tab=settings" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2 border-b border-gray-100 pb-2 mb-1"
                      >
                        <span>{language === 'th' ? 'ตั้งค่าโปรไฟล์ (Settings)' : 'Settings'}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400 font-medium">{language === 'th' ? 'ผู้ประกอบการ' : 'Employer'}</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">{user.company || user.username}</p>
                      </div>
                      <Link 
                        to="/employer/dashboard" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2"
                      >
                        <span>{language === 'th' ? 'แดชบอร์ดนายจ้าง' : 'Employer Dashboard'}</span>
                      </Link>
                      <Link 
                        to="/employer/create-job" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2"
                      >
                        <span>{language === 'th' ? 'ลงประกาศงานใหม่' : 'Post a New Job'}</span>
                      </Link>
                      <Link 
                        to="/employer/history" 
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#2B5292] flex items-center space-x-2 border-b border-gray-100 pb-2 mb-1"
                      >
                        <span>{language === 'th' ? 'ประวัติงานทั้งหมด' : 'Job History'}</span>
                      </Link>
                    </>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut size={14} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
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

