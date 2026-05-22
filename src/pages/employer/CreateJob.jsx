import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';

export default function CreateJob() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    workType: 'On-site',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    status: 'Draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (status) => {
    try {
      setLoading(true);
      setError('');
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Please login first');
      }
      const user = JSON.parse(userStr);
      
      const payload = { ...formData, status, employerId: user.id };
      
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      navigate('/employer/history');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b2463] mb-2">{t('postNewJobTitle')}</h1>
        <p className="text-gray-600">{t('postNewJobDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                <strong>{t('errorLabel')}:</strong> {error}
              </div>
            )}

            {/* Basic Details Section */}
            <h2 className="text-xl font-bold text-[#0b2463] mb-6">{t('basicDetails')}</h2>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('jobTitleInput')}</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t('jobTitlePlaceholder')} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('categoryInput')}</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  >
                    <option value="">{t('selectCategory')}</option>
                    <option value="Engineering">{language === 'th' ? 'วิศวกรรมศาสตร์' : 'Engineering'}</option>
                    <option value="Design">{language === 'th' ? 'การออกแบบ' : 'Design'}</option>
                    <option value="Marketing">{language === 'th' ? 'การตลาด' : 'Marketing'}</option>
                    <option value="Sales">{language === 'th' ? 'งานขาย' : 'Sales'}</option>
                    <option value="Product">{language === 'th' ? 'ผลิตภัณฑ์' : 'Product'}</option>
                    <option value="IT">{language === 'th' ? 'ไอที / โปรแกรมมิ่ง' : 'IT / Programming'}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('locationInput')}</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={t('locationInputPlaceholder')} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('workTypeInput')}</label>
                  <select 
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  >
                    <option value="On-site">{t('onSite')}</option>
                    <option value="Hybrid">{t('hybridWork')}</option>
                    <option value="Remote">{t('remoteWork')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('minSalaryInput')}</label>
                  <input 
                    type="number" 
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder={t('salaryMinPlaceholder')} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('maxSalaryInput')}</label>
                  <input 
                    type="number" 
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder={t('salaryMaxPlaceholder')} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* Description & Requirements Section */}
            <h2 className="text-xl font-bold text-[#0b2463] mb-6">{t('descriptionAndRequirements')}</h2>
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('jobDescriptionInput')}</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('jobDescPlaceholder')} 
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 resize-y"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('requirementsInput')}</label>
                <textarea 
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder={t('requirementsPlaceholder')} 
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 resize-y"
                ></textarea>
              </div>
            </div>

            <hr className="border-gray-200 mb-6" />

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => handleSubmit('Draft')}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-400 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('saveDraftBtn')}
              </button>
              <button 
                onClick={() => handleSubmit('Active')}
                disabled={loading}
                className="px-6 py-2.5 bg-[#4a6b9c] text-white font-medium rounded-md hover:bg-[#3a5885] transition-colors disabled:opacity-50"
              >
                {t('publishBtn')}
              </button>
            </div>
            
          </div>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-6">
          
          {/* Listing Status */}
          <div className="bg-[#f4f7fa] rounded-lg border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-[#0b2463] mb-4">{t('listingStatusTitle')}</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">{t('draftBadge')}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('draftStatusDesc')}
            </p>
          </div>

          {/* Pro Tips */}
          <div className="bg-[#f4f7fa] rounded-lg border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-[#0b2463] mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7a5 5 0 1 0 0 10v1"/></svg>
              {t('proTipsTitle')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {t('proTip1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {t('proTip2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                {t('proTip3')}
              </li>
            </ul>
          </div>
          
        </div>

      </div>
    </div>
  );
}
