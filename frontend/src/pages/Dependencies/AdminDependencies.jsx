import React, { useState, useEffect, useMemo } from 'react';
import { FolderGit2, Copy, Check } from 'lucide-react';
import apiServices from '../../services/apiServices';
import Loader from '../../components/Loader/Loader';
import CustomDropdown from '../../components/Dropdown/CustomDropdown';
import Pagination from '../../components/Pagination/Pagination';

const ALL_PROJECTS = 'All Projects';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="p-1 ml-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600 focus:outline-none"
      title="Copy value"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

const AdminDependencies = () => {
  const [dependencies, setDependencies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterProject, setFilterProject] = useState(ALL_PROJECTS);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterProject]);

  useEffect(() => {
    fetchData();
  }, [currentPage, filterProject]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (filterProject !== ALL_PROJECTS) params.projectName = filterProject;

      const [depsData, projectsData] = await Promise.all([
        apiServices.getAdminDependencies(params),
        apiServices.getProjects()
      ]);
      
      const depsArray = depsData.dependencies || depsData || [];
      const normalizedDeps = depsArray.map(dep => ({
        id: dep._id,
        project: dep.projectName,
        dependencyName: dep.dependencyName,
        description: dep.attributes || []
      }));

      setDependencies(normalizedDeps);
      setTotalPages(depsData.totalPages || 1);
      setProjects([ALL_PROJECTS, ...projectsData.map(p => p.projectName)]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load dependencies.");
    } finally {
      setIsLoading(false);
    }
  };

  const projectOptions = projects.map(p => ({ value: p, label: p }));

  return (
    <div className="p-8 w-full h-full overflow-y-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dependencies</h1>
            <p className="text-slate-500 mt-1">Manage dependencies across all projects</p>
          </div>
        </div>
        
        <div className="w-64">
          <CustomDropdown 
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            options={projectOptions}
            placeholder="Select Project"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-64">
          <Loader message="Loading dependencies..." />
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg border border-rose-100 text-center">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              {dependencies.length} Dependencies
            </h2>
            <p className="text-sm text-slate-500">Tracked across projects</p>
          </div>

          {dependencies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/4">Dependency</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/4">Project</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-2/4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dependencies.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium">
                          {dep.dependencyName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-sm font-medium">
                          {dep.project}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {dep.description && dep.description.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {dep.description.map((attr, idx) => (
                              <div key={idx} className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
                                <span className="font-semibold text-slate-700">{attr.key}:</span>
                                <span>{attr.value}</span>
                                <CopyButton text={attr.value} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <FolderGit2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-900 mb-1">No Dependencies Found</p>
              <p className="text-sm">There are no dependencies matching your filter criteria.</p>
            </div>
          )}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDependencies;
