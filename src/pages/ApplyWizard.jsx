import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { 
  User, Briefcase, GraduationCap, Code, Languages, Info, 
  Plus, Trash2, ArrowLeft, ArrowRight, Save, CheckCircle, Loader2, Sparkles
} from 'lucide-react';

export default function ApplyWizard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Wizard state: 1 = Mode Selection, 2 = Resume Details, 3 = Success
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeLanguageMode, setResumeLanguageMode] = useState('th'); // default to th
  
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingResume, setLoadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [targetedJobTitle, setTargetedJobTitle] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  // Lists
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [techSkills, setTechSkills] = useState('');
  const [softSkills, setSoftSkills] = useState('');
  const [languagesList, setLanguagesList] = useState([]);

  // Fetch job details & existing resume on mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();

    // Check user & load resume
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert(language === 'th' ? 'กรุณาเข้าสู่ระบบก่อน' : 'Please login first');
      navigate('/login/seeker');
      return;
    }

    const user = JSON.parse(userStr);
    const fetchResume = async () => {
      setLoadingResume(true);
      try {
        const response = await fetch(`http://localhost:5000/api/resumes/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (response.ok) {
          const resume = await response.json();
          setFullName(resume.fullName || '');
          setTargetedJobTitle(resume.targetedJobTitle || '');
          setAboutMe(resume.aboutMe || '');
          setPhotoUrl(resume.photoUrl || '');
          setPhone(resume.phone || '');
          setEmail(resume.email || '');
          setAddress(resume.address || '');
          setLinkedin(resume.linkedin || '');
          setGithub(resume.github || '');
          setExperiences(resume.experiences || []);
          setEducations(resume.educations || []);
          setLanguagesList(resume.languages || []);
          
          if (resume.skills) {
            setTechSkills(Array.isArray(resume.skills.technical) ? resume.skills.technical.join(', ') : '');
            setSoftSkills(Array.isArray(resume.skills.soft) ? resume.skills.soft.join(', ') : '');
          }
        } else {
          // prefill email & name from user account
          setFullName(user.name || '');
          setEmail(user.email || '');
        }
      } catch (err) {
        console.error('Error loading resume:', err);
      } finally {
        setLoadingResume(false);
      }
    };

    fetchResume();
  }, [jobId, navigate, language]);

  // List Handlers
  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', duration: '', description: '' }]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = experiences.map((exp, i) => {
      if (i === index) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducations([...educations, { school: '', degree: '', gradYear: '' }]);
  };

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = educations.map((edu, i) => {
      if (i === index) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    setEducations(updated);
  };

  const addLanguageItem = () => {
    setLanguagesList([...languagesList, { name: '', level: '', rating: 3 }]);
  };

  const removeLanguageItem = (index) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (index, field, value) => {
    const updated = languagesList.map((lang, i) => {
      if (i === index) {
        return { ...lang, [field]: value };
      }
      return lang;
    });
    setLanguagesList(updated);
  };

  const validateForm = () => {
    if (!fullName.trim()) return language === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Full Name is required';
    if (!targetedJobTitle.trim()) return language === 'th' ? 'กรุณากรอกตำแหน่งงานคาดหวัง' : 'Targeted job title is required';
    if (!phone.trim()) return language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone number is required';
    if (!email.trim()) return language === 'th' ? 'กรุณากรอกอีเมล' : 'Email is required';
    if (!address.trim()) return language === 'th' ? 'กรุณากรอกที่อยู่' : 'Address is required';
    return null;
  };

  const saveResume = async (silent = false) => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    setError('');

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);

    const payload = {
      userId: user.id,
      fullName,
      targetedJobTitle,
      aboutMe,
      photoUrl,
      phone,
      address,
      email,
      linkedin,
      github,
      experiences,
      educations,
      skills: {
        technical: techSkills.split(',').map(s => s.trim()).filter(Boolean),
        soft: softSkills.split(',').map(s => s.trim()).filter(Boolean)
      },
      languages: languagesList
    };

    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save resume');
      }

      const savedResume = await response.json();
      if (!silent) {
        alert(language === 'th' ? 'บันทึกโปรไฟล์เรียบร้อยแล้ว!' : 'Profile saved successfully!');
      }
      return savedResume;
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApplication = async () => {
    const saved = await saveResume(true);
    if (!saved) return; // Validation error or save failure

    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          jobId: Number(jobId),
          resumeUrl: '' // Empty since we saved database resume record
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Proceed to Step 3
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingJob || loadingResume) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f8fafc]">
        <Loader2 className="animate-spin text-[#2B5292] mb-4" size={48} />
        <p className="text-gray-500 font-medium">
          {language === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 px-4">
      <div className="max-w-[850px] mx-auto">
        
        {/* Step Indicator Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">{t('applyWizardTitle')}</h1>
              {job && (
                <p className="text-gray-500 mt-1">
                  {language === 'th' ? 'สมัครตำแหน่ง: ' : 'Position: '}
                  <span className="font-bold text-[#2B5292]">{job.title}</span> 
                  {language === 'th' ? ' ที่ ' : ' at '}
                  <span className="font-semibold text-gray-700">{job.employer?.company || 'บริษัทผู้ลงประกาศ'}</span>
                </p>
              )}
            </div>
            <div className="hidden sm:block text-xs font-semibold px-3 py-1 bg-blue-50 text-[#2B5292] rounded-full">
              {language === 'th' ? `ขั้นตอน ${currentStep} จาก 3` : `Step ${currentStep} of 3`}
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#2B5292] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>

            <div className="relative z-10 flex justify-between">
              {/* Step 1 indicator */}
              <button 
                onClick={() => currentStep > 1 && currentStep < 3 && setCurrentStep(1)}
                className={`flex flex-col items-center gap-2 cursor-pointer focus:outline-none`}
                disabled={currentStep === 3}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 1 ? 'bg-[#2B5292] text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  1
                </div>
                <span className={`text-xs font-bold ${currentStep >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>
                  {t('wizardStep1')}
                </span>
              </button>

              {/* Step 2 indicator */}
              <button 
                onClick={() => currentStep > 2 && currentStep < 3 && setCurrentStep(2)}
                className={`flex flex-col items-center gap-2 cursor-pointer focus:outline-none`}
                disabled={currentStep === 3}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-[#2B5292] text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  2
                </div>
                <span className={`text-xs font-bold ${currentStep >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>
                  {t('wizardStep2')}
                </span>
              </button>

              {/* Step 3 indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep === 3 ? 'bg-green-600 text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  3
                </div>
                <span className={`text-xs font-bold ${currentStep === 3 ? 'text-green-600' : 'text-gray-400'}`}>
                  {t('wizardStep3')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Display Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: RESUME LANGUAGE MODE SELECTION */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-500" />
              {language === 'th' ? 'เลือกรูปแบบการกรอกใบสมัคร' : 'Select Resume Language Mode'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Thai Mode Button */}
              <button 
                onClick={() => {
                  setResumeLanguageMode('th');
                  setCurrentStep(2);
                }}
                className={`flex flex-col items-start p-6 rounded-xl border-2 text-left cursor-pointer transition-all duration-300 ${
                  resumeLanguageMode === 'th' 
                    ? 'border-[#2B5292] bg-blue-50/40 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-black mb-4">
                  TH
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{t('thMode')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t('thModeDesc')}</p>
              </button>

              {/* English Mode Button */}
              <button 
                onClick={() => {
                  setResumeLanguageMode('en');
                  setCurrentStep(2);
                }}
                className={`flex flex-col items-start p-6 rounded-xl border-2 text-left cursor-pointer transition-all duration-300 ${
                  resumeLanguageMode === 'en' 
                    ? 'border-[#2B5292] bg-blue-50/40 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-[#2B5292] text-white rounded-lg flex items-center justify-center font-black mb-4">
                  EN
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{t('enMode')}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t('enModeDesc')}</p>
              </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 bg-[#2B5292] hover:bg-[#16366d] text-white font-bold px-6 py-3 rounded-full transition-colors cursor-pointer"
              >
                {t('next')} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: RESUME BUILDER FORM */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Language toggle at the top of the form */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Languages className="text-[#2B5292]" size={20} />
                <span className="font-bold text-gray-700 text-sm">
                  {language === 'th' ? 'ภาษาที่ใช้กรอกใบสมัคร:' : 'Resume Form Language:'}
                </span>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setResumeLanguageMode('th')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
                    resumeLanguageMode === 'th'
                      ? 'bg-[#2B5292] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
                  }`}
                >
                  ภาษาไทย (TH)
                </button>
                <button
                  type="button"
                  onClick={() => setResumeLanguageMode('en')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
                    resumeLanguageMode === 'en'
                      ? 'bg-[#2B5292] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* 1. Personal Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <User size={20} className="text-[#2B5292]" />
                {t('personalInfo')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={resumeLanguageMode === 'th' ? 'เช่น นายสมชาย ใจดี' : 'e.g. John Doe'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('targetedJobTitle')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="targetedJobTitle"
                    value={targetedJobTitle}
                    onChange={(e) => setTargetedJobTitle(e.target.value)}
                    placeholder={resumeLanguageMode === 'th' ? 'เช่น Senior Software Engineer' : 'e.g. Marketing Executive'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('aboutMe')}
                  </label>
                  <textarea 
                    name="aboutMe"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    rows={4}
                    placeholder={resumeLanguageMode === 'th' ? 'แนะนำตัวสั้นๆ ประสบการณ์ และเป้าหมายของคุณ...' : 'Briefly describe your career background and what you are looking for...'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'th' ? 'รูปโปรไฟล์ (URL)' : 'Profile Photo (URL)'}
                  </label>
                  <input 
                    type="text"
                    name="photoUrl"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Info size={20} className="text-[#2B5292]" />
                {t('contactInfo')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('phone')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="098-xxx-xxxx"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('email')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('address')} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={resumeLanguageMode === 'th' ? '123/45 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900' : '123 Sukhumvit Rd, Bangkok, Thailand'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn (URL)
                  </label>
                  <input 
                    type="text"
                    name="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GitHub (URL)
                  </label>
                  <input 
                    type="text"
                    name="github"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. Work Experience */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Briefcase size={20} className="text-[#2B5292]" />
                  {t('workExperience')}
                </h2>
                <button 
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 text-xs font-bold text-[#2B5292] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={14} /> {t('addExperience')}
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  {language === 'th' ? 'ยังไม่มีประวัติการทำงาน (กดเพิ่มเพื่อกรอกข้อมูล)' : 'No work experience added yet.'}
                </div>
              ) : (
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={index} className="relative p-6 border border-gray-200 rounded-xl bg-gray-50/30">
                      <button 
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('company')}</label>
                          <input 
                            type="text"
                            name="company"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            placeholder="e.g. ABC Company"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('position')}</label>
                          <input 
                            type="text"
                            name="position"
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('duration')}</label>
                          <input 
                            type="text"
                            name="duration"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                            placeholder="e.g. 2021 - Present"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('workDesc')}</label>
                          <textarea 
                            name="description"
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                            rows={3}
                            placeholder="Describe your role and key achievements..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Education History */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <GraduationCap size={20} className="text-[#2B5292]" />
                  {t('education')}
                </h2>
                <button 
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1 text-xs font-bold text-[#2B5292] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={14} /> {t('addEducation')}
                </button>
              </div>

              {educations.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  {language === 'th' ? 'ยังไม่มีประวัติการศึกษา (กดเพิ่มเพื่อกรอกข้อมูล)' : 'No education history added yet.'}
                </div>
              ) : (
                <div className="space-y-6">
                  {educations.map((edu, index) => (
                    <div key={index} className="relative p-6 border border-gray-200 rounded-xl bg-gray-50/30">
                      <button 
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('school')}</label>
                          <input 
                            type="text"
                            name="school"
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                            placeholder="e.g. Chulalongkorn University"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('degree')}</label>
                          <input 
                            type="text"
                            name="degree"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science in CS"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">{t('gradYear')}</label>
                          <input 
                            type="text"
                            name="gradYear"
                            value={edu.gradYear}
                            onChange={(e) => handleEducationChange(index, 'gradYear', e.target.value)}
                            placeholder="e.g. 2020"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Skills */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Code size={20} className="text-[#2B5292]" />
                {t('skills')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('techSkills')}
                  </label>
                  <textarea 
                    name="techSkills"
                    value={techSkills}
                    onChange={(e) => setTechSkills(e.target.value)}
                    rows={3}
                    placeholder="React, JavaScript, Node.js, Git, SQL"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('softSkills')}
                  </label>
                  <textarea 
                    name="softSkills"
                    value={softSkills}
                    onChange={(e) => setSoftSkills(e.target.value)}
                    rows={3}
                    placeholder="Problem Solving, Communication, Teamwork"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-[#2B5292] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 6. Languages */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Languages size={20} className="text-[#2B5292]" />
                  {t('languages')}
                </h2>
                <button 
                  type="button"
                  onClick={addLanguageItem}
                  className="flex items-center gap-1 text-xs font-bold text-[#2B5292] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={14} /> {t('addLanguage')}
                </button>
              </div>

              {languagesList.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  {language === 'th' ? 'ยังไม่มีข้อมูลภาษา (กดเพิ่มเพื่อระบุภาษา)' : 'No languages added yet.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {languagesList.map((lang, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-200 rounded-xl">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-600 mb-1">{language === 'th' ? 'ภาษา' : 'Language'}</label>
                        <input 
                          type="text"
                          name="langName"
                          value={lang.name}
                          onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                          placeholder="e.g. English, Thai, Japanese"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#2B5292]"
                        />
                      </div>

                      <div className="w-full sm:w-[150px]">
                        <label className="block text-xs font-bold text-gray-600 mb-1">{t('langLevel')}</label>
                        <input 
                          type="text"
                          name="langLevel"
                          value={lang.level}
                          onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                          placeholder="e.g. Intermediate, Native"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#2B5292]"
                        />
                      </div>

                      <div className="w-full sm:w-[120px]">
                        <label className="block text-xs font-bold text-gray-600 mb-1">{t('langRating')} (1-5)</label>
                        <select 
                          name="langRating"
                          value={lang.rating}
                          onChange={(e) => handleLanguageChange(index, 'rating', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none bg-white focus:border-[#2B5292]"
                        >
                          <option value={1}>1 Star</option>
                          <option value={2}>2 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={5}>5 Stars</option>
                        </select>
                      </div>

                      <button 
                        type="button"
                        onClick={() => removeLanguageItem(index)}
                        className="text-red-500 hover:text-red-700 pt-5 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
              <button 
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold px-6 py-3 rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} /> {t('back')}
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => saveResume(false)}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 border-2 border-[#2B5292] text-[#2B5292] hover:bg-blue-50 font-bold px-6 py-3 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  <Save size={18} /> 
                  {saving ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : t('saveProfileOnly')}
                </button>

                <button 
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-[#2B5292] hover:bg-[#153466] text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  {t('submitApplication')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: APPLICATION SUCCESS STATE */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle size={48} className="animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-4">{t('submitSuccess')}</h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto mb-8">
              {t('successDesc')}
            </p>

            {job && (
              <div className="max-w-md mx-auto p-5 border border-gray-100 rounded-2xl bg-gray-50 text-left mb-10">
                <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-800 rounded-full inline-block mb-3">
                  Applied Successfully
                </span>
                <h4 className="font-bold text-gray-800 text-lg">{job.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{job.employer?.company || 'Employer'}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-400 font-medium">
                  <span>Category: {job.category}</span>
                  <span>•</span>
                  <span>Work Type: {job.workType}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold px-8 py-3 rounded-full transition-colors cursor-pointer"
              >
                {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
              </button>

              <button 
                onClick={() => navigate('/search')}
                className="bg-[#2B5292] hover:bg-[#16366b] text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {t('backToJobs')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
