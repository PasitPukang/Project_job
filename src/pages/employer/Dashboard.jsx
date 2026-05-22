import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Calendar, Mail, PlusCircle, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const employerName = user ? (user.company || user.name) : 'Employer';

  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    totalInterviews: 0,
    unreadMessages: 0
  });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const funnelData = [
    { label: t('appliedStage'), count: stats.totalApplicants || 0, percentage: 100 },
    { label: t('screenedStage'), count: Math.floor(stats.totalApplicants * 0.4) || 0, percentage: 40 },
    { label: t('interviewedStage'), count: stats.totalInterviews || 0, percentage: 19 },
    { label: t('offeredStage'), count: Math.floor(stats.totalInterviews * 0.25) || 0, percentage: 4 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
      if (!user || !user.token) return; // Not logged in

    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch(`http://localhost:5000/api/dashboard/stats/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch jobs
      const jobsRes = await fetch(`http://localhost:5000/api/jobs/employer/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        
        // Filter active jobs
        const active = jobsData.filter(job => job.status === 'Active').slice(0, 3);
        setActiveJobs(active);

        // Generate fake recent applicants based on active jobs (since backend doesn't have applicants table yet)
        const mockApplicants = [
          { name: "David Chen", role: active[0]?.title || "Senior Product Manager", date: "Oct 24" },
          { name: "Elena Rodriguez", role: active[1]?.title || "UX Designer", date: "Oct 24" },
          { name: "Marcus Johnson", role: active[0]?.title || "Data Analyst", date: "Oct 23" },
          { name: "Aisha Patel", role: active[2]?.title || "Backend Developer", date: "Oct 22" },
        ];
        setRecentApplicants(mockApplicants);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b2463] mb-2">{t('welcomeBack')}{employerName}</h1>
        <p className="text-gray-600">{t('recruitmentToday')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('totalActiveJobs')}</h3>
            <Briefcase size={18} className="text-[#3a5078]" />
          </div>
          <div className="text-4xl font-bold text-[#0b2463]">
            {loading ? '...' : stats.activeJobs}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('newApplicants7Days')}</h3>
            <Users size={18} className="text-[#3a5078]" />
          </div>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold text-[#0b2463]">
              {loading ? '...' : stats.totalApplicants}
            </div>
            <div className="text-sm font-medium text-green-600 mb-1">↑14%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('interviews')}</h3>
            <Calendar size={18} className="text-[#3a5078]" />
          </div>
          <div className="text-4xl font-bold text-[#0b2463]">
            {loading ? '...' : stats.totalInterviews}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t('unreadMessages')}</h3>
            <Mail size={18} className="text-[#3a5078]" />
          </div>
          <div className="text-4xl font-bold text-[#0b2463]">
            {loading ? '...' : stats.unreadMessages}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Applicants */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0b2463]">{t('recentApplicantsTitle')}</h2>
              <a href="#" className="text-sm font-medium text-[#3a5078] hover:underline">{t('viewAll')}</a>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="p-4 pl-6">{t('nameCol')}</th>
                  <th className="p-4">{t('roleCol')}</th>
                  <th className="p-4 pr-6">{t('dateCol')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentApplicants.map((app, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="p-4 pl-6 font-bold text-[#0b2463]">{app.name}</td>
                    <td className="p-4 text-gray-600">{app.role}</td>
                    <td className="p-4 pr-6 text-gray-500">{app.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hiring Funnel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#0b2463] mb-6">{t('hiringFunnelTitle')}</h2>
            <div className="space-y-4">
              {funnelData.map((stage, i) => (
                <div key={i} className="flex items-center text-sm font-bold text-[#0b2463]">
                  <div className="w-40 text-right pr-4 uppercase text-xs">{stage.label} ({stage.count})</div>
                  <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3a5078] rounded-full" 
                      style={{ width: `${stage.percentage}%`, opacity: 1 - (i * 0.2) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">{t('quickActionsTitle')}</h3>
            <div className="space-y-3">
              <Link to="/employer/create-job" className="w-full flex items-center justify-center gap-2 bg-[#4a6b9c] hover:bg-[#3a5885] text-white py-2.5 rounded-md font-medium transition-colors">
                <PlusCircle size={18} />
                {t('postAJobBtn')}
              </Link>
              <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#3a5078] border border-[#3a5078] py-2.5 rounded-md font-medium transition-colors">
                <Calendar size={18} />
                {t('scheduleInterviewBtn')}
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#3a5078] border border-[#3a5078] py-2.5 rounded-md font-medium transition-colors">
                <BarChart3 size={18} />
                {t('viewReportsBtn')}
              </button>
            </div>
          </div>

          {/* Active Postings */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0b2463]">{t('activePostingsTitle')}</h2>
              <Link to="/employer/history" className="text-sm font-medium text-[#3a5078] hover:underline">{t('manageJobs')}</Link>
            </div>
            <div className="space-y-4">
              {activeJobs.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center text-gray-500">
                  {t('noActiveJobsFound')}
                </div>
              )}
              {activeJobs.map((job, i) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[#0b2463] text-base line-clamp-1">{job.title}</h4>
                    <span className="bg-blue-100 text-[#0b2463] text-[10px] font-bold px-2 py-1 rounded">{t('active').toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{job.location}</p>
                  <div className="flex gap-6 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('applicantsCountUpper')}</div>
                      <div className="font-bold text-[#0b2463]">{job.applicants}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('interviewsCountUpper')}</div>
                      <div className="font-bold text-[#0b2463]">{job.interviews}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boost Visibility Banner */}
          <div className="bg-[#f0f4f8] rounded-lg border border-blue-100 p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-blue-200 opacity-50 transform rotate-12">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16H2V4h20z"/></svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-base font-bold text-[#0b2463] mb-2">{t('boostTitle')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('boostDesc')}</p>
              <Link to="/employer/pricing" className="text-sm font-bold text-[#3a5078] hover:text-[#0b2463] flex items-center gap-1">
                {t('exploreOptions')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
