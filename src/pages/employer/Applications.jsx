import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';
import { 
  Search, Filter, FileText, X, User, Mail, Phone, MapPin, 
  Briefcase, GraduationCap, Code, Languages, Star, ArrowLeft 
} from 'lucide-react';

const Linkedin = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Github = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

export default function Applications() {
  const { jobId } = useParams();
  const { t, language } = useLanguage();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchJobDetails();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      const res = await fetch(`http://localhost:5000/api/applications/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      const response = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert(language === 'th' ? 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' : 'Failed to update application status');
    }
  };

  const filteredApps = applications.filter(app => 
    app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-4">
        <Link to="/employer/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={16} />
          {language === 'th' ? 'กลับไปยังแดชบอร์ด' : 'Back to Dashboard'}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0b2463] mb-2">
          {t('applicantsFor')}: {job ? job.title : '...'}
        </h1>
        <p className="text-gray-500 font-medium">
          {language === 'th' ? 'จัดการและพิจารณาใบสมัครของตำแหน่งนี้' : 'Manage and review applicant profiles for this role.'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'th' ? 'ค้นหาชื่อผู้สมัคร...' : 'Search by name...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-semibold whitespace-nowrap">
          <Filter size={18} />
          {language === 'th' ? 'ตัวกรอง' : 'Filter'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#8b9db4] rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-[#8b9db4] text-white">
              <tr className="text-sm font-semibold">
                <th className="p-4 pl-6 text-center w-20">ID</th>
                <th className="p-4">{t('applicantName')}</th>
                <th className="p-4">{t('applicantEmail')}</th>
                <th className="p-4 text-center w-28">{t('resumeTitle')}</th>
                <th className="p-4 text-center w-36">{t('status')}</th>
                <th className="p-4 text-center w-40">{t('changeStatus')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500 font-bold bg-[#eef1f6]">
                    {language === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading data...'}
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500 font-bold bg-[#eef1f6]">
                    {t('noApplicants')}
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, index) => (
                  <tr key={app.id} className="border-b border-gray-100 bg-[#eef1f6] hover:bg-[#e2e8f0] transition-colors">
                    <td className="p-4 pl-6 font-bold text-center text-gray-600">QA{String(index + 1).padStart(2, '0')}</td>
                    <td className="p-4 font-bold text-gray-800">{app.user?.name || 'ไม่ระบุชื่อ'}</td>
                    <td className="p-4 font-bold text-gray-600">{app.user?.email}</td>
                    <td className="p-4 text-center">
                      {app.user?.resume ? (
                        <button 
                          onClick={() => setSelectedResume(app.user.resume)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors mx-auto block"
                          title={t('viewResumeBtn')}
                        >
                          <FileText size={20} />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">
                          {language === 'th' ? 'ไม่มีเรซูเม่' : 'No Resume'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                        app.status === 'Interview' ? 'bg-[#8b9db4] text-[#0b2463]' : 
                        app.status === 'Pending' ? 'bg-[#00c49f] text-white' : 
                        app.status === 'Reviewed' ? 'bg-amber-400 text-white' : 
                        'bg-[#ff4d4f] text-white'
                      }`}>
                        {app.status === 'Interview' ? t('statusInterview') : 
                         app.status === 'Pending' ? t('statusPending') : 
                         app.status === 'Reviewed' ? (language === 'th' ? 'พิจารณาแล้ว' : 'Reviewed') : 
                         t('statusRejected')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        <option value="Pending">{t('statusPending')}</option>
                        <option value="Interview">{t('statusInterview')}</option>
                        <option value="Rejected">{t('statusRejected')}</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500 font-semibold">
          {language === 'th' 
            ? `แสดง ${Math.min(10, applications.length)} จาก ${applications.length} รายการ` 
            : `Showing ${Math.min(10, applications.length)} of ${applications.length} items`}
        </div>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white rounded text-gray-500 hover:bg-gray-50">&lt;</button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-[#4a6b9c] text-white rounded">1</button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white rounded text-gray-500 hover:bg-gray-50">&gt;</button>
        </div>
      </div>

      {/* Resume Viewer Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 relative animate-fadeIn">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => setSelectedResume(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2.5 rounded-full transition-all z-10"
              title={t('closeModal')}
            >
              <X size={20} />
            </button>

            {/* Resume Layout */}
            <div className="p-8 md:p-12">
              
              {/* Header profile info */}
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-8 border-b border-gray-100">
                {selectedResume.photoUrl ? (
                  <img 
                    src={selectedResume.photoUrl} 
                    alt={selectedResume.fullName} 
                    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-md border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-500 shadow-inner">
                    <User size={48} />
                  </div>
                )}
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900">{selectedResume.fullName}</h2>
                  <p className="text-lg font-bold text-blue-600 mt-1">{selectedResume.targetedJobTitle}</p>
                  
                  {selectedResume.aboutMe && (
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xl">
                      {selectedResume.aboutMe}
                    </p>
                  )}
                </div>
              </div>

              {/* Grid Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                
                {/* Left Side Column: Contacts, Skills, Languages */}
                <div className="md:col-span-1 space-y-8">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                      {t('contactInfo')}
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700 font-semibold">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="break-all">{selectedResume.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="break-all">{selectedResume.email}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{selectedResume.address}</span>
                      </div>
                      {selectedResume.linkedin && (
                        <div className="flex items-center gap-3">
                          <Linkedin size={16} className="text-blue-500 flex-shrink-0" />
                          <a href={selectedResume.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                            LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedResume.github && (
                        <div className="flex items-center gap-3">
                          <Github size={16} className="text-blue-500 flex-shrink-0" />
                          <a href={selectedResume.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                            GitHub
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedResume.skills && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Code size={16} className="text-blue-500" />
                        {t('skills')}
                      </h3>
                      
                      {/* Technical Skills */}
                      {selectedResume.skills.technical && selectedResume.skills.technical.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Technical</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedResume.skills.technical.map((skill, index) => (
                              <span key={index} className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Soft Skills */}
                      {selectedResume.skills.soft && selectedResume.skills.soft.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Soft Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedResume.skills.soft.map((skill, index) => (
                              <span key={index} className="text-xs font-semibold px-2.5 py-1 bg-gray-50 text-gray-700 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Languages */}
                  {selectedResume.languages && selectedResume.languages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Languages size={16} className="text-blue-500" />
                        {t('languages')}
                      </h3>
                      <div className="space-y-3">
                        {selectedResume.languages.map((lang, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between font-bold text-gray-700 mb-1">
                              <span>{lang.name}</span>
                              <span className="text-xs text-gray-500 font-medium">{lang.level}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  className={star <= (lang.rating || 3) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Column: Experiences, Educations */}
                <div className="md:col-span-2 space-y-8">
                  {/* Experience */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Briefcase size={16} className="text-blue-500" />
                      {t('workExperience')}
                    </h3>
                    
                    {(!selectedResume.experiences || selectedResume.experiences.length === 0) ? (
                      <p className="text-sm text-gray-400 italic">
                        {language === 'th' ? 'ไม่มีประวัติการทำงาน' : 'No work experience listed.'}
                      </p>
                    ) : (
                      <div className="space-y-6 border-l-2 border-blue-50 pl-4 ml-2">
                        {selectedResume.experiences.map((exp, index) => (
                          <div key={index} className="relative">
                            {/* Dot icon indicator */}
                            <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50"></div>
                            
                            <h4 className="font-bold text-gray-800 text-base leading-tight">
                              {exp.position}
                            </h4>
                            <div className="flex flex-wrap gap-x-2 text-xs font-semibold text-gray-500 mt-1">
                              <span className="text-blue-600">{exp.company}</span>
                              <span>•</span>
                              <span>{exp.duration}</span>
                            </div>
                            {exp.description && (
                              <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <GraduationCap size={18} className="text-blue-500" />
                      {t('education')}
                    </h3>
                    
                    {(!selectedResume.educations || selectedResume.educations.length === 0) ? (
                      <p className="text-sm text-gray-400 italic">
                        {language === 'th' ? 'ไม่มีประวัติการศึกษา' : 'No education history listed.'}
                      </p>
                    ) : (
                      <div className="space-y-6 border-l-2 border-blue-50 pl-4 ml-2">
                        {selectedResume.educations.map((edu, index) => (
                          <div key={index} className="relative">
                            <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-50"></div>
                            
                            <h4 className="font-bold text-gray-800 text-base leading-tight">
                              {edu.degree}
                            </h4>
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mt-1">
                              <span className="text-blue-600">{edu.school}</span>
                              <span>Class of {edu.gradYear}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Modal Actions */}
              <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedResume(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
                >
                  {t('closeModal')}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
