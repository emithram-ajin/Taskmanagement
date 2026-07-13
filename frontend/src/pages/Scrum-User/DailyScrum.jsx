import React, { useState, useEffect, useCallback, useRef } from "react";
import { Pencil, Check, X, Loader2, CheckCircle2, AlertCircle, ChevronDown, FolderKanban } from "lucide-react";
import userapiservicer from "../../services/userapiServices";


function formatDate(dateInput) {
    const d = dateInput ? new Date(dateInput) : new Date();
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Normalizes a scrum record from the API (as returned by createScrum /
// getMyScrums / updateScrum, each wrapping the doc as `scrum` / `scrums[]`)
// into the shape this component renders.
function normalizeScrum(raw, fallback = {}) {
    // submittedBy / project come back fully populated from getMyScrums, but
    // some backend responses (e.g. updateScrum) return them as raw ObjectId
    // strings instead of populated objects. When that happens, fall back to
    // whatever we already had for this entry rather than showing it blank.
    const submittedByIsPopulated = raw.submittedBy && typeof raw.submittedBy === "object";
    const projectIsPopulated = raw.project && typeof raw.project === "object";

    const authorName = submittedByIsPopulated
        ? raw.submittedBy.name
        : fallback.name || "Unknown user";

    const projectName = projectIsPopulated
        ? raw.project.projectName
        : fallback.projectName || "";

    return {
        id: raw._id,
        name: authorName,
        initial: authorName.charAt(0).toUpperCase(),
        date: formatDate(raw.date || raw.createdAt),
        yesterday: raw.doYesterday || "—",
        today: raw.doToday || "—",
        blockers: raw.blockers || "None",
        projectId: (projectIsPopulated ? raw.project._id : raw.project) || fallback.projectId || "",
        projectName,
        createdAt: formatDate(raw.createdAt),
        updatedAt: formatDate(raw.updatedAt),
    };
}

// Modern animated dropdown — replaces the plain native <select>. Opens with
// a fade + scale + slight slide, chevron rotates, options highlight on
// hover/selection. Options are objects with a `value` and `label`.
function ModernSelect({ value, options, onChange, placeholder = "Select...", loading, disabled, icon: Icon }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const isDisabled = disabled || loading;

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => !isDisabled && setOpen((v) => !v)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between gap-2 border rounded-lg p-3 text-sm text-left bg-white transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${open
                        ? "border-indigo-500 ring-2 ring-indigo-500/30"
                        : "border-slate-300 hover:border-indigo-300"
                    }`}
            >
                <span className={`flex items-center gap-2 truncate ${selected ? "text-slate-700" : "text-slate-400"}`}>
                    {Icon && <Icon size={15} className="text-slate-400 shrink-0" />}
                    <span className="truncate">
                        {loading ? "Loading projects..." : selected ? selected.label : placeholder}
                    </span>
                </span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <div
                className={`absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto origin-top transition-all duration-150 ${open
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                    }`}
            >
                {options.length === 0 && !loading && (
                    <div className="px-3 py-2 text-sm text-slate-400">No projects available</div>
                )}
                {options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors duration-100 ${isSelected
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {option.label}
                            {isSelected && <Check size={14} className="text-indigo-600" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Toasts ──────────────────────────────────────────────────
// Small self-contained toast system (no external dependency). Renders a
// fixed stack in the top-right corner; each toast auto-dismisses after a
// few seconds and can also be dismissed manually.

function ToastStack({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 w-[360px] max-w-[90vw]">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="alert"
                    className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-[toast-in_0.2s_ease-out] ${toast.type === "error"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}
                >
                    {toast.type === "error" ? (
                        <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    ) : (
                        <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm leading-relaxed flex-1">{toast.message}</p>
                    <button
                        onClick={() => onDismiss(toast.id)}
                        aria-label="Dismiss notification"
                        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-150"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <style>{`
                @keyframes toast-in {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default function DailyScrum() {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [toasts, setToasts] = useState([]);
    const toastTimers = useRef({});

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        clearTimeout(toastTimers.current[id]);
        delete toastTimers.current[id];
    }, []);

    const showToast = useCallback((type, message, duration = 4000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        toastTimers.current[id] = setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
            delete toastTimers.current[id];
        }, duration);
    }, []);

    useEffect(() => {
        const timers = toastTimers.current;
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, []);

    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);

    const [selectedProject, setSelectedProject] = useState("");
    const [yesterday, setYesterday] = useState("");
    const [today, setToday] = useState("");
    const [blockers, setBlockers] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Editing state
    const [editingId, setEditingId] = useState(null);
    const [editYesterday, setEditYesterday] = useState("");
    const [editToday, setEditToday] = useState("");
    const [editBlockers, setEditBlockers] = useState("");
    const [savingId, setSavingId] = useState(null);

    // Row expand/collapse state — which rows are showing full (untruncated)
    // Yesterday / Today / Blockers text.
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const toggleRowExpanded = (id) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const fetchUpdates = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await userapiservicer.getMyScrums({ page, limit: pageSize });
            const list = res?.scrums || [];
            setUpdates(list.map((raw) => normalizeScrum(raw)));
            setTotalPages(res?.totalPages || 1);
            setCurrentPage(res?.currentPage || page);
        } catch (err) {
            console.error("Failed to load scrum updates:", err);
            showToast("error", "Couldn't load your updates. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const fetchProjects = useCallback(async () => {
        setProjectsLoading(true);
        try {
            const res = await userapiservicer.getProjects();
            const list = Array.isArray(res) ? res : res?.projects || [];
            setProjects(list);
            if (list.length === 1) setSelectedProject(list[0]._id);
        } catch (err) {
            console.error("Failed to load projects:", err);
            showToast("error", "Couldn't load your projects. Please try again.");
        } finally {
            setProjectsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUpdates(1);
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages || page === currentPage || loading) return;
        fetchUpdates(page);
    };

    const resetForm = () => {
        setYesterday("");
        setToday("");
        setBlockers("");
    };

    const upsertUpdate = (id, scrumDoc, extraFallback = {}) => {
        setUpdates((prev) => {
            const existing = prev.find((u) => u.id === id);
            const normalized = normalizeScrum(scrumDoc, existing || extraFallback);
            return existing
                ? prev.map((u) => (u.id === id ? normalized : u))
                : [normalized, ...prev];
        });
    };

    const handleSubmit = async () => {
        if (!yesterday.trim() || !today.trim() || !selectedProject) {
            showToast("error", "Please select a project and fill in both Yesterday and Today.");
            return;
        }

        const payload = {
            doYesterday: yesterday.trim(),
            doToday: today.trim(),
            blockers: blockers.trim() || "None",
            project: selectedProject,
        };

        setSubmitting(true);

        try {
            await userapiservicer.createScrum(payload);

            resetForm();
            showToast("success", "Your standup update was submitted successfully.");
            fetchUpdates(1);

        } catch (err) {
            console.error("Failed to submit update:", err);

            if (err.response?.status === 409) {
                showToast(
                    "error",
                    "You have already submitted today's scrum for this project. Please use the Edit button if you want to make changes."
                );
            } else {
                const serverMessage = err.response?.data?.message;
                showToast(
                    "error",
                    serverMessage || "Couldn't submit your update. Please try again."
                );
            }

        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = (update) => {
        setEditingId(update.id);
        setEditYesterday(update.yesterday === "—" ? "" : update.yesterday);
        setEditToday(update.today === "—" ? "" : update.today);
        setEditBlockers(update.blockers === "None" ? "" : update.blockers);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditYesterday("");
        setEditToday("");
        setEditBlockers("");
    };

    const saveEditing = async (id) => {
        if (!editYesterday.trim() || !editToday.trim()) {
            showToast("error", "Yesterday and Today can't be empty.");
            return;
        }

        const payload = {
            doYesterday: editYesterday.trim(),
            doToday: editToday.trim(),
            blockers: editBlockers.trim() || "None",
        };

        setSavingId(id);
        try {
            const res = await userapiservicer.updateScrum(id, payload);
            upsertUpdate(id, res.scrum);
            setEditingId(null);
            showToast("success", "Your update was saved successfully.");
        } catch (err) {
            console.error("Failed to update:", err);
            const serverMessage = err.response?.data?.message;
            showToast("error", serverMessage || "Couldn't save your changes. Please try again.");
        } finally {
            setSavingId(null);
        }
    };

    const projectOptions = projects.map((p) => ({ value: p._id, label: p.projectName }));

    return (
        <div className="min-h-screen bg-slate-50 px-8 py-6">
            <ToastStack toasts={toasts} onDismiss={dismissToast} />

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Daily Scrum Updates</h1>
                <p className="text-slate-500 text-[16px] mt-1">Submit your daily standup</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Submit Form */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-5">Submit Today's Update</h2>

                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="block text-md font-semibold text-slate-800 mb-2">
                                Project
                            </label>
                            <ModernSelect
                                value={selectedProject}
                                options={projectOptions}
                                onChange={setSelectedProject}
                                placeholder="Select a project"
                                loading={projectsLoading}
                                disabled={submitting}
                                icon={FolderKanban}
                            />
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-slate-800 mb-2">
                                What did you do yesterday?
                            </label>
                            <textarea
                                value={yesterday}
                                onChange={(e) => setYesterday(e.target.value)}
                                placeholder="Describe your accomplishments from yesterday..."
                                rows={3}
                                disabled={submitting}
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-slate-800 mb-2">
                                What will you do today?
                            </label>
                            <textarea
                                value={today}
                                onChange={(e) => setToday(e.target.value)}
                                placeholder="Describe your plan for today..."
                                rows={3}
                                disabled={submitting}
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-slate-800 mb-2">
                                Any blockers?
                            </label>
                            <textarea
                                value={blockers}
                                onChange={(e) => setBlockers(e.target.value)}
                                placeholder="List any blockers or challenges (or type 'None')..."
                                rows={3}
                                disabled={submitting}
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="self-start flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors duration-150"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? "Submitting..." : "Submit Update"}
                        </button>
                    </div>
                </div>

                {/* My Updates */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-5">My Updates</h2>

                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm py-6">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading your updates...
                        </div>
                    ) : updates.length === 0 ? (
                        <p className="text-slate-400 text-sm py-4">No updates submitted yet.</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-6 py-3 whitespace-nowrap">#</th>
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 whitespace-nowrap">Project</th>
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 min-w-[180px] max-w-[280px]">Yesterday</th>
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 min-w-[180px] max-w-[280px]">Today</th>
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 min-w-[160px] max-w-[240px]">Blockers</th>
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 whitespace-nowrap">Created</th>
                                            <th className="text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 whitespace-nowrap">Last Updated</th>
                                            <th className="text-right text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {updates.map((update, index) => {
                                            const isEditing = editingId === update.id;
                                            const isSaving = savingId === update.id;
                                            const isExpanded = expandedRows.has(update.id);

                                            // Truncated (collapsed) text cells are clickable to expand
                                            // the whole row; only wire this up when not editing, since
                                            // editing already shows full textareas.
                                            const textCellClass = isExpanded
                                                ? "text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap break-words"
                                                : "text-[14px] text-slate-600 leading-relaxed truncate";

                                            return (
                                                <tr key={update.id} className="border-b border-slate-100 align-top hover:bg-slate-50/60 transition-colors duration-100">
                                                    {/* Serial Number */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-[14px] font-semibold text-slate-500">
                                                        {index + 1}
                                                    </td>

                                                    {/* Project */}
                                                    <td className="px-3 py-4 text-[14px] text-slate-600 whitespace-nowrap">
                                                        {update.projectName || "—"}
                                                    </td>

                                                    {/* Yesterday */}
                                                    <td
                                                        className={`px-3 py-4 max-w-[280px] ${!isEditing ? "cursor-pointer" : ""}`}
                                                        onClick={!isEditing ? () => toggleRowExpanded(update.id) : undefined}
                                                        title={!isEditing ? (isExpanded ? "Click to collapse" : "Click to see full text") : undefined}
                                                    >
                                                        {isEditing ? (
                                                            <textarea
                                                                value={editYesterday}
                                                                onChange={(e) => setEditYesterday(e.target.value)}
                                                                rows={2}
                                                                autoFocus
                                                                disabled={isSaving}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full min-w-[160px] border border-slate-300 rounded-lg p-2 text-[13.5px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50"
                                                            />
                                                        ) : (
                                                            <p className={textCellClass}>{update.yesterday}</p>
                                                        )}
                                                    </td>

                                                    {/* Today */}
                                                    <td
                                                        className={`px-3 py-4 max-w-[280px] ${!isEditing ? "cursor-pointer" : ""}`}
                                                        onClick={!isEditing ? () => toggleRowExpanded(update.id) : undefined}
                                                        title={!isEditing ? (isExpanded ? "Click to collapse" : "Click to see full text") : undefined}
                                                    >
                                                        {isEditing ? (
                                                            <textarea
                                                                value={editToday}
                                                                onChange={(e) => setEditToday(e.target.value)}
                                                                rows={2}
                                                                disabled={isSaving}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full min-w-[160px] border border-slate-300 rounded-lg p-2 text-[13.5px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50"
                                                            />
                                                        ) : (
                                                            <p className={textCellClass}>{update.today}</p>
                                                        )}
                                                    </td>

                                                    {/* Blockers */}
                                                    <td
                                                        className={`px-3 py-4 max-w-[240px] ${!isEditing ? "cursor-pointer" : ""}`}
                                                        onClick={!isEditing ? () => toggleRowExpanded(update.id) : undefined}
                                                        title={!isEditing ? (isExpanded ? "Click to collapse" : "Click to see full text") : undefined}
                                                    >
                                                        {isEditing ? (
                                                            <textarea
                                                                value={editBlockers}
                                                                onChange={(e) => setEditBlockers(e.target.value)}
                                                                rows={2}
                                                                placeholder="None"
                                                                disabled={isSaving}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full min-w-[140px] border border-slate-300 rounded-lg p-2 text-[13.5px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50"
                                                            />
                                                        ) : (
                                                            <p
                                                                className={`leading-relaxed ${isExpanded ? "whitespace-pre-wrap break-words" : "truncate"
                                                                    } text-[14px] ${update.blockers && update.blockers.toLowerCase() !== "none"
                                                                        ? "text-rose-600 font-medium"
                                                                        : "text-slate-600"
                                                                    }`}
                                                            >
                                                                {update.blockers}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Created */}
                                                    <td className="px-3 py-4 text-[13px] text-slate-500 whitespace-nowrap">
                                                        {update.createdAt}
                                                    </td>

                                                    {/* Last Updated */}
                                                    <td className="px-3 py-4 text-[13px] text-slate-500 whitespace-nowrap">
                                                        {update.updatedAt}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        {!isEditing ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    startEditing(update);
                                                                }}
                                                                aria-label="Edit update"
                                                                title="Edit update"
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => saveEditing(update.id)}
                                                                    disabled={isSaving}
                                                                    aria-label="Save changes"
                                                                    title="Save changes"
                                                                    className="flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors duration-150"
                                                                >
                                                                    {isSaving ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={cancelEditing}
                                                                    disabled={isSaving}
                                                                    aria-label="Cancel editing"
                                                                    title="Cancel editing"
                                                                    className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors duration-150"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-1.5 pt-5">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                        className="px-3 py-1.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-150"
                                    >
                                        Prev
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            disabled={loading}
                                            className={`w-8 h-8 text-[13px] font-medium rounded-lg transition-colors duration-150 ${page === currentPage
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-600 hover:bg-slate-100"
                                                } disabled:opacity-60`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
                                        className="px-3 py-1.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-150"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}