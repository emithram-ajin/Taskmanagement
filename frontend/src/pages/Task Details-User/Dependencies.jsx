import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FolderGit2, Plus, X, ChevronDown, Trash2, Pencil, Loader2, Check, AlertCircle } from 'lucide-react';
import userapiservicer from '../../services/userapiServices';


const ALL_PROJECTS = 'All Projects';

function emptyRow() {
    return { id: Date.now() + Math.random(), key: '', value: '' };
}

// Maps a backend dependency doc into the shape this component's UI uses.
function normalizeDependency(dep) {
    return {
        id: dep._id,
        project: dep.projectName,
        dependencyName: dep.dependencyName,
        description: (dep.attributes || []).map((a) => ({
            id: Date.now() + Math.random(),
            key: a.key,
            value: a.value,
        })),
    };
}

// Small toast notification — same visual language (icon, rounded card,
// spring-in animation) as the sidebar's logout confirmation.
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div className="fixed top-6 right-6 z-[70] pointer-events-none">
            <div className="pointer-events-auto animate-[toast-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3.5 min-w-[300px] max-w-sm">
                    <div
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                            isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                    >
                        {isSuccess ? <Check size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 flex-1">{toast.message}</p>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes toast-in {
                    0% { opacity: 0; transform: translateY(-12px) scale(0.95); }
                    60% { opacity: 1; transform: translateY(2px) scale(1.02); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

// ModernSelect component unchanged — keep exactly as you have it
function ModernSelect({ value, options, onChange, className = '', loading, disabled }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const isDisabled = disabled || loading;

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !isDisabled && setOpen((v) => !v)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between gap-3 border rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-white shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    open
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                        : 'border-slate-300 hover:shadow-md hover:border-indigo-300'
                }`}
            >
                <span className="truncate">{loading ? 'Loading projects...' : value}</span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && !loading && (
                <div className="absolute right-0 z-40 mt-1.5 w-full min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5">
                    {options.map((option) => {
                        const isSelected = option === value;
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors duration-100 cursor-pointer ${
                                    isSelected
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}

                    {options.length === 0 && (
                        <div className="px-4 py-2.5 text-sm text-slate-400">No projects available</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Dependencies() {
    const [dependencies, setDependencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [projectNames, setProjectNames] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);

    const [filterProject, setFilterProject] = useState(ALL_PROJECTS);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [project, setProject] = useState('');
    const [dependencyName, setDependencyName] = useState('');
    const [rows, setRows] = useState([emptyRow(), emptyRow()]);

    const [viewingDep, setViewingDep] = useState(null);
    const [expandedTags, setExpandedTags] = useState({});

    // Toast + delete-confirmation state
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message, key }
    const [deleteTarget, setDeleteTarget] = useState(null); // dependency pending delete confirmation

    const showToast = (type, message) => {
        setToast({ type, message, key: Date.now() });
    };

    // --- Fetch dependencies from API ---
    const fetchDependencies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userapiservicer.getDependencies();
            const normalized = (data.dependencies || []).map(normalizeDependency);
            setDependencies(normalized);
        } catch (err) {
            console.error('Failed to fetch dependencies:', err);
            setError(err?.response?.data?.message || 'Failed to load dependencies');
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch projects from API for the dropdowns ---
    const fetchProjects = async () => {
        setProjectsLoading(true);
        try {
            const res = await userapiservicer.getProjects();
            const list = Array.isArray(res) ? res : res?.projects || [];
            const names = list.map((p) => p.projectName).filter(Boolean);
            setProjectNames(names);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            // Fallback: derive project names from whatever dependencies are
            // already loaded, so the dropdowns still work if this call fails.
            setProjectNames((prev) =>
                prev.length > 0 ? prev : Array.from(new Set(dependencies.map((d) => d.project)))
            );
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        fetchDependencies();
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTag = (tagId) => {
        setExpandedTags((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
    };

    const truncateValue = (value, max = 14) => {
        if (value.length <= max) return value;
        return value.slice(0, max) + '…';
    };

    const filteredDependencies = useMemo(() => {
        if (filterProject === ALL_PROJECTS) return dependencies;
        return dependencies.filter((d) => d.project === filterProject);
    }, [dependencies, filterProject]);

    const resetForm = () => {
        setProject('');
        setDependencyName('');
        setRows([emptyRow(), emptyRow()]);
        setEditingId(null);
    };

    const handleClose = () => {
        setShowModal(false);
        resetForm();
    };

    const handleOpenAdd = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (dep) => {
        setEditingId(dep.id);
        setProject(dep.project);
        setDependencyName(dep.dependencyName);
        setRows(dep.description.length > 0 ? dep.description.map((d) => ({ ...d, id: d.id || Date.now() + Math.random() })) : [emptyRow(), emptyRow()]);
        setShowModal(true);
    };

    const handleRowChange = (id, field, value) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const handleAddRow = () => {
        setRows((prev) => [...prev, emptyRow()]);
    };

    const handleRemoveRow = (id) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    // --- Submit to API (create or update) ---
    const handleSubmit = async () => {
        if (!project || !dependencyName) return;

        const attributes = rows
            .filter((row) => row.key.trim() || row.value.trim())
            .map((row) => ({ key: row.key.trim(), value: row.value.trim() }));

        setSubmitting(true);
        setError(null);
        try {
            if (editingId) {
                await userapiservicer.updateDependency(editingId, {
                    projectName: project,
                    dependencyName,
                    attributes,
                });
                await fetchDependencies(); // refresh list from server
                showToast('success', 'Dependency updated successfully');
            } else {
                await userapiservicer.postDependency({
                    projectName: project,
                    dependencyName,
                    attributes,
                });
                await fetchDependencies(); // refresh list from server
                showToast('success', 'Dependency added successfully');
            }
            handleClose();
        } catch (err) {
            console.error('Failed to save dependency:', err);
            const message = err?.response?.data?.message || 'Failed to save dependency';
            setError(message);
            showToast('error', message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Delete flow: open confirm modal, then delete via API on confirm ---
    const handleRequestRemove = (dep) => {
        setDeleteTarget(dep);
    };

    const confirmRemove = async () => {
        const dep = deleteTarget;
        if (!dep) return;
        setDeleteTarget(null);

        const prevDependencies = dependencies;

        // Optimistically remove it from the list right away.
        setDependencies((prev) => prev.filter((d) => d.id !== dep.id));
        setDeletingId(dep.id);
        setError(null);

        try {
            await userapiservicer.deleteDependency(dep.id);
            showToast('success', 'Dependency deleted successfully');
        } catch (err) {
            console.error('Failed to delete dependency:', err);
            // Roll back — put it back in the list and surface the error.
            setDependencies(prevDependencies);
            const message = err?.response?.data?.message || 'Failed to delete dependency';
            setError(message);
            showToast('error', message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex justify-center px-8 py-6">
            <div className="w-full max-w-6xl">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                            <FolderGit2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Dependencies</h1>
                            <p className="text-slate-500 text-sm">Manage dependencies for this task.</p>
                        </div>
                    </div>

                    <ModernSelect
                        value={filterProject}
                        options={[ALL_PROJECTS, ...projectNames]}
                        onChange={setFilterProject}
                        loading={projectsLoading}
                        className="min-w-[220px]"
                    />
                </div>

                {error && (
                    <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[460px] flex flex-col shadow-sm">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading dependencies...
                    </div>
                ) : filteredDependencies.length === 0 ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-40 scale-125" />
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <FolderGit2 size={30} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-2">
                            {dependencies.length === 0
                                ? 'No dependencies added yet'
                                : 'No dependencies for this project'}
                        </h3>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-7">
                            Add dependencies to track external services, libraries or other projects
                            that this task relies on.
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl px-6 py-3 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all duration-200 cursor-pointer"
                        >
                            <Plus size={17} strokeWidth={2.5} />
                            Add Dependency
                        </button>
                    </div>
                ) : (
                    /* Dependency list */
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-slate-900 font-bold text-lg">
                                    {filteredDependencies.length} {filteredDependencies.length === 1 ? 'Dependency' : 'Dependencies'}
                                </h3>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    {filterProject === ALL_PROJECTS ? 'Tracked for this task' : `Filtered by ${filterProject}`}
                                </p>
                            </div>
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl px-4 py-2.5 shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Add Dependency
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Dependency
                                        </th>
                                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                            Project
                                        </th>
                                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 max-w-[280px]">
                                            Description
                                        </th>
                                        <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 w-[90px]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredDependencies.map((dep) => {
                                        const isDeleting = deletingId === dep.id;
                                        return (
                                        <tr
                                            key={dep.id}
                                            className={`group hover:bg-indigo-50/30 transition-colors duration-150 ${isDeleting ? 'opacity-50' : ''}`}
                                        >
                                            <td className="px-4 py-3.5 align-top">
                                                <button
                                                    onClick={() => setViewingDep(dep)}
                                                    className="cursor-pointer"
                                                    title="View details"
                                                >
                                                    <span className="text-sm font-semibold rounded-full px-2.5 py-0.5 bg-indigo-50 text-indigo-600 whitespace-nowrap">
                                                        {dep.dependencyName}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <span className="text-sm font-semibold rounded-full px-2.5 py-0.5 bg-violet-50 text-violet-600 whitespace-nowrap">
                                                    {dep.project}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                {dep.description.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {dep.description.map((d, idx) => {
                                                            const tagId = `${dep.id}-${idx}`;
                                                            const isExpanded = !!expandedTags[tagId];
                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => toggleTag(tagId)}
                                                                    className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer max-w-[220px]"
                                                                    title={isExpanded ? 'Click to collapse' : 'Click to view full value'}
                                                                >
                                                                    <span className="font-semibold text-slate-800">{d.key}</span>
                                                                    <span className="text-slate-400"> : </span>
                                                                    <span className={isExpanded ? 'break-all' : ''}>
                                                                        {isExpanded ? d.value : truncateValue(d.value)}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(dep)}
                                                        disabled={isDeleting}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestRemove(dep)}
                                                        disabled={isDeleting}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 size={15} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={15} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                </div>
            </div>

            {/* Add / Edit Dependency modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h3 className="font-semibold text-slate-900 text-lg">
                                {editingId ? 'Edit Dependency' : 'Add Dependency'}
                            </h3>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5">
                            {error && (
                                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                    Project <span className="text-red-500">*</span>
                                </label>
                                <ModernSelect
                                    value={project || 'Select Project'}
                                    options={projectNames}
                                    onChange={setProject}
                                    loading={projectsLoading}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                    Dependency <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={dependencyName}
                                    onChange={(e) => setDependencyName(e.target.value)}
                                    placeholder="e.g. Amazon S3"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-800">
                                        Description <span className="text-slate-400 font-normal">(Key / Value)</span>
                                    </label>
                                    <span className="text-xs text-slate-400">{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span>
                                </div>

                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                                    <div className="grid grid-cols-[1fr_1fr_40px] bg-slate-100/80 text-[11px] font-bold uppercase tracking-wide text-slate-500 px-3.5 py-2.5">
                                        <span>Key</span>
                                        <span>Value</span>
                                        <span></span>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {rows.map((row, idx) => (
                                            <div
                                                key={row.id}
                                                className={`grid grid-cols-[1fr_1fr_40px] items-center gap-2.5 px-3.5 py-2.5 ${
                                                    idx % 2 === 1 ? 'bg-white/60' : ''
                                                }`}
                                            >
                                                <input
                                                    type="text"
                                                    value={row.key}
                                                    onChange={(e) => handleRowChange(row.id, 'key', e.target.value)}
                                                    placeholder="e.g. Service"
                                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                />
                                                <input
                                                    type="text"
                                                    value={row.value}
                                                    onChange={(e) => handleRowChange(row.id, 'value', e.target.value)}
                                                    placeholder="e.g. Amazon S3"
                                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                />
                                                <button
                                                    onClick={() => handleRemoveRow(row.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer justify-self-center"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        ))}

                                        {rows.length === 0 && (
                                            <div className="px-3.5 py-6 text-center text-xs text-slate-400">
                                                No rows yet — add one below.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddRow}
                                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold text-sm py-2 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-300 transition-colors cursor-pointer"
                                >
                                    <Plus size={15} strokeWidth={2.5} />
                                    Add Row
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!project || !dependencyName || submitting}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                {editingId ? 'Save Changes' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View details modal — unchanged */}
            {viewingDep && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h3 className="font-semibold text-slate-900 text-lg">Dependency Details</h3>
                            <button
                                onClick={() => setViewingDep(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <FolderGit2 size={20} className="text-indigo-500" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                            Dependency:
                                        </span>
                                        <span className="text-sm font-semibold rounded-full px-2.5 py-0.5 bg-indigo-50 text-indigo-600">
                                            {viewingDep.dependencyName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                            Project:
                                        </span>
                                        <span className="text-sm font-semibold rounded-full px-2.5 py-0.5 bg-violet-50 text-violet-600">
                                            {viewingDep.project}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-2">
                                    Description
                                </span>
                                {viewingDep.description.length > 0 ? (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        {viewingDep.description.map((d, idx) => (
                                            <div
                                                key={idx}
                                                className={`grid grid-cols-2 px-3.5 py-2.5 text-sm ${
                                                    idx % 2 === 1 ? 'bg-slate-50' : ''
                                                }`}
                                            >
                                                <span className="font-semibold text-slate-800">{d.key}</span>
                                                <span className="text-slate-600">{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">No description added.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={() => setViewingDep(null)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleOpenEdit(viewingDep);
                                    setViewingDep(null);
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal — same style as sidebar logout confirm */}
            {deleteTarget && (
                <>
                    <div
                        onClick={() => setDeleteTarget(null)}
                        className="fixed inset-0 bg-slate-900/40 z-[59] animate-[del-backdrop-in_0.25s_ease-out]"
                    />

                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pointer-events-none">
                        <div className="w-[480px] max-w-[92vw] pointer-events-auto animate-[del-toast-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl px-8 py-8 flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                                        <Trash2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-900">Delete dependency?</p>
                                        <p className="text-lg text-slate-500 mt-1.5 leading-relaxed">
                                            "{deleteTarget.dependencyName}" will be permanently removed from{' '}
                                            {deleteTarget.project}.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setDeleteTarget(null)}
                                        className="px-5 py-2.5 rounded-xl text-md font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        No
                                    </button>
                                    <button
                                        onClick={confirmRemove}
                                        className="px-5 py-2.5 rounded-xl text-md font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
                                    >
                                        Yes, delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes del-backdrop-in {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes del-toast-in {
                            0% { opacity: 0; transform: scale(0.9); }
                            60% { opacity: 1; transform: scale(1.03); }
                            100% { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </>
            )}

            {/* Success / error toast */}
            <Toast key={toast?.key} toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}