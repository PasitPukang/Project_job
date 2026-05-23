import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Building2, ChevronDown, Clock, Loader2, Briefcase, Heart } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState(0);

  // Pagination state
  const JOBS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state with search parameters from URL (e.g. popular tags clicked on Home page)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);
    const cat = searchParams.get('category');
    if (cat !== null) setCategoryFilter(cat);
    const sal = searchParams.get('salary');
    if (sal !== null) setSalaryFilter(Number(sal));
    const wt = searchParams.get('workType');
    if (wt !== null) setJobTypeFilter(wt);
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/jobs');
      if (!response.ok) throw new Error(language === 'th' ? 'ไม่สามารถโหลดข้อมูลงานได้' : 'Failed to fetch jobs');
      const data = await response.json();
      // Show only Active job listings
      setJobs(data.filter(job => job.status === 'Active'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [savedJobsIds, setSavedJobsIds] = useState(() => {
    return JSON.parse(localStorage.getItem('savedJobs') || '[]');
  });

  const toggleSaveJob = (jobId) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert(language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนบันทึกงาน' : 'Please login first to save jobs');
      navigate('/login/seeker');
      return;
    }
    
    let updated;
    if (savedJobsIds.includes(jobId)) {
      updated = savedJobsIds.filter(id => id !== jobId);
    } else {
      updated = [...savedJobsIds, jobId];
    }
    setSavedJobsIds(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  const handleApplyClick = (jobId) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert(language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนทำการสมัครงาน' : 'Please log in to apply for a job');
      navigate('/login/seeker');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role === 'employer') {
      alert(language === 'th' ? 'บัญชีผู้ประกอบการไม่สามารถสมัครงานได้' : 'Employer accounts cannot apply for jobs');
      return;
    }

    // Redirect to the Bilingual Resume Apply Wizard
    navigate(`/apply/${jobId}`);
  };

  const filteredJobs = jobs.filter(job => {
    // 1. Keyword search (looks in title, category, department, company name)
    const matchSearch = searchTerm === '' ? true : (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.employer?.company && job.employer.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.employer?.name && job.employer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 2. Location filter
    const matchLocation = locationFilter ? job.location === locationFilter : true;

    // 3. Category filter
    const matchCategory = categoryFilter ? job.category === categoryFilter : true;

    // 4. Job workplace type filter
    const matchJobType = jobTypeFilter ? job.workType === jobTypeFilter : true;

    // 5. Expected salary logic:
    // If salaryFilter > 0, make sure the job meets candidate expectations:
    // - If both min and max are 0, it is negotiable. Filter it out when salaryFilter > 0.
    // - If salaryMax > 0, verify salaryMax >= salaryFilter
    // - Otherwise, verify salaryMin >= salaryFilter
    const matchSalary = salaryFilter === 0 ? true : (
      (job.salaryMin === 0 && job.salaryMax === 0) ? false : (
        job.salaryMax > 0 ? job.salaryMax >= salaryFilter : job.salaryMin >= salaryFilter
      )
    );

    return matchSearch && matchLocation && matchCategory && matchJobType && matchSalary;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, categoryFilter, jobTypeFilter, salaryFilter]);

  // Slice for current page
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Header Section */}
      <div className="bg-[#e2e8f0] border-b border-gray-300 py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-2xl font-black text-gray-800 mb-6">
            {language === 'th' ? (
              <>ค้นหางาน จากตำแหน่งงานกว่า <span className="text-[#2B5292]">10,000+ อัตรา</span></>
            ) : (
              <>Search over <span className="text-[#2B5292]">10,000+ Job Positions</span></>
            )}
          </h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Inputs */}
            <div className="flex-1 space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2B5292]">
                  <SearchIcon size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B5292]/20 focus:border-[#2B5292] text-sm text-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2B5292]">
                    <MapPin size={18} />
                  </div>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#2B5292]/20 focus:border-[#2B5292] text-sm text-gray-700 shadow-sm"
                  >
                    <option value="">{language === 'th' ? 'สถานที่ทั้งหมด' : 'All Locations'}</option>
                    <option value="Bangkok">{language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'}</option>
                    <option value="Chiang Mai">{language === 'th' ? 'เชียงใหม่' : 'Chiang Mai'}</option>
                    <option value="Phuket">{language === 'th' ? 'ภูเก็ต' : 'Phuket'}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2B5292]">
                    <Building2 size={18} />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#2B5292]/20 focus:border-[#2B5292] text-sm text-gray-700 shadow-sm"
                  >
                    <option value="">{language === 'th' ? 'สาขาทั้งหมด' : 'All Categories'}</option>
                    <option value="IT">IT / Programming</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-gray-300 mx-2"></div>

            {/* Right Filters */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t('filterWorkType')}</div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobTypeFilter === ''}
                      onChange={() => setJobTypeFilter('')}
                      className="w-4 h-4 text-[#2B5292] focus:ring-[#2B5292]"
                    />
                    <span>{t('all')}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobTypeFilter === 'On-site'}
                      onChange={() => setJobTypeFilter('On-site')}
                      className="w-4 h-4 text-[#2B5292] focus:ring-[#2B5292]"
                    />
                    <span>On-site</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobTypeFilter === 'Hybrid'}
                      onChange={() => setJobTypeFilter('Hybrid')}
                      className="w-4 h-4 text-[#2B5292] focus:ring-[#2B5292]"
                    />
                    <span>Hybrid</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobTypeFilter === 'Remote'}
                      onChange={() => setJobTypeFilter('Remote')}
                      className="w-4 h-4 text-[#2B5292] focus:ring-[#2B5292]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('expectedSalary')}</div>
                  <div className="text-sm font-bold text-[#2B5292]">
                    {salaryFilter > 0 ? `≥ ฿${salaryFilter.toLocaleString()}` : (language === 'th' ? 'ไม่ระบุ' : 'Any')}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="5000"
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B5292]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>฿0</span>
                  <span>฿150k+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">
            {language === 'th' ? (
              <>พบงานทั้งหมด <span className="text-[#2B5292]">{filteredJobs.length}</span> อัตรา</>
            ) : (
              <>Found <span className="text-[#2B5292]">{filteredJobs.length}</span> positions</>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#2B5292]" size={40} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center font-semibold">{error}</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-gray-200">
            <div className="text-gray-300 mb-4 flex justify-center"><SearchIcon size={56} /></div>
            <h3 className="text-xl font-bold text-gray-800">{t('noJobsFound')}</h3>
            <p className="text-gray-500 mt-2 text-sm">
              {language === 'th' ? 'ลองปรับเปลี่ยนคำค้นหา หรือรูปแบบงานดูอีกครั้ง' : 'Try adjusting your keywords or filter parameters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex gap-4">
                    {/* Company Logo Placeholder */}
                    <div className="w-16 h-16 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="text-[#2B5292]" size={28} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#2B5292] hover:underline">
                        <Link to={`/job/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-gray-800 font-semibold text-sm">
                        {job.employer?.company || job.employer?.name || (language === 'th' ? 'ผู้ประกอบการ' : 'Employer')}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{job.department}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1 font-medium">
                          <MapPin size={14} className="text-[#2B5292]" /> {job.location}
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <Briefcase size={14} className="text-[#2B5292]" /> {job.workType}
                        </div>
                        {(job.salaryMin > 0 || job.salaryMax > 0) ? (
                          <div className="flex items-center gap-1 font-bold text-emerald-600">
                            ฿{job.salaryMin ? job.salaryMin.toLocaleString() : 0} - {job.salaryMax ? job.salaryMax.toLocaleString() : (language === 'th' ? 'ไม่ระบุ' : 'Any')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-bold text-gray-500">
                            {t('negotiable')}
                          </div>
                        )}
                        <div className="flex items-center gap-1 font-medium">
                          <Clock size={14} className="text-gray-400" /> {new Date(job.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <span className="bg-blue-50 text-[#2B5292] text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                      {job.category}
                    </span>
                    
                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <Link 
                        to={`/job/${job.id}`} 
                        className="bg-white border border-[#2B5292] text-[#2B5292] hover:bg-blue-50 px-4 py-2 rounded-xl font-bold transition-all text-xs text-center flex-1 md:flex-none"
                      >
                        {t('viewDetails')}
                      </Link>
                      
                      {job.employerId && (
                        <Link 
                          to={`/company/${job.employerId}`} 
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold transition-all text-xs text-center flex-1 md:flex-none"
                        >
                          {t('aboutCompany')}
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleApplyClick(job.id)}
                        className="bg-[#2B5292] hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-bold transition-all text-xs flex-1 md:flex-none"
                      >
                        {t('applyBtn')}
                      </button>
                      
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 border rounded-xl font-bold transition-all text-xs flex items-center justify-center shrink-0 ${
                          savedJobsIds.includes(job.id)
                            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                            : 'border-gray-300 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                        title={savedJobsIds.includes(job.id) ? (language === 'th' ? 'ยกเลิกการบันทึก' : 'Unsave Job') : (language === 'th' ? 'บันทึกงาน' : 'Save Job')}
                      >
                        <Heart size={16} fill={savedJobsIds.includes(job.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 pb-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'th' ? '← ก่อนหน้า' : '← Prev'}
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // แสดงแค่ 5 หน้าแวดล้อม currentPage เพื่อไม่ให้ล้น
                      return page === 1 || page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2);
                    })
                    .reduce((acc, page, idx, arr) => {
                      // เพิ่ม ... เมื่อมีช่องว่าง
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push('...');
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                            currentPage === item
                              ? 'bg-[#2B5292] text-white shadow-md'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )
                  }
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'th' ? 'ถัดไป →' : 'Next →'}
                </button>
              </div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
              <p className="text-center text-xs text-gray-400 pb-4">
                {language === 'th'
                  ? `หน้า ${currentPage} จาก ${totalPages} หน้า`
                  : `Page ${currentPage} of ${totalPages}`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
