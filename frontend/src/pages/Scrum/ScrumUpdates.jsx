import React, { useState, useEffect } from 'react';
import { MessageSquare, CalendarDays, X } from 'lucide-react';
import apiServices from '../../services/apiServices';
import Loader from '../../components/Loader/Loader';
import CustomDropdown from '../../components/Dropdown/CustomDropdown';
import Pagination from '../../components/Pagination/Pagination';

const ALL_PROJECTS = 'All Projects';
const ALL_DEPARTMENTS = 'All Departments';
const ALL_USERS = 'All Users';

const ScrumRow = ({ scrum, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasBlocker = scrum.blockers && scrum.blockers.toLowerCase() !== "none";

  return (
    <tr 
      onClick={() => setIsExpanded(!isExpanded)}
      className="hover:bg-slate-50/80 transition-colors group align-top cursor-pointer"
      title={isExpanded ? "Click to collapse" : "Click to expand"}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            {scrum.submittedBy?.name ? scrum.submittedBy.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="font-medium text-slate-900 text-sm">{scrum.submittedBy?.name || 'Unknown User'}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-slate-700 font-medium">
          {scrum.project?.projectName || 'Unknown'}
        </span>
      </td>
      <td className="py-3 px-4 max-w-[200px]">
        <div className={`text-sm text-slate-600 ${isExpanded ? '' : 'line-clamp-1'}`}>
          {scrum.doYesterday}
        </div>
      </td>
      <td className="py-3 px-4 max-w-[200px]">
        <div className={`text-sm text-slate-600 ${isExpanded ? '' : 'line-clamp-1'}`}>
          {scrum.doToday}
        </div>
      </td>
      <td className="py-3 px-4 max-w-[200px]">
        <div className={`text-sm ${hasBlocker ? 'text-rose-600 font-medium' : 'text-slate-500'} ${isExpanded ? '' : 'line-clamp-1'}`}>
          {scrum.blockers || "None"}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1.5 text-sm text-slate-500 whitespace-nowrap">
          {formatDate(scrum.createdAt || scrum.date)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="flex items-center gap-1.5 text-sm text-slate-500 whitespace-nowrap">
          {formatDate(scrum.updatedAt || scrum.date)}
        </span>
      </td>
    </tr>
  );
};

const ScrumUpdates = () => {
  const [scrums, setScrums] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterProject, setFilterProject] = useState(ALL_PROJECTS);
  const [filterDepartment, setFilterDepartment] = useState(ALL_DEPARTMENTS);
  const [filterUser, setFilterUser] = useState(ALL_USERS);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterProject, filterDepartment, filterUser, filterDateFrom, filterDateTo]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [scrumsData, projectsData] = await Promise.all([
        apiServices.getAdminScrums(),
        apiServices.getProjects()
      ]);
      
      setScrums(scrumsData || []);
      setProjects([ALL_PROJECTS, ...projectsData.map(p => p.projectName)]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load scrum updates.");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique options from fetched scrums for dropdowns
  const uniqueDepartments = [...new Set(scrums.map(s => s.submittedBy?.department).filter(Boolean))];
  const departmentOptions = [
    { value: ALL_DEPARTMENTS, label: ALL_DEPARTMENTS },
    ...uniqueDepartments.map(d => ({ value: d, label: d }))
  ];

  const uniqueUsers = [...new Set(scrums.map(s => s.submittedBy?.name).filter(Boolean))];
  const userOptions = [
    { value: ALL_USERS, label: ALL_USERS },
    ...uniqueUsers.map(u => ({ value: u, label: u }))
  ];

  const projectOptions = projects.map(p => ({ value: p, label: p }));

  const filteredScrums = scrums.filter((s) => {
    const matchProject = filterProject === ALL_PROJECTS || s.project?.projectName === filterProject;
    const matchDept = filterDepartment === ALL_DEPARTMENTS || s.submittedBy?.department === filterDepartment;
    const matchUser = filterUser === ALL_USERS || s.submittedBy?.name === filterUser;
    
    let matchDate = true;
    if (filterDateFrom || filterDateTo) {
      const d = new Date(s.date || s.createdAt);
      const scrumDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (filterDateFrom && filterDateTo) {
        matchDate = scrumDateStr >= filterDateFrom && scrumDateStr <= filterDateTo;
      } else if (filterDateFrom) {
        matchDate = scrumDateStr >= filterDateFrom;
      } else if (filterDateTo) {
        matchDate = scrumDateStr <= filterDateTo;
      }
    }
    
    return matchProject && matchDept && matchUser && matchDate;
  });

  // Sort: Last added/created first
  const sortedScrums = [...filteredScrums].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date);
    const dateB = new Date(b.createdAt || b.date);
    return dateB - dateA;
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(sortedScrums.length / ITEMS_PER_PAGE) || 1;
  const paginatedScrums = sortedScrums.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setFilterProject(ALL_PROJECTS);
    setFilterDepartment(ALL_DEPARTMENTS);
    setFilterUser(ALL_USERS);
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Scrum Updates</h1>
            <p className="text-slate-500 mt-1">Review daily standups across all projects</p>
          </div>
        </div>
        {(filterProject !== ALL_PROJECTS || filterDepartment !== ALL_DEPARTMENTS || filterUser !== ALL_USERS || filterDateFrom || filterDateTo) && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Project</label>
          <CustomDropdown 
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            options={projectOptions}
            placeholder="Select Project"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department</label>
          <CustomDropdown 
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            options={departmentOptions}
            placeholder="Select Department"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">User</label>
          <CustomDropdown 
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            options={userOptions}
            placeholder="Select User"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">From Date</label>
          <input 
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
          <input 
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-64">
          <Loader message="Loading scrum updates..." />
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg border border-rose-100 text-center">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {filteredScrums.length} Updates
              </h2>
              <p className="text-sm text-slate-500">Tracked across projects</p>
            </div>
          </div>

          {paginatedScrums.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/6">User</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Project</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Yesterday</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Today</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/6">Blockers</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedScrums.map((scrum) => (
                    <ScrumRow key={scrum._id} scrum={scrum} formatDate={formatDate} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900 mb-1">No Scrum Updates Found</p>
              <p className="text-sm">There are no daily standups matching your filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ScrumUpdates;
