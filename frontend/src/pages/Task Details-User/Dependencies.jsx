import React, { useState } from 'react';
import { FolderGit2, Plus, X, ChevronDown, Trash2 } from 'lucide-react';

const PROJECT_OPTIONS = ['Dashboard Redesign', 'Mobile App Launch', 'API Platform Upgrade'];

function emptyRow() {
    return { id: Date.now() + Math.random(), key: '', value: '' };
}

export default function Dependencies() {
    const [dependencies, setDependencies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [project, setProject] = useState('');
    const [dependencyName, setDependencyName] = useState('');
    const [rows, setRows] = useState([emptyRow(), emptyRow()]);

    const resetForm = () => {
        setProject('');
        setDependencyName('');
        setRows([emptyRow(), emptyRow()]);
    };

    const handleClose = () => {
        setShowModal(false);
        resetForm();
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

    const handleSubmit = () => {
        if (!project || !dependencyName) return;

        const description = rows.filter((row) => row.key.trim() || row.value.trim());

        setDependencies((prev) => [
            ...prev,
            {
                id: Date.now(),
                project,
                dependencyName,
                description,
            },
        ]);

        handleClose();
    };

    const handleRemove = (id) => {
        setDependencies((prev) => prev.filter((dep) => dep.id !== id));
    };

    return (
        <div className="flex justify-center px-8 py-6">
            <div className="w-full max-w-4xl">
                {/* Page Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                        <FolderGit2 size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dependencies</h1>
                        <p className="text-slate-500 text-sm">Manage dependencies for this task.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[460px] flex flex-col shadow-sm">
                {dependencies.length === 0 ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-40 scale-125" />
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <FolderGit2 size={30} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-2">
                            No dependencies added yet
                        </h3>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-7">
                            Add dependencies to track external services, libraries or other projects
                            that this task relies on.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
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
                                    {dependencies.length} {dependencies.length === 1 ? 'Dependency' : 'Dependencies'}
                                </h3>
                                <p className="text-slate-400 text-xs mt-0.5">Tracked for this task</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl px-4 py-2.5 shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Add Dependency
                            </button>
                        </div>

                        <div className="space-y-3">
                            {dependencies.map((dep) => (
                                <div
                                    key={dep.id}
                                    className="group border border-slate-200 rounded-xl px-4 py-3.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors duration-150"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                                <FolderGit2 size={17} className="text-indigo-500" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                    Dependency
                                                </span>
                                                <p className="text-sm font-semibold text-slate-900 -mt-0.5">{dep.dependencyName}</p>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                        Project:
                                                    </span>
                                                    <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-violet-50 text-violet-600">
                                                        {dep.project}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(dep.id)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    {dep.description.length > 0 && (
                                        <div className="mt-3 pl-[54px] flex flex-wrap gap-2">
                                            {dep.description.map((d, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1"
                                                >
                                                    <span className="font-semibold text-slate-800">{d.key}</span>
                                                    <span className="text-slate-400"> : </span>
                                                    {d.value}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
                </div>
            </div>

            {/* Add Dependency modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h3 className="font-semibold text-slate-900 text-lg">Add Dependency</h3>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5">
                            {/* Project select */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                    Project <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={project}
                                        onChange={(e) => setProject(e.target.value)}
                                        className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2.5 pr-9 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option value="" disabled>Select Project</option>
                                        {PROJECT_OPTIONS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            {/* Dependency input */}
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

                            {/* Description key/value table */}
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

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!project || !dependencyName}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}