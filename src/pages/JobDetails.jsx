import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, FileText, Heart, Loader2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error(language === 'th' ? 'ไม่พบข้อมูลงานนี้' : 'Job not found');
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, language]);

  const handleApply = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert(language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำการสมัครงาน' : 'Please login before applying for a job');
      navigate('/login/seeker');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role === 'employer') {
      alert(language === 'th' ? 'บัญชีผู้ประกอบการไม่สามารถสมัครงานได้' : 'Employer account cannot apply for a job');
      return;
    }

    navigate(`/apply/${job.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 bg-red-50 p-6 rounded-lg text-lg font-medium">{error || (language === 'th' ? 'ไม่พบข้อมูล' : 'Not found')}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      {/* Cover Section */}
      <div className="relative w-full h-[270px] bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold bg-[#e8ecf1]">
          {language === 'th' ? 'รูปภายในบริษัท' : 'Company Images'}
        </div>
      </div>

      <div className="max-w-[1154px] mx-auto px-4 relative -mt-16">
        <div className="bg-white p-8 pt-16 rounded-b-xl shadow-sm border border-gray-100 relative">
          {/* Company Logo */}
          <div className="absolute -top-16 left-8 w-32 h-32 bg-white border border-gray-200 shadow-md flex items-center justify-center text-blue-500 font-bold text-xl rounded-md overflow-hidden">
            {job.employer?.company ? job.employer.company.substring(0, 2).toUpperCase() : 'LOGO'}
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <Link to={`/company/${job.employerId}`} className="text-[#0b2463] font-bold text-xl hover:underline">
                {job.employer?.company || (language === 'th' ? 'บริษัทไม่ระบุชื่อ' : 'Anonymous Company')}
              </Link>
              <p className="text-gray-600 text-sm mt-1">
                {language === 'th' ? 'ประเภทธุรกิจ: เทคโนโลยี / ซอฟต์แวร์' : 'Industry: Technology / Software'}
              </p>

              <h1 className="text-3xl font-bold text-gray-900 mt-6">{job.title}</h1>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  • {t('fullTime')}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full ml-2">
                  {job.category}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 md:pt-0">
              <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 rounded-full text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors">
                <Heart size={24} />
              </button>
              <button 
                onClick={handleApply}
                className="bg-[#2B5292] hover:bg-[#1a365d] text-white px-8 py-3 rounded-full font-bold transition-colors cursor-pointer"
              >
                {t('applyBtn')}
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mt-6 gap-2">
            <Clock size={16} /> 
            <span>{t('postedDate')}: {new Date(job.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
          {/* ข้อมูลทั่วไป */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{language === 'th' ? 'ข้อมูลเบื้องต้น' : 'Basic Information'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <Briefcase size={20} className="text-gray-400 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-700">{language === 'th' ? 'ยินดีรับนักศึกษาจบใหม่' : 'New graduates welcome'}</div>
                  <div className="text-gray-500 mt-1">{language === 'th' ? 'ปริญญาตรีขึ้นไป' : "Bachelor's degree or higher"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-700">{t('salaryRange')}</div>
                  <div className="text-gray-500 mt-1">
                    {job.salaryMin > 0 || job.salaryMax > 0 ? (
                      `${job.salaryMin.toLocaleString()} - ${job.salaryMax ? job.salaryMax.toLocaleString() : 'Negotiable'} ${language === 'th' ? 'บาท/เดือน' : 'THB/month'}`
                    ) : (
                      t('negotiable')
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-gray-400 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-700">09:00 - 18:00 น.</div>
                  <div className="text-gray-500 mt-1">{language === 'th' ? 'จันทร์ - ศุกร์' : 'Monday - Friday'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* ลักษณะงาน */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('jobDescription')}</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* คุณสมบัติ / สวัสดิการ */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('requirements')}</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {job.requirements || (language === 'th' ? 'ตามโครงสร้างบริษัท' : 'Company structure standard')}
            </div>
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* ติดต่อ */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{language === 'th' ? 'ช่องทางการติดต่อ' : 'Contact Information'}</h2>
            <div className="text-gray-600 text-sm leading-relaxed">
              <p className="font-bold text-gray-800">{job.employer?.company || 'HR Department'}</p>
              <p className="mt-1">{job.location}</p>
              <div className="mt-4 flex flex-col gap-2">
                <p>📞 098-xxx-xxxx</p>
                <p>✉️ hr@company.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{language === 'th' ? 'การเดินทาง' : 'Location & Map'}</h2>
          <div className="text-gray-600 text-sm leading-relaxed mb-6">
            <p className="font-bold text-gray-800">{language === 'th' ? 'ที่อยู่บริษัท :' : 'Company Address :'}</p>
            <p>{job.location}</p>
          </div>
          <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 relative overflow-hidden">
             {/* Mock Map Image */}
             <div className="absolute inset-0 opacity-50 flex flex-col justify-center items-center text-xl font-bold">
               <MapPin size={48} className="text-red-500 mb-2" />
               แผนที่จำลอง
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
