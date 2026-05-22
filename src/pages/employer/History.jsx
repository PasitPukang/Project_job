import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';

export default function History() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.token) return; // Not logged in

      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/jobs/employer/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    if (confirm(t('confirmDeleteJob'))) {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        await fetch(`http://localhost:5000/api/jobs/${id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0b2463] mb-2">{t('jobPostingHistoryTitle')}</h1>
          <p className="text-gray-600">{t('managePostingsDesc')}</p>
        </div>
        <Link to="/employer/create-job" className="px-6 py-2.5 bg-[#4a6b9c] text-white font-medium rounded-md hover:bg-[#3a5885] transition-colors">
          {t('postNewJobBtn')}
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchHistoryPlaceholder')} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
          <Filter size={18} />
          {t('filterBtn')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <th className="p-4 pl-6">{t('jobTitle')}</th>
                <th className="p-4">{t('status')}</th>
                <th className="p-4">{t('applicantsCount')}</th>
                <th className="p-4">{t('postedDateCol')}</th>
                <th className="p-4 pr-6 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">{t('loadingJobsText')}</td></tr>
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">{t('noJobsHistoryFound')}</td></tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[#0b2463]">{job.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{job.location} • {job.workType}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        job.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        job.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status === 'Active' ? t('active') : job.status === 'Draft' ? t('draft') : job.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {job.applicants > 0 ? (
                        <Link to={`/employer/applications/${job.id}`} className="text-blue-600 hover:underline">
                          {job.applicants}
                        </Link>
                      ) : (
                        job.applicants
                      )}
                    </td>
                    <td className="p-4 text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-gray-400 hover:text-blue-600 p-1">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteJob(job.id)} className="text-gray-400 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
