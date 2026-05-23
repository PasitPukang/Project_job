import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { 
  User, Briefcase, GraduationCap, Code, Languages, Info, 
  Plus, Trash2, ArrowLeft, ArrowRight, Save, CheckCircle, 
  Loader2, Sparkles, Clock, MapPin, Calendar, DollarSign, 
  Heart, Lock, Shield, Bell, UserCheck, FileText, Menu, X, 
  ChevronRight, Edit, Eye, ShieldAlert, Award, FileCheck
} from 'lucide-react';

export default function Profile() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Tab state (dashboard, resume, applications, saved, settings)
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings sub-tab state (personal, career, notifications, privacy, account)
  const [activeSettingsTab, setActiveSettingsTab] = useState('personal');

  // Parse tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dashboard', 'resume', 'applications', 'saved', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Auth User
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
    if (!user) {
      navigate('/login/seeker');
    }
  }, [user, navigate]);

  // API Loading & Data States
  const [resume, setResume] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Resume Form States
  const [isResumeEditMode, setIsResumeEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [targetedJobTitle, setTargetedJobTitle] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [techSkills, setTechSkills] = useState('');
  const [softSkills, setSoftSkills] = useState('');
  const [languagesList, setLanguagesList] = useState([]);

  // Account Settings Form States
  const [settingsUsername, setSettingsUsername] = useState(user?.username || '');
  const [settingsEmail, setSettingsEmail] = useState(user?.email || '');
  const [settingsName, setSettingsName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications & Privacy States (Local Storage mock)
  const [notifEmailMatches, setNotifEmailMatches] = useState(true);
  const [notifAppStatus, setNotifAppStatus] = useState(true);
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [privacyAnonymize, setPrivacyAnonymize] = useState(false);

  // Identity Verification states
  const [isVerified, setIsVerified] = useState(() => {
    if (!user) return false;
    return localStorage.getItem(`seeker_verified_${user.id}`) === 'true';
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [idType, setIdType] = useState('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Fetch all profile data (applications, resume, jobs for saved filtering)
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Resume
        const resumeRes = await fetch(`http://localhost:5000/api/resumes/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (resumeRes.ok) {
          const resumeData = await resumeRes.json();
          setResume(resumeData);
          // Sync resume fields to form states
          setFullName(resumeData.fullName || '');
          setTargetedJobTitle(resumeData.targetedJobTitle || '');
          setAboutMe(resumeData.aboutMe || '');
          setPhotoUrl(resumeData.photoUrl || '');
          setPhone(resumeData.phone || '');
          setEmail(resumeData.email || '');
          setAddress(resumeData.address || '');
          setLinkedin(resumeData.linkedin || '');
          setGithub(resumeData.github || '');
          setExperiences(resumeData.experiences || []);
          setEducations(resumeData.educations || []);
          setLanguagesList(resumeData.languages || []);
          if (resumeData.skills) {
            setTechSkills(Array.isArray(resumeData.skills.technical) ? resumeData.skills.technical.join(', ') : '');
            setSoftSkills(Array.isArray(resumeData.skills.soft) ? resumeData.skills.soft.join(', ') : '');
          }
        } else {
          // If no resume, prefill basic details from user account
          setFullName(user.name || '');
          setEmail(user.email || '');
        }

        // 2. Fetch Applications
        const appRes = await fetch(`http://localhost:5000/api/applications/seeker`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          setApplications(appData);
        }

        // 3. Fetch Saved Jobs
        const savedIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        if (savedIds.length > 0) {
          const jobsRes = await fetch('http://localhost:5000/api/jobs');
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            const filtered = jobsData.filter(job => savedIds.includes(job.id));
            setSavedJobs(filtered);
          }
        } else {
          setSavedJobs([]);
        }

      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle message timeouts
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Sync settings inputs when user object changes
  useEffect(() => {
    if (user) {
      setSettingsUsername(user.username || '');
      setSettingsEmail(user.email || '');
      setSettingsName(user.name || '');
    }
  }, [user]);

  if (!user) return null;

  // Calculate Resume Completion %
  const calculateResumeStrength = () => {
    if (!resume) return 10; // base registered state
    let score = 20; // registered user
    if (resume.fullName) score += 10;
    if (resume.phone) score += 10;
    if (resume.email) score += 10;
    if (resume.address) score += 10;
    if (resume.aboutMe) score += 10;
    if (resume.targetedJobTitle) score += 10;
    if (resume.experiences && resume.experiences.length > 0) score += 10;
    if (resume.educations && resume.educations.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const resumeStrength = calculateResumeStrength();

  // Save Resume Handler
  const handleSaveResume = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    if (!fullName || !targetedJobTitle || !phone || !email || !address) {
      setMessage({
        type: 'error',
        text: language === 'th' ? 'กรุณากรอกข้อมูลติดต่อและข้อมูลจำเป็นให้ครบถ้วน' : 'Please fill in all required contact fields.'
      });
      setActionLoading(false);
      return;
    }

    const techArray = techSkills.split(',').map(s => s.trim()).filter(Boolean);
    const softArray = softSkills.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
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
      skills: { technical: techArray, soft: softArray },
      languages: languagesList
    };

    try {
      const response = await fetch('http://localhost:5000/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedResume = await response.json();
        setResume(savedResume);
        setIsResumeEditMode(false);
        setMessage({
          type: 'success',
          text: language === 'th' ? 'บันทึกประวัติส่วนตัวสำเร็จแล้ว!' : 'Resume saved successfully!'
        });
        
        // Also update local User state if name was updated
        const updatedUser = { ...user, name: fullName };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save resume' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error contacting backend' });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Account Settings Handler
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    if (!settingsUsername || !settingsEmail) {
      setMessage({
        type: 'error',
        text: language === 'th' ? 'ชื่อผู้ใช้และอีเมลห้ามว่าง' : 'Username and email cannot be empty.'
      });
      setActionLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: language === 'th' ? 'รหัสผ่านใหม่ไม่ตรงกับยืนยันรหัสผ่าน' : 'Confirm password does not match.'
      });
      setActionLoading(false);
      return;
    }

    const payload = {
      name: settingsName,
      email: settingsEmail,
      username: settingsUsername,
      ...(newPassword ? { password: newPassword } : {})
    };

    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Reset password fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Sync to personal/contact details state too
        setFullName(data.user.name);
        setEmail(data.user.email);
        
        setMessage({
          type: 'success',
          text: language === 'th' ? 'อัปเดตข้อมูลบัญชีสำเร็จ' : 'Account updated successfully.'
        });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to update profile' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Remove saved job
  const handleRemoveSavedJob = (jobId) => {
    const savedIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const updated = savedIds.filter(id => id !== jobId);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    setSavedJobs(savedJobs.filter(j => j.id !== jobId));
    setMessage({
      type: 'success',
      text: language === 'th' ? 'ลบงานที่บันทึกออกแล้ว' : 'Saved job removed.'
    });
  };

  // Resume Inline List Handlers
  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', duration: '', description: '' }]);
  };
  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };
  const handleExperienceChange = (index, field, value) => {
    setExperiences(experiences.map((exp, i) => i === index ? { ...exp, [field]: value } : exp));
  };

  const addEducation = () => {
    setEducations([...educations, { school: '', degree: '', gradYear: '' }]);
  };
  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };
  const handleEducationChange = (index, field, value) => {
    setEducations(educations.map((edu, i) => i === index ? { ...edu, [field]: value } : edu));
  };

  const addLanguage = () => {
    setLanguagesList([...languagesList, { name: '', level: '', rating: 3 }]);
  };
  const removeLanguage = (index) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
  };
  const handleLanguageChange = (index, field, value) => {
    setLanguagesList(languagesList.map((lang, i) => i === index ? { ...lang, [field]: value } : lang));
  };

  // Verify Identity handler (Mock Animation)
  const triggerIdentityVerification = () => {
    if (!idNumber || idNumber.length < 8) {
      alert(language === 'th' ? 'กรุณากรอกเลขบัตรหรือเลขพาสปอร์ตให้ถูกต้อง' : 'Please input a valid ID number.');
      return;
    }
    setVerifying(true);
    setVerifyProgress(10);
    
    // Simulate loading increments
    const interval = setInterval(() => {
      setVerifyProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setVerifyProgress(100);
            setVerifying(false);
            setVerificationSuccess(true);
            setIsVerified(true);
            localStorage.setItem(`seeker_verified_${user.id}`, 'true');
          }, 300);
          return 90;
        }
        return prev + 25;
      });
    }, 400);
  };

  const resetVerifyModal = () => {
    setShowVerifyModal(false);
    setVerificationSuccess(false);
    setIdNumber('');
    setVerifyProgress(0);
    setVerifying(false);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-8 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR PANEL */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#2B5292] text-white flex items-center justify-center font-bold text-3xl">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user.name || user.username).charAt(0).toUpperCase()}</span>
                )}
              </div>
              {isVerified && (
                <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Seeker">
                  <UserCheck size={16} />
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-gray-800 text-center truncate max-w-full">
              {user.name || user.username}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-full">{user.email}</p>

            <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden" title={`Resume Completion: ${resumeStrength}%`}>
              <div className="bg-[#2B5292] h-full rounded-full transition-all duration-500" style={{ width: `${resumeStrength}%` }}></div>
            </div>
            <div className="flex justify-between w-full text-xs text-gray-400 font-semibold mt-1.5">
              <span>{language === 'th' ? 'ความสมบูรณ์โปรไฟล์' : 'Profile Strength'}</span>
              <span>{resumeStrength}%</span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); navigate('/profile?tab=dashboard'); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-[#2B5292] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Briefcase size={18} />
                <span>{language === 'th' ? 'แผงควบคุม' : 'Dashboard'}</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'dashboard' ? 'text-[#2B5292]' : 'text-gray-300'} />
            </button>

            <button
              onClick={() => { setActiveTab('resume'); navigate('/profile?tab=resume'); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                activeTab === 'resume'
                  ? 'bg-blue-50 text-[#2B5292] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText size={18} />
                <span>{language === 'th' ? 'เรซูเม่ของฉัน' : 'My Resume'}</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'resume' ? 'text-[#2B5292]' : 'text-gray-300'} />
            </button>

            <button
              onClick={() => { setActiveTab('applications'); navigate('/profile?tab=applications'); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                activeTab === 'applications'
                  ? 'bg-blue-50 text-[#2B5292] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileCheck size={18} />
                <span>{language === 'th' ? 'งานที่สมัคร' : 'Applied Jobs'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {applications.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {applications.length}
                  </span>
                )}
                <ChevronRight size={14} className={activeTab === 'applications' ? 'text-[#2B5292]' : 'text-gray-300'} />
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('saved'); navigate('/profile?tab=saved'); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                activeTab === 'saved'
                  ? 'bg-blue-50 text-[#2B5292] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Heart size={18} />
                <span>{language === 'th' ? 'งานที่บันทึกไว้' : 'Saved Jobs'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {savedJobs.length > 0 && (
                  <span className="bg-[#2B5292] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {savedJobs.length}
                  </span>
                )}
                <ChevronRight size={14} className={activeTab === 'saved' ? 'text-[#2B5292]' : 'text-gray-300'} />
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); navigate('/profile?tab=settings'); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-[#2B5292] font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Lock size={18} />
                <span>{language === 'th' ? 'ตั้งค่าโปรไฟล์' : 'Profile Settings'}</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'settings' ? 'text-[#2B5292]' : 'text-gray-300'} />
            </button>
          </nav>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-3">
          
          {/* Messages Toasts */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 shadow-sm transition-all ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <Info size={18} />
              <span className="font-semibold text-sm">{message.text}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin text-[#2B5292] mb-3" size={36} />
              <p className="text-gray-400 font-semibold text-sm">
                {language === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading profile details...'}
              </p>
            </div>
          ) : (
            <>
              {/* 1. DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-[#2B5292] to-[#4a6b9c] rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                      <Sparkles size={180} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">
                        {language === 'th' ? `ยินดีต้อนรับกลับมา, ${user.name || user.username}` : `Welcome back, ${user.name || user.username}`}
                      </h1>
                      <p className="text-blue-100 text-sm mt-1">
                        {language === 'th' ? 'จัดการประวัติใบสมัคร เรซูเม่ และตำแหน่งงานที่บันทึกไว้ได้ในที่เดียว' : 'Manage your applications, resume, and saved jobs in one unified control panel.'}
                      </p>
                    </div>
                    <Link
                      to="/search"
                      className="mt-4 md:mt-0 bg-white text-[#2B5292] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm text-center"
                    >
                      {language === 'th' ? 'ค้นหางานใหม่' : 'Find New Jobs'}
                    </Link>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold uppercase">{language === 'th' ? 'สมัครแล้ว' : 'Applied Jobs'}</p>
                      <h3 className="text-2xl font-black text-gray-800 mt-2">{applications.length}</h3>
                      <p className="text-xs text-green-500 font-bold mt-1.5 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {language === 'th' ? 'อัปเดตล่าสุดวันนี้' : 'Updated today'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold uppercase">{language === 'th' ? 'งานที่บันทึกไว้' : 'Saved Jobs'}</p>
                      <h3 className="text-2xl font-black text-[#2B5292] mt-2">{savedJobs.length}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1.5">
                        {language === 'th' ? 'เก็บไว้พิจารณา' : 'Saved for review'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold uppercase">{language === 'th' ? 'ความสมบูรณ์เรซูเม่' : 'Resume Strength'}</p>
                      <h3 className="text-2xl font-black text-orange-500 mt-2">{resumeStrength}%</h3>
                      <p className="text-xs text-orange-500 font-bold mt-1.5 flex items-center">
                        {resumeStrength < 80 ? (
                          <span>{language === 'th' ? 'กรอกเพิ่มเพื่อดึงดูดใจนายจ้าง' : 'Fill more to attract employers'}</span>
                        ) : (
                          <span className="text-green-500 flex items-center"><CheckCircle size={12} className="mr-1" /> {language === 'th' ? 'ยอดเยี่ยม' : 'Excellent'}</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-gray-400 text-xs font-bold uppercase">{language === 'th' ? 'คนดูโปรไฟล์' : 'Profile Views'}</p>
                      <h3 className="text-2xl font-black text-green-600 mt-2">18</h3>
                      <p className="text-xs text-green-500 font-bold mt-1.5 flex items-center">
                        <span>↑ 25% {language === 'th' ? 'ในสัปดาห์นี้' : 'this week'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Recent Applications Summary */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 text-base">
                        {language === 'th' ? 'ใบสมัครล่าสุด' : 'Recent Applications'}
                      </h3>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-sm font-bold text-[#2B5292] hover:underline"
                      >
                        {language === 'th' ? 'ดูทั้งหมด' : 'View All'}
                      </button>
                    </div>

                    {applications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-sm">
                        {language === 'th' ? 'ยังไม่มีประวัติการสมัครงาน' : 'No job applications submitted yet.'}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 3).map((app) => (
                          <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{app.job.title}</h4>
                              <p className="text-xs text-gray-400 font-semibold mt-1">
                                {app.job.employer?.company || 'Company'} • {app.job.location}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4 mt-3 md:mt-0 justify-between md:justify-end">
                              <span className="text-xs text-gray-400 font-medium">
                                {new Date(app.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                app.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                app.status === 'Reviewed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                app.status === 'Interview' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                app.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                                'bg-green-50 text-green-600 border border-green-200' // Hired
                              }`}>
                                {app.status === 'Pending' ? (language === 'th' ? 'รอพิจารณา' : 'Pending') :
                                 app.status === 'Reviewed' ? (language === 'th' ? 'เปิดอ่านแล้ว' : 'Reviewed') :
                                 app.status === 'Interview' ? (language === 'th' ? 'นัดสัมภาษณ์' : 'Interview') :
                                 app.status === 'Rejected' ? (language === 'th' ? 'ปฏิเสธ' : 'Rejected') :
                                 (language === 'th' ? 'ได้รับคัดเลือก' : 'Offered')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. MY RESUME TAB */}
              {activeTab === 'resume' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                  
                  {/* Header / Mode Toggle */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
                    <div>
                      <h1 className="text-xl font-bold text-gray-800">
                        {language === 'th' ? 'เรซูเม่ประวัติการทำงาน' : 'My Career Resume'}
                      </h1>
                      <p className="text-xs text-gray-400 mt-1">
                        {language === 'th' ? 'สร้างและแก้ไขเรซูเม่ออนไลน์เพื่อใช้สมัครงานทันที' : 'Create and manage your resume online to apply to jobs instantly.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsResumeEditMode(!isResumeEditMode)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm ${
                        isResumeEditMode 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-[#2B5292] text-white hover:bg-[#1a3869]'
                      }`}
                    >
                      {isResumeEditMode ? (
                        <>
                          <Eye size={14} />
                          <span>{language === 'th' ? 'ดูตัวอย่าง' : 'View Mode'}</span>
                        </>
                      ) : (
                        <>
                          <Edit size={14} />
                          <span>{language === 'th' ? 'แก้ไขข้อมูล' : 'Edit Resume'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* RESUME VIEW MODE */}
                  {!isResumeEditMode && (
                    <div className="space-y-8">
                      {/* Personal Info Header */}
                      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300 font-bold border-2 border-gray-100 shadow-inner">
                          {photoUrl ? (
                            <img src={photoUrl} alt="Resume Photo" className="w-full h-full object-cover" />
                          ) : (
                            <User size={48} />
                          )}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                          <h2 className="text-2xl font-extrabold text-gray-800">{fullName || (user.name || user.username)}</h2>
                          <p className="text-[#2B5292] font-bold text-base flex items-center justify-center md:justify-start">
                            <Briefcase size={16} className="mr-1.5" />
                            {targetedJobTitle || (language === 'th' ? 'ระบุตำแหน่งที่คาดหวัง' : 'Click Edit to target job title')}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 font-medium pt-3">
                            <span className="flex items-center justify-center md:justify-start"><span className="font-bold text-gray-700 mr-1">{language === 'th' ? 'โทร:' : 'Phone:'}</span> {phone || '-'}</span>
                            <span className="flex items-center justify-center md:justify-start"><span className="font-bold text-gray-700 mr-1">{language === 'th' ? 'อีเมล:' : 'Email:'}</span> {email || '-'}</span>
                            <span className="flex items-center justify-center md:justify-start md:col-span-2"><span className="font-bold text-gray-700 mr-1">{language === 'th' ? 'ที่อยู่:' : 'Address:'}</span> {address || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* About Me */}
                      {aboutMe && (
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h3 className="font-bold text-gray-800 text-sm mb-2">{language === 'th' ? 'แนะนำตัว' : 'About Me'}</h3>
                          <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{aboutMe}</p>
                        </div>
                      )}

                      {/* Experience timeline */}
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center">
                          <Briefcase size={16} className="mr-2 text-[#2B5292]" />
                          {language === 'th' ? 'ประสบการณ์ทำงาน' : 'Work Experience'}
                        </h3>
                        {experiences.length === 0 ? (
                          <p className="text-xs text-gray-400 italic pl-6">{language === 'th' ? 'ยังไม่ได้เพิ่มข้อมูลการทำงาน' : 'No work experience added.'}</p>
                        ) : (
                          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 pl-6">
                            {experiences.map((exp, idx) => (
                              <div key={idx} className="relative">
                                <div className="absolute -left-[20px] top-1.5 w-3 h-3 rounded-full border-2 border-[#2B5292] bg-white"></div>
                                <h4 className="font-bold text-gray-800 text-sm">{exp.position}</h4>
                                <p className="text-xs text-[#2B5292] font-semibold mt-0.5">{exp.company} | {exp.duration}</p>
                                <p className="text-xs text-gray-500 mt-2 whitespace-pre-line leading-relaxed">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Education list */}
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center">
                          <GraduationCap size={16} className="mr-2 text-[#2B5292]" />
                          {language === 'th' ? 'ประวัติการศึกษา' : 'Education History'}
                        </h3>
                        {educations.length === 0 ? (
                          <p className="text-xs text-gray-400 italic pl-6">{language === 'th' ? 'ยังไม่ได้เพิ่มข้อมูลการศึกษา' : 'No education records added.'}</p>
                        ) : (
                          <div className="space-y-4">
                            {educations.map((edu, idx) => (
                              <div key={idx} className="flex justify-between items-start pl-6 relative">
                                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-gray-400"></div>
                                <div>
                                  <h4 className="font-bold text-gray-800 text-sm">{edu.degree}</h4>
                                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{edu.school}</p>
                                </div>
                                <span className="text-xs text-gray-400 font-bold">{language === 'th' ? `จบปี ${edu.gradYear}` : `Graduated ${edu.gradYear}`}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Skills section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm mb-3 pb-2 border-b border-gray-100 flex items-center">
                            <Code size={16} className="mr-2 text-[#2B5292]" />
                            {language === 'th' ? 'ทักษะทางเทคนิค (Technical)' : 'Technical Skills'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {techSkills ? (
                              techSkills.split(',').map((skill, idx) => (
                                <span key={idx} className="bg-blue-50 text-[#2B5292] text-xs px-3 py-1 rounded-full font-bold border border-blue-100">
                                  {skill.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">{language === 'th' ? 'ไม่มีข้อมูล' : 'No skills listed'}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-800 text-sm mb-3 pb-2 border-b border-gray-100 flex items-center">
                            <Sparkles size={16} className="mr-2 text-orange-500" />
                            {language === 'th' ? 'ทักษะทางสังคม (Soft Skills)' : 'Soft Skills'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {softSkills ? (
                              softSkills.split(',').map((skill, idx) => (
                                <span key={idx} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full font-bold border border-orange-100">
                                  {skill.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">{language === 'th' ? 'ไม่มีข้อมูล' : 'No soft skills listed'}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Languages */}
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center">
                          <Languages size={16} className="mr-2 text-[#2B5292]" />
                          {language === 'th' ? 'ทักษะภาษา' : 'Languages'}
                        </h3>
                        {languagesList.length === 0 ? (
                          <p className="text-xs text-gray-400 italic pl-6">{language === 'th' ? 'ยังไม่ได้เพิ่มข้อมูลภาษา' : 'No languages listed.'}</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                            {languagesList.map((lang, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-gray-800 text-sm">{lang.name}</h4>
                                  <p className="text-[10px] text-gray-400 font-semibold">{lang.level}</p>
                                </div>
                                <div className="flex space-x-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <div key={star} className={`w-2 h-2 rounded-full ${star <= lang.rating ? 'bg-[#2B5292]' : 'bg-gray-200'}`}></div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* RESUME EDIT MODE FORM */}
                  {isResumeEditMode && (
                    <form onSubmit={handleSaveResume} className="space-y-6">
                      
                      {/* Photo Url & Targeted Title */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ลิงก์รูปโปรไฟล์ (URL)' : 'Profile Image URL'}</label>
                          <input 
                            type="text" 
                            value={photoUrl} 
                            onChange={(e) => setPhotoUrl(e.target.value)} 
                            placeholder="https://example.com/photo.jpg"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ตำแหน่งงานที่ต้องการ (จำเป็น)' : 'Targeted Job Title (Required)'}</label>
                          <input 
                            type="text" 
                            required
                            value={targetedJobTitle} 
                            onChange={(e) => setTargetedJobTitle(e.target.value)} 
                            placeholder="Senior Frontend Developer"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]" 
                          />
                        </div>
                      </div>

                      {/* Contact Info Group */}
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 font-bold text-xs text-gray-600 uppercase tracking-wide">
                          {language === 'th' ? 'ข้อมูลติดต่อในเรซูเม่' : 'Contact Information in Resume'}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{language === 'th' ? 'ชื่อ-นามสกุลจริง' : 'Full Name'}</label>
                          <input 
                            type="text" 
                            required
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}</label>
                          <input 
                            type="text" 
                            required
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{language === 'th' ? 'อีเมลสำหรับสมัครงาน' : 'Email'}</label>
                          <input 
                            type="email" 
                            required
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none" 
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{language === 'th' ? 'ที่อยู่อาศัย' : 'Address'}</label>
                          <input 
                            type="text" 
                            required
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            placeholder="กรุงเทพฯ, ประเทศไทย"
                            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">LinkedIn URL</label>
                          <input 
                            type="text" 
                            value={linkedin} 
                            onChange={(e) => setLinkedin(e.target.value)} 
                            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">GitHub URL</label>
                          <input 
                            type="text" 
                            value={github} 
                            onChange={(e) => setGithub(e.target.value)} 
                            className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2 text-sm focus:outline-none" 
                          />
                        </div>
                      </div>

                      {/* About Me */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'แนะนำตัวเองสั้นๆ (About Me)' : 'About Me Description'}</label>
                        <textarea 
                          value={aboutMe} 
                          onChange={(e) => setAboutMe(e.target.value)} 
                          rows={3}
                          placeholder={language === 'th' ? 'เขียนอธิบายทักษะเด่น ประสบการณ์ และเป้าหมายการทำงาน...' : 'Describe your core skills and career expectations...'}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]" 
                        />
                      </div>

                      {/* Experiences form */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <h3 className="font-bold text-gray-700 text-sm">{language === 'th' ? 'ประวัติการทำงาน' : 'Experiences'}</h3>
                          <button 
                            type="button" 
                            onClick={addExperience} 
                            className="text-xs font-bold text-[#2B5292] hover:text-blue-700 flex items-center space-x-1"
                          >
                            <Plus size={14} />
                            <span>{language === 'th' ? 'เพิ่มประสบการณ์' : 'Add Experience'}</span>
                          </button>
                        </div>

                        {experiences.map((exp, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 relative">
                            <button 
                              type="button" 
                              onClick={() => removeExperience(idx)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ชื่อบริษัท' : 'Company Name'}</label>
                                <input 
                                  type="text" 
                                  required
                                  value={exp.company} 
                                  onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                  className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ตำแหน่งงาน' : 'Position'}</label>
                                <input 
                                  type="text" 
                                  required
                                  value={exp.position} 
                                  onChange={(e) => handleExperienceChange(idx, 'position', e.target.value)}
                                  className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ระยะเวลา (เช่น 2024 - ปัจจุบัน)' : 'Duration (e.g. 2024 - Present)'}</label>
                                <input 
                                  type="text" 
                                  required
                                  value={exp.duration} 
                                  onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                                  className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'รายละเอียดงาน' : 'Responsibilities'}</label>
                              <textarea 
                                value={exp.description} 
                                onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                rows={2}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Educations form */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <h3 className="font-bold text-gray-700 text-sm">{language === 'th' ? 'ประวัติการศึกษา' : 'Educations'}</h3>
                          <button 
                            type="button" 
                            onClick={addEducation} 
                            className="text-xs font-bold text-[#2B5292] hover:text-blue-700 flex items-center space-x-1"
                          >
                            <Plus size={14} />
                            <span>{language === 'th' ? 'เพิ่มประวัติการศึกษา' : 'Add Education'}</span>
                          </button>
                        </div>

                        {educations.map((edu, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                            <button 
                              type="button" 
                              onClick={() => removeEducation(idx)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'สถาบันการศึกษา' : 'School/University'}</label>
                              <input 
                                type="text" 
                                required
                                value={edu.school} 
                                onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'วุฒิการศึกษา' : 'Degree'}</label>
                              <input 
                                type="text" 
                                required
                                value={edu.degree} 
                                onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ปีที่สำเร็จการศึกษา' : 'Graduation Year'}</label>
                              <input 
                                type="text" 
                                required
                                value={edu.gradYear} 
                                onChange={(e) => handleEducationChange(idx, 'gradYear', e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Technical & Soft Skills text area */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ทักษะเฉพาะทาง (Technical Skills - คั่นด้วยจุลภาค ,)' : 'Technical Skills (comma-separated ,)'}</label>
                          <textarea 
                            value={techSkills} 
                            onChange={(e) => setTechSkills(e.target.value)} 
                            placeholder="React, JavaScript, Node.js, Tailwind"
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ทักษะทางสังคม (Soft Skills - คั่นด้วยจุลภาค ,)' : 'Soft Skills (comma-separated ,)'}</label>
                          <textarea 
                            value={softSkills} 
                            onChange={(e) => setSoftSkills(e.target.value)} 
                            placeholder="Communication, Teamwork, Critical Thinking"
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]" 
                          />
                        </div>
                      </div>

                      {/* Languages form */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <h3 className="font-bold text-gray-700 text-sm">{language === 'th' ? 'ทักษะทางภาษา' : 'Languages'}</h3>
                          <button 
                            type="button" 
                            onClick={addLanguage} 
                            className="text-xs font-bold text-[#2B5292] hover:text-blue-700 flex items-center space-x-1"
                          >
                            <Plus size={14} />
                            <span>{language === 'th' ? 'เพิ่มภาษา' : 'Add Language'}</span>
                          </button>
                        </div>

                        {languagesList.map((lang, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                            <button 
                              type="button" 
                              onClick={() => removeLanguage(idx)}
                              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ภาษา' : 'Language'}</label>
                              <input 
                                type="text" 
                                required
                                value={lang.name} 
                                onChange={(e) => handleLanguageChange(idx, 'name', e.target.value)}
                                placeholder="English"
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ระดับ (เช่น ดีมาก, พอใช้)' : 'Level (e.g. Fluent, Intermediate)'}</label>
                              <input 
                                type="text" 
                                required
                                value={lang.level} 
                                onChange={(e) => handleLanguageChange(idx, 'level', e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'คะแนนทักษะ (1 - 5)' : 'Rating (1 - 5)'}</label>
                              <select 
                                value={lang.rating} 
                                onChange={(e) => handleLanguageChange(idx, 'rating', Number(e.target.value))}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none" 
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <option key={star} value={star}>{star}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Save buttons */}
                      <div className="flex space-x-3 justify-end pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setIsResumeEditMode(false)}
                          className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-200"
                        >
                          {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-[#2B5292] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#1a3869] flex items-center space-x-2 shadow-sm disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Save size={16} />
                          )}
                          <span>{language === 'th' ? 'บันทึกเรซูเม่' : 'Save Resume'}</span>
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              )}

              {/* 3. APPLICATIONS TAB */}
              {activeTab === 'applications' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h1 className="text-xl font-bold text-gray-800">
                      {language === 'th' ? 'ประวัติการสมัครงาน' : 'Application History'}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                      {language === 'th' ? 'ติดตามสถานะใบสมัครที่คุณส่งหาบริษัทประกอบการต่างๆ' : 'Track the real-time status of your job applications.'}
                    </p>
                  </div>

                  {applications.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                      {language === 'th' ? 'คุณยังไม่มีประวัติการสมัครงานในขณะนี้' : 'You have not applied for any jobs yet.'}
                      <Link to="/search" className="block text-[#2B5292] font-bold mt-2 hover:underline">
                        {language === 'th' ? 'ค้นหางานเพื่อสมัคร →' : 'Explore jobs to apply now →'}
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-semibold text-xs">
                            <th className="pb-3">{language === 'th' ? 'ตำแหน่งงาน / บริษัท' : 'Job Details'}</th>
                            <th className="pb-3">{language === 'th' ? 'สถานที่' : 'Location'}</th>
                            <th className="pb-3">{language === 'th' ? 'วันที่สมัคร' : 'Applied Date'}</th>
                            <th className="pb-3">{language === 'th' ? 'สถานะใบสมัคร' : 'Status'}</th>
                            <th className="pb-3 text-right">{language === 'th' ? 'จัดการ' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4">
                                <h4 className="font-bold text-gray-800 text-sm">{app.job.title}</h4>
                                <span className="text-xs text-gray-400 font-semibold mt-0.5 block">{app.job.employer?.company || 'Company'}</span>
                              </td>
                              <td className="py-4">
                                <span className="text-xs text-gray-500 font-medium">{app.job.location}</span>
                              </td>
                              <td className="py-4">
                                <span className="text-xs text-gray-500 font-medium">
                                  {new Date(app.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                  app.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                  app.status === 'Reviewed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                  app.status === 'Interview' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                  app.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                                  'bg-green-50 text-green-600 border border-green-200' // Hired
                                }`}>
                                  {app.status === 'Pending' ? (language === 'th' ? 'รอพิจารณา' : 'Pending') :
                                   app.status === 'Reviewed' ? (language === 'th' ? 'เปิดอ่านแล้ว' : 'Reviewed') :
                                   app.status === 'Interview' ? (language === 'th' ? 'นัดสัมภาษณ์' : 'Interview') :
                                   app.status === 'Rejected' ? (language === 'th' ? 'ปฏิเสธ' : 'Rejected') :
                                   (language === 'th' ? 'ได้รับคัดเลือก' : 'Offered')}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <Link
                                  to={`/job/${app.jobId}`}
                                  className="text-xs font-bold text-[#2B5292] hover:text-blue-700"
                                >
                                  {language === 'th' ? 'ดูรายละเอียดงาน' : 'View Job'}
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. SAVED JOBS TAB */}
              {activeTab === 'saved' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h1 className="text-xl font-bold text-gray-800">
                      {language === 'th' ? 'งานที่บันทึกไว้' : 'Saved Jobs'}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                      {language === 'th' ? 'ตำแหน่งงานที่คุณถูกใจบันทึกไว้เพื่อพิจารณาสมัครภายหลัง' : 'View and manage jobs you bookmarked.'}
                    </p>
                  </div>

                  {savedJobs.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                      {language === 'th' ? 'ยังไม่มีประกาศงานที่บันทึกไว้' : 'No saved jobs.'}
                      <Link to="/search" className="block text-[#2B5292] font-bold mt-2 hover:underline">
                        {language === 'th' ? 'ไปหน้ารายการงานเพื่อเลือกบันทึกงาน →' : 'Find jobs to bookmark now →'}
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedJobs.map((job) => (
                        <div key={job.id} className="p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between bg-white">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="bg-blue-50 text-[#2B5292] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                                {job.workType}
                              </span>
                              <button
                                onClick={() => handleRemoveSavedJob(job.id)}
                                className="text-red-400 hover:text-red-600 p-1"
                                title={language === 'th' ? 'ลบออกจากบันทึก' : 'Remove bookmark'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mt-2 line-clamp-1">{job.title}</h3>
                            <p className="text-xs text-[#2B5292] font-semibold mt-0.5">{job.employer?.company || 'Company'}</p>
                            
                            <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-medium mt-3">
                              <span className="flex items-center"><MapPin size={12} className="mr-1" /> {job.location}</span>
                              <span className="flex items-center"><DollarSign size={12} className="mr-0.5" /> {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                            <Link
                              to={`/job/${job.id}`}
                              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-lg font-bold text-xs transition-colors"
                            >
                              {language === 'th' ? 'ดูรายละเอียด' : 'Details'}
                            </Link>
                            <Link
                              to={`/apply/${job.id}`}
                              className="flex-1 text-center bg-[#2B5292] hover:bg-[#1a3869] text-white py-2 rounded-lg font-bold text-xs transition-colors"
                            >
                              {language === 'th' ? 'สมัครงานเลย' : 'Apply Now'}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4">
                  
                  {/* Settings sub sidebar */}
                  <div className="md:col-span-1 border-r border-gray-100 bg-gray-50/50 p-4 space-y-1">
                    <button
                      onClick={() => setActiveSettingsTab('personal')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeSettingsTab === 'personal' ? 'bg-[#2B5292] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {language === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Info'}
                    </button>
                    <button
                      onClick={() => setActiveSettingsTab('career')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeSettingsTab === 'career' ? 'bg-[#2B5292] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {language === 'th' ? 'ข้อมูลอาชีพ' : 'Career Info'}
                    </button>
                    <button
                      onClick={() => setActiveSettingsTab('notifications')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeSettingsTab === 'notifications' ? 'bg-[#2B5292] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {language === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
                    </button>
                    <button
                      onClick={() => setActiveSettingsTab('privacy')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeSettingsTab === 'privacy' ? 'bg-[#2B5292] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {language === 'th' ? 'ความเป็นส่วนตัว' : 'Privacy & Terms'}
                    </button>
                    <button
                      onClick={() => setActiveSettingsTab('account')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeSettingsTab === 'account' ? 'bg-[#2B5292] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {language === 'th' ? 'บัญชีผู้ใช้งาน' : 'Account Details'}
                    </button>
                  </div>

                  {/* Settings content area */}
                  <div className="md:col-span-3 p-6 md:p-8">
                    
                    {/* Settings: Personal Info Sub-tab */}
                    {activeSettingsTab === 'personal' && (
                      <form onSubmit={handleUpdateAccount} className="space-y-6">
                        <div className="border-b border-gray-100 pb-3 mb-4">
                          <h3 className="font-bold text-gray-800 text-sm">{language === 'th' ? 'ข้อมูลติดต่อทั่วไป' : 'Personal Info & Contact'}</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5">{language === 'th' ? 'ข้อมูลนี้จะนำไปแสดงในข้อมูลติดต่อบนใบสมัครงานหลักของคุณ' : 'Used for contact details in your profile settings.'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ชื่อจริง - นามสกุล' : 'Full Name'}</label>
                          <input
                            type="text"
                            required
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'อีเมลติดต่อ' : 'Contact Email'}</label>
                          <input
                            type="email"
                            required
                            value={settingsEmail}
                            onChange={(e) => setSettingsEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-[#2B5292] hover:bg-[#1a3869] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                          {actionLoading && <Loader2 size={12} className="animate-spin" />}
                          <span>{language === 'th' ? 'บันทึกข้อมูลส่วนตัว' : 'Save Personal Details'}</span>
                        </button>
                      </form>
                    )}

                    {/* Settings: Career Info Sub-tab */}
                    {activeSettingsTab === 'career' && (
                      <form onSubmit={handleSaveResume} className="space-y-6">
                        <div className="border-b border-gray-100 pb-3 mb-4">
                          <h3 className="font-bold text-gray-800 text-sm">{language === 'th' ? 'ข้อมูลอาชีพและตำแหน่งงาน' : 'Career Details'}</h3>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ตำแหน่งงานที่ตั้งเป้าหมายไว้' : 'Targeted Job Title'}</label>
                          <input
                            type="text"
                            required
                            value={targetedJobTitle}
                            onChange={(e) => setTargetedJobTitle(e.target.value)}
                            placeholder="Senior Frontend Developer"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'แนะนำตัวสั้นๆ เกี่ยวกับคุณ' : 'About Me'}</label>
                          <textarea
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-[#2B5292] hover:bg-[#1a3869] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                          {actionLoading && <Loader2 size={12} className="animate-spin" />}
                          <span>{language === 'th' ? 'บันทึกข้อมูลอาชีพ' : 'Save Career Details'}</span>
                        </button>
                      </form>
                    )}

                    {/* Settings: Notifications Sub-tab */}
                    {activeSettingsTab === 'notifications' && (
                      <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-3 mb-4">
                          <h3 className="font-bold text-gray-800 text-sm">{language === 'th' ? 'ตั้งค่าการแจ้งเตือน' : 'Notification Preferences'}</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                            <div>
                              <h4 className="font-bold text-gray-700 text-xs">{language === 'th' ? 'ส่งอีเมลแนะนำตำแหน่งงานที่ตรงกัน' : 'Email Alerts for Job Matches'}</h4>
                              <p className="text-[10px] text-gray-400">{language === 'th' ? 'รับอีเมลแจ้งเตือนเมื่อมีระบบแนะนำงานที่ตรงกับตำแหน่งเป้าหมายของคุณ' : 'Receive regular emails matching your targeted job title.'}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifEmailMatches}
                              onChange={(e) => setNotifEmailMatches(e.target.checked)}
                              className="w-4 h-4 text-[#2B5292] border-gray-300 rounded focus:ring-[#2B5292]"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                            <div>
                              <h4 className="font-bold text-gray-700 text-xs">{language === 'th' ? 'รับอีเมลเมื่อสถานะใบสมัครเปลี่ยน' : 'Application Status Update'}</h4>
                              <p className="text-[10px] text-gray-400">{language === 'th' ? 'แจ้งเตือนทันทีเมื่อนายจ้างเปิดอ่านใบสมัครหรือเปลี่ยนสถานะ' : 'Receive instant status updates from employers.'}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifAppStatus}
                              onChange={(e) => setNotifAppStatus(e.target.checked)}
                              className="w-4 h-4 text-[#2B5292] border-gray-300 rounded focus:ring-[#2B5292]"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setMessage({ type: 'success', text: language === 'th' ? 'บันทึกการตั้งค่าแจ้งเตือนสำเร็จ' : 'Notification settings updated.' })}
                          className="bg-[#2B5292] hover:bg-[#1a3869] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
                        >
                          {language === 'th' ? 'บันทึกการตั้งค่า' : 'Save Preferences'}
                        </button>
                      </div>
                    )}

                    {/* Settings: Privacy Sub-tab */}
                    {activeSettingsTab === 'privacy' && (
                      <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-3 mb-4">
                          <h3 className="font-bold text-gray-800 text-sm">{language === 'th' ? 'ความเป็นส่วนตัวและความปลอดภัย' : 'Privacy Settings'}</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                            <div>
                              <h4 className="font-bold text-gray-700 text-xs">{language === 'th' ? 'เปิดโปรไฟล์สาธารณะ' : 'Public Profile Visibility'}</h4>
                              <p className="text-[10px] text-gray-400">{language === 'th' ? 'อนุญาตให้นายจ้างทั้งหมดบนระบบสามารถค้นหาและเข้าชมเรซูเม่ออนไลน์ของคุณได้' : 'Allow employers to search and view your resume.'}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacyPublic}
                              onChange={(e) => setPrivacyPublic(e.target.checked)}
                              className="w-4 h-4 text-[#2B5292] border-gray-300 rounded focus:ring-[#2B5292]"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                            <div>
                              <h4 className="font-bold text-gray-700 text-xs">{language === 'th' ? 'ซ่อนข้อมูลส่วนตัวเมื่อส่งใบสมัคร (Anonymous)' : 'Anonymize application details'}</h4>
                              <p className="text-[10px] text-gray-400">{language === 'th' ? 'ระบบจะปิดบังชื่อ เบอร์โทร และรูปภาพของคุณจนกว่าคุณจะตอบรับแชท' : 'Anonymize email and phone details initially.'}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacyAnonymize}
                              onChange={(e) => setPrivacyAnonymize(e.target.checked)}
                              className="w-4 h-4 text-[#2B5292] border-gray-300 rounded focus:ring-[#2B5292]"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setMessage({ type: 'success', text: language === 'th' ? 'อัปเดตการตั้งค่าความเป็นส่วนตัวสำเร็จ' : 'Privacy settings updated.' })}
                          className="bg-[#2B5292] hover:bg-[#1a3869] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
                        >
                          {language === 'th' ? 'บันทึกความเป็นส่วนตัว' : 'Save Privacy'}
                        </button>
                      </div>
                    )}

                    {/* Settings: Account Sub-tab */}
                    {activeSettingsTab === 'account' && (
                      <div className="space-y-6">
                        
                        {/* Account Verification Widget */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <h4 className="font-bold text-gray-800 text-xs mb-1 flex items-center">
                            <Shield size={16} className="text-[#2B5292] mr-1.5" />
                            {language === 'th' ? 'สถานะการยืนยันตัวตน' : 'Identity Verification'}
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            {language === 'th' ? 'ยืนยันตัวตนเพื่อรับเครื่องหมายยืนยันความน่าเชื่อถือระดับทอง ดึงดูดนายจ้างมากขึ้น 3 เท่า!' : 'Verify your profile to stand out from other candidates.'}
                          </p>

                          {isVerified ? (
                            <div className="mt-4 flex items-center space-x-2 text-green-600 text-xs font-bold">
                              <CheckCircle size={16} />
                              <span>{language === 'th' ? 'ยืนยันตัวตนสำเร็จแล้ว (Verified)' : 'Identity Verified'}</span>
                            </div>
                          ) : (
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                                {language === 'th' ? 'ยังไม่ได้ยืนยัน' : 'Not Verified'}
                              </span>
                              <button
                                onClick={() => setShowVerifyModal(true)}
                                className="bg-[#2B5292] hover:bg-[#1a3869] text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors"
                              >
                                {language === 'th' ? 'ยืนยันตัวตนทันที' : 'Verify Now'}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Account Profile Edit Form */}
                        <form onSubmit={handleUpdateAccount} className="space-y-6">
                          <div className="border-b border-gray-100 pb-3 mb-4">
                            <h3 className="font-bold text-gray-800 text-sm">{language === 'th' ? 'ตั้งค่าความปลอดภัยบัญชีผู้ใช้' : 'Account Credentials'}</h3>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">{language === 'th' ? 'ชื่อผู้ใช้งาน (Username)' : 'Username'}</label>
                            <input
                              type="text"
                              required
                              value={settingsUsername}
                              onChange={(e) => setSettingsUsername(e.target.value)}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#2B5292]"
                            />
                          </div>

                          <div className="bg-gray-50/50 p-4 border border-gray-200 rounded-xl space-y-4">
                            <p className="font-bold text-xs text-gray-600">{language === 'th' ? 'ต้องการเปลี่ยนรหัสผ่านหรือไม่?' : 'Change Password'}</p>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)' : 'New Password'}</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{language === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="bg-[#2B5292] hover:bg-[#1a3869] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                          >
                            {actionLoading && <Loader2 size={12} className="animate-spin" />}
                            <span>{language === 'th' ? 'อัปเดตข้อมูลบัญชี' : 'Save Account Settings'}</span>
                          </button>
                        </form>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </>
          )}

        </div>

      </div>

      {/* IDENTITY VERIFICATION MOCK MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm flex items-center">
                <Shield size={16} className="text-[#2B5292] mr-2" />
                {language === 'th' ? 'ขั้นตอนการยืนยันตัวตน' : 'Identity Verification'}
              </h3>
              <button onClick={resetVerifyModal} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 space-y-4">
              {!verificationSuccess ? (
                <>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {language === 'th' 
                      ? 'ข้อมูลของท่านจะถูกเก็บรักษาเป็นความลับและเข้าถึงเพื่อการตรวจสอบคุณสมบัติของผู้สมัครงานจริงเท่านั้น' 
                      : 'Your details will remain strictly confidential and will only be used to check eligibility.'}
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">{language === 'th' ? 'ประเภทบัตรที่ต้องการใช้' : 'Document Type'}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIdType('national_id')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                          idType === 'national_id' 
                            ? 'border-[#2B5292] bg-blue-50/50 text-[#2B5292]' 
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {language === 'th' ? 'บัตรประชาชน' : 'National ID Card'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdType('passport')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                          idType === 'passport' 
                            ? 'border-[#2B5292] bg-blue-50/50 text-[#2B5292]' 
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {language === 'th' ? 'หนังสือเดินทาง (Passport)' : 'Passport'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      {idType === 'national_id' ? (language === 'th' ? 'เลขบัตรประจำตัวประชาชน 13 หลัก' : '13-Digit ID Number') : (language === 'th' ? 'เลขหนังสือเดินทาง (Passport No.)' : 'Passport Number')}
                    </label>
                    <input
                      type="text"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={idType === 'national_id' ? "x-xxxx-xxxxx-xx-x" : "Axxxxxxxx"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2B5292]"
                    />
                  </div>

                  {/* Drag and drop mock */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">{language === 'th' ? 'อัปโหลดภาพถ่ายบัตร' : 'Upload Document Image'}</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                      <Award size={24} className="text-gray-400 mb-2" />
                      <span className="text-[10px] font-bold text-gray-500 text-center">{language === 'th' ? 'คลิกหรือวางภาพถ่ายบัตรประชาชน/หน้าพาสปอร์ต' : 'Click to select or drop passport page/ID card'}</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">PNG, JPG, PDF (Max. 5MB)</span>
                    </div>
                  </div>

                  {/* Progress loading animation */}
                  {verifying && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>{language === 'th' ? 'กำลังตรวจสอบข้อมูล...' : 'Verifying details...'}</span>
                        <span>{verifyProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#2B5292] h-full rounded-full transition-all duration-300" style={{ width: `${verifyProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 border-t border-gray-100 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={resetVerifyModal}
                      disabled={verifying}
                      className="bg-gray-100 text-gray-600 font-bold text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={triggerIdentityVerification}
                      disabled={verifying}
                      className="bg-[#2B5292] hover:bg-[#1a3869] text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {verifying && <Loader2 size={12} className="animate-spin" />}
                      <span>{language === 'th' ? 'ส่งคำขอยืนยันตัวตน' : 'Submit Verification'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center border-4 border-white shadow-md mb-2">
                    <CheckCircle size={32} className="animate-bounce" />
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-sm">
                    {language === 'th' ? 'ยืนยันตัวตนสำเร็จแล้ว!' : 'Identity Verified Successfully!'}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
                    {language === 'th' 
                      ? 'บัญชีของท่านได้รับการยืนยันระดับทองเรียบร้อยแล้ว เครื่องหมายถูกสีเขียวจะไปแสดงข้างชื่อโปรไฟล์ของท่าน' 
                      : 'Your gold badge is now active. A verification checkmark will display beside your profile name.'}
                  </p>
                  <button
                    type="button"
                    onClick={resetVerifyModal}
                    className="bg-[#2B5292] text-white font-bold text-xs px-6 py-2 rounded-xl mt-2 shadow-sm hover:bg-[#1a3869] transition-colors"
                  >
                    {language === 'th' ? 'เสร็จสิ้น' : 'Done'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
