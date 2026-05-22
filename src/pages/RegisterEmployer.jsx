import React, { useState } from 'react';
import { User, Lock, Mail, Building2, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../components/LanguageContext';

export default function RegisterEmployer() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    company: '',
    role: 'employer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('registerErrorText'));
      }

      // บันทึกข้อมูล User ลง LocalStorage และไปยังหน้า Dashboard
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/employer/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            accessToken: tokenResponse.access_token,
            role: 'employer'
          })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || t('googleConnectionError'));
        
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/employer/dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError(t('googleConnectionError'));
    }
  });

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-16 min-h-[calc(100vh-80px-200px)]">

      {/* Left Form Box */}
      <div className="w-full md:w-[450px] bg-[#e8ecf1] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1e3a8a] text-center mb-2">{t('registerTitleEmployer')}</h1>
        <p className="text-sm text-gray-700 text-center mb-6">{t('employerRegisterSubtitle')}</p>

        <div className="border-t border-gray-400 mb-6 w-full max-w-[80%] mx-auto"></div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
              <User size={18} />
            </div>
            <input
              type="text"
              name="name"
              placeholder={t('hrNamePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
              <Building2 size={18} />
            </div>
            <input
              type="text"
              name="company"
              placeholder={t('companyPlaceholder')}
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
              <User size={18} />
            </div>
            <input
              type="text"
              name="username"
              placeholder={t('usernamePlaceholder')}
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600">
              <Lock size={18} />
            </div>
            <input
              type="password"
              name="password"
              placeholder={t('passwordMinPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          <div className="pt-4 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#3a5078] hover:bg-[#2b3c5a] text-white font-medium py-2 px-10 rounded-md transition-colors flex items-center gap-2 w-full justify-center"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {t('registerBtnText')}
            </button>
            <div className="text-xs text-gray-600">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login/employer" className="text-blue-600 hover:underline">
                {t('loginHere')}
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-400"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#e8ecf1] text-gray-700 font-medium">{t('orRegisterWith')}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-6">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 shadow">f</div>
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 shadow">L</div>
          <button 
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-red-500 font-bold cursor-pointer hover:bg-gray-50 shadow"
          >
            G
          </button>
        </div>
      </div>

      {/* Right Information Section */}
      <div className="w-full md:w-[500px]">
        <div className="h-48 mb-6 flex items-center justify-center bg-blue-50/50 rounded-2xl relative">
          <div className="text-4xl">👨‍💻</div>
          <div className="absolute top-4 right-10 bg-orange-400 w-10 h-10 rounded-full flex items-center justify-center text-white"><span className="text-sm">🕒</span></div>
          <div className="absolute bottom-4 left-10 text-green-600 text-2xl">🪴</div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-black">{t('employerTermsTitle')}</h2>
        <ul className="space-y-2 text-sm text-gray-800 list-disc list-inside">
          <li>{t('employerTerms1')}</li>
          <li>{t('employerTerms2')}</li>
          <li>{t('employerTerms3')}</li>
        </ul>
      </div>

    </div>
  );
}
