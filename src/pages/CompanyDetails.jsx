import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Phone, Mail, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/company/${id}`);
        if (!response.ok) {
          throw new Error(language === 'th' ? 'ไม่พบข้อมูลบริษัท' : 'Company not found');
        }
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 bg-red-50 p-6 rounded-lg text-lg font-medium">{error || t('noData')}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      {/* Cover Section */}
      <div className="relative w-full h-[270px] bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold bg-[#e8ecf1]">
          {t('companyImageMock')}
        </div>
      </div>

      <div className="max-w-[1154px] mx-auto px-4 relative -mt-16">
        <div className="bg-[#e8ecf1] p-8 pt-16 rounded-b-xl shadow-sm border border-gray-100 relative">
          {/* Company Logo */}
          <div className="absolute -top-16 left-8 w-32 h-32 bg-white border border-gray-200 shadow-md flex items-center justify-center text-blue-500 font-bold text-xl rounded-md overflow-hidden">
            {company.company ? company.company.substring(0, 2).toUpperCase() : 'LOGO'}
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0b2463]">{company.company || t('companyNoName')}</h1>
              <p className="text-gray-700 font-medium mt-2">{t('hrContact').replace('{name}', company.name || 'HR')}</p>
              
              <div className="mt-4 text-sm text-gray-600 leading-relaxed">
                <p>{t('mockAddress')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Phone size={16} /> 098-765-4321
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={16} /> {company.email} <span className="text-xs text-gray-400">{t('clickableLink')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-300 mt-8 mb-6"></div>

          {/* About Company section in Header block */}
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-bold text-gray-800 w-32 inline-block">{t('aboutCompanyLabel')}</span>
              <span className="text-gray-600">{company.company} {t('companyAboutDesc')}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 w-32 inline-block">{t('businessTypeLabel')}</span>
              <span className="text-gray-600">{t('businessTypeVal')}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 w-32 inline-block">{t('websiteLabel')}</span>
              <span className="text-blue-600 hover:underline cursor-pointer">{t('websiteVal')}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 w-32 inline-block">{t('companyAddressLabel')}</span>
              <span className="text-gray-600">{t('mockAddressShort')}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 w-32 inline-block align-top">{t('welfareLabel')}</span>
              <div className="inline-block text-gray-600 ml-1">
                <ul className="list-disc list-inside">
                  <li>{t('welfareBonus')}</li>
                  <li>{t('welfareBonus')}</li>
                  <li>{t('welfareBonus')}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-300 mt-6 mb-6"></div>

          {/* Transportation */}
          <div className="space-y-2 text-sm text-gray-600">
            <h2 className="font-bold text-gray-800 mb-3 text-base">{t('transportTitle')}</h2>
            <p><span className="font-bold text-gray-700">{t('companyAddressLabel')} </span> {t('mockAddressShort')}</p>
            <p><span className="font-bold text-gray-700">{t('mrtLabel')} </span> {t('mrtVal')}</p>
            <p><span className="font-bold text-gray-700">{t('busLabel')} </span> {t('busVal')}</p>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 relative overflow-hidden">
             {/* Mock Map Image */}
             <div className="absolute inset-0 opacity-50 flex flex-col justify-center items-center text-xl font-bold">
               <MapPin size={48} className="text-red-500 mb-2" />
               {t('mockMap')}
             </div>
          </div>
        </div>

        {/* Company's Jobs */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('companyJobs')}</h2>
          
          {company.jobs && company.jobs.length > 0 ? (
            <div className="space-y-4">
              {company.jobs.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center text-blue-500 font-bold shrink-0">
                    {company.company ? company.company.substring(0, 2).toUpperCase() : 'LG'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-[#2B5292] hover:underline cursor-pointer">
                          <Link to={`/job/${job.id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-gray-600 text-sm">{company.company}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {job.workType === 'On-site' ? t('onSite') : job.workType === 'Hybrid' ? t('hybridWork') : job.workType === 'Remote' ? t('remoteWork') : job.workType}
                      </span>
                    </div>

                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {job.location}
                      </div>
                      {(job.salaryMin > 0 || job.salaryMax > 0) && (
                        <div className="flex items-center gap-1 font-medium text-green-600">
                          <Briefcase size={14} /> ฿{job.salaryMin ? job.salaryMin.toLocaleString() : 0} - {job.salaryMax ? job.salaryMax.toLocaleString() : (language === 'th' ? 'ไม่ระบุ' : 'Any')}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={14} /> {new Date(job.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pl-4 border-l border-gray-100 ml-auto">
                    <Link to={`/job/${job.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                      {t('viewDetails')} <span className="text-lg leading-none">&rsaquo;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
              {t('noCompanyJobs')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
