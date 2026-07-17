import React, { useState, useEffect, useRef, useCallback } from "react";
import { Flag, CalendarDays, User, ChevronDown, AlertTriangle, Loader2 } from "lucide-react";
import userapiservicer from "../../services/userapiServices";

// Order here drives the left-to-right column order on the board.
const COLUMNS = [
    {
        key: "todo",
        label: "TO DO",
        apiStatus: "assigned",
        headerColor: "text-slate-700",
        colBorder: "border border-slate-200",
        bgColor: "bg-white",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-600",
        dropHighlight: "bg-slate-50",
        emptyBorder: "border-slate-300",
    },
    {
        key: "in-progress",
        label: "IN PROGRESS",
        apiStatus: "progress",
        headerColor: "text-indigo-600",
        colBorder: "border border-indigo-200",
        bgColor: "bg-indigo-50/30",
        badgeBg: "bg-indigo-100",
        badgeText: "text-indigo-700",
        dropHighlight: "bg-indigo-50",
        emptyBorder: "border-indigo-200",
    },
    {
        key: "blocker",
        label: "BLOCKER",
        apiStatus: "blocker",
        headerColor: "text-rose-600",
        colBorder: "border border-rose-200",
        bgColor: "bg-rose-50/30",
        badgeBg: "bg-rose-100",
        badgeText: "text-rose-700",
        dropHighlight: "bg-rose-50",
        emptyBorder: "border-rose-200",
    },
    {
        key: "completed",
        label: "COMPLETED",
        apiStatus: "completed",
        headerColor: "text-emerald-600",
        colBorder: "border border-emerald-200",
        bgColor: "bg-emerald-50/30",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-700",
        dropHighlight: "bg-emerald-50",
        emptyBorder: "border-emerald-200",
    },
];

const PAGE_LIMIT = 10;
const ALL_PROJECTS = "All Projects";

// Maps the backend's task.status enum to the column keys this board uses.
const STATUS_TO_COLUMN = {
    assigned: "todo",
    blocker: "blocker",
    progress: "in-progress",
    completed: "completed",
};

// Inverse map for sending status back to the API.
const COLUMN_TO_STATUS = {
    todo: "assigned",
    blocker: "blocker",
    "in-progress": "progress",
    completed: "completed",
};

const ANIMATION_STYLES = `
@keyframes taskboard-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes taskboard-card-in {
    from { opacity: 0; transform: translateY(14px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes taskboard-pop {
    0% { transform: scale(1); }
    35% { transform: scale(1.25); }
    100% { transform: scale(1); }
}
.tb-header-in {
    animation: taskboard-fade-in 0.5s ease-out both;
}
.tb-column-in {
    animation: taskboard-fade-in 0.45s ease-out both;
}
.tb-card-in {
    animation: taskboard-card-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.tb-badge-pop {
    animation: taskboard-pop 0.35s ease-out;
}
.tb-empty-in {
    animation: taskboard-fade-in 0.3s ease-out both;
}
.tb-scroll-col {
    scroll-behavior: smooth;
}
.tb-scroll-col::-webkit-scrollbar {
    width: 6px;
}
.tb-scroll-col::-webkit-scrollbar-track {
    background: transparent;
}
.tb-scroll-col::-webkit-scrollbar-thumb {
    background-color: rgba(100, 116, 139, 0.3);
    border-radius: 9999px;
}
.tb-scroll-col::-webkit-scrollbar-thumb:hover {
    background-color: rgba(100, 116, 139, 0.5);
}
`;

// Formats an ISO/date-ish value into the short "Apr 30" style the cards use.
function formatShortDate(dateInput) {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// Normalizes a raw task from GET /user/my-tasks into the flat shape the
// board's cards/columns expect.
function normalizeTask(task) {
    return {
        id: task._id,
        title: task.title,
        description: task.description,
        assignedDateRaw: task.createdAt || null,
        assignedDate: formatShortDate(task.createdAt),
        deadlineRaw: task.deadline || null,
        deadline: formatShortDate(task.deadline),
        assignee: task.assignee?.name || "Unassigned",
        project: task.project?.projectName || "—",
        priority: (task.priority || "").toLowerCase(),
        status: STATUS_TO_COLUMN[task.status] || "todo",
        updatedAt: task.updatedAt ? new Date(task.updatedAt).getTime() : 0,
    };
}

// Modern custom dropdown — replaces the plain native <select>.
function ModernSelect({ value, options, onChange, loading }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative z-30 self-start sm:self-auto min-w-[200px]">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                disabled={loading}
                className={`w-full flex items-center justify-between gap-3 border rounded-lg px-4 py-2 text-sm text-slate-700 bg-white shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${open
                    ? "border-indigo-500 ring-2 ring-indigo-500/40"
                    : "border-slate-300 hover:shadow-md hover:border-indigo-300"
                    }`}
            >
                <span className="truncate">{loading ? "Loading projects..." : value}</span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
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
                                className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors duration-100 ${isSelected
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "text-slate-700 hover:text-indigo-600"
                                    }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function CardMoveSelect({ currentStatus, onMoveStatus }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="sm:hidden relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase rounded-lg py-1.5 pl-3 pr-2 transition-colors duration-150"
            >
                Move
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 bottom-full mb-1.5 z-[60] w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 origin-bottom-right animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Move task to...
                    </div>
                    {COLUMNS.map((col) => {
                        const isSelected = col.key === currentStatus;
                        return (
                            <button
                                key={col.key}
                                type="button"
                                disabled={isSelected}
                                onClick={() => {
                                    if (!isSelected) {
                                        onMoveStatus(col.key);
                                    }
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-[12px] font-bold uppercase rounded-lg transition-colors duration-150 ${
                                    isSelected
                                        ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                                        : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                                }`}
                            >
                                {col.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TaskCard({ task, onDragStart, onMoveStatus, style }) {
    const flagColor = task.priority === "high" ? "text-rose-500" : "text-amber-400";
    const isBlocked = task.status === "blocker";

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            style={style}
            className={`tb-card-in bg-white rounded-xl border p-4 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 select-none ${isBlocked ? "border-rose-200 hover:border-rose-300" : "border-slate-200 hover:border-indigo-200"
                }`}
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-[16px] font-semibold text-slate-900 leading-snug">
                    {task.title}
                </h3>
                <Flag className={`w-4 h-4 shrink-0 mt-0.5 ${flagColor}`} />
            </div>

            {/* Description */}
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
                {task.description}
            </p>

            {/* Blocked notice */}
            {isBlocked && (
                <div className="flex items-center gap-1.5 mb-3 text-[12px] font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Blocked — needs attention
                </div>
            )}

            {/* Assigned date + Deadline */}
            <div className="flex items-center justify-between text-[12px] mb-3">
                <span className="flex items-center gap-1.5 text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Assigned</span>
                    <span className="text-slate-600 font-medium">{task.assignedDate}</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Due</span>
                    <span className="text-red-500 font-medium">{task.deadline}</span>
                </span>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-3">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 font-medium">{task.assignee}</span>
            </div>

            {/* Footer: Project tag & Mobile Move */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                <span className="text-[12px] font-medium text-slate-500 truncate pr-2">
                    {task.project}
                </span>
                <CardMoveSelect
                    currentStatus={task.status}
                    onMoveStatus={(newStatus) => onMoveStatus && onMoveStatus(task.id, newStatus)}
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-column state shape:
//   { tasks: [], page: 1, totalPages: 1, total: 0, loading: false, loadingMore: false, error: null }
// ──────────────────────────────────────────────────────────────────────────────
function makeColState() {
    return { tasks: [], page: 1, totalPages: 1, total: 0, loading: true, loadingMore: false, error: null };
}

export default function TaskBoard() {
    // colData[colKey] = { tasks, page, totalPages, total, loading, loadingMore, error }
    const [colData, setColData] = useState(() => {
        const init = {};
        COLUMNS.forEach((c) => { init[c.key] = makeColState(); });
        return init;
    });

    const [dragTaskId, setDragTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    const [poppedCol, setPoppedCol] = useState(null);
    const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS);
    const [projects, setProjects] = useState([ALL_PROJECTS]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const popTimeout = useRef(null);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const setCol = useCallback((colKey, patch) => {
        setColData((prev) => ({
            ...prev,
            [colKey]: { ...prev[colKey], ...(typeof patch === "function" ? patch(prev[colKey]) : patch) },
        }));
    }, []);

    // ── Fetch one page for a column ────────────────────────────────────────────

    const fetchColPage = useCallback(async (col, page, projectFilter, append = false) => {
        const params = {
            status: col.apiStatus,
            page,
            limit: PAGE_LIMIT,
        };

        try {
            const data = await userapiservicer.getMyTasks(params);
            let normalized = (data.tasks || []).map(normalizeTask);

            // If a project filter is active, apply it client-side on the fetched page.
            // (The backend doesn't support project filtering yet; this keeps it light.)
            if (projectFilter && projectFilter !== ALL_PROJECTS) {
                normalized = normalized.filter((t) => t.project === projectFilter);
            }

            setCol(col.key, (prev) => ({
                tasks: append ? [...prev.tasks, ...normalized] : normalized,
                page: data.currentPage || page,
                totalPages: data.totalPages || 1,
                total: data.totalTasks || normalized.length,
                loading: false,
                loadingMore: false,
                error: null,
            }));
        } catch (err) {
            console.error(`Failed to fetch tasks for column "${col.key}":`, err);
            setCol(col.key, {
                loading: false,
                loadingMore: false,
                error: err?.response?.data?.message || "Failed to load tasks",
            });
        }
    }, [setCol]);

    // ── Initial load — fetch page 1 for every column in parallel ──────────────

    useEffect(() => {
        // Reset all columns to loading state
        const init = {};
        COLUMNS.forEach((c) => { init[c.key] = makeColState(); });
        setColData(init);

        COLUMNS.forEach((col) => fetchColPage(col, 1, selectedProject, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject]); // re-fetch all columns when project filter changes

    // ── "Show More" — fetch next page and append ───────────────────────────────

    const handleShowMore = useCallback((col) => {
        const state = colData[col.key];
        if (state.loadingMore || state.page >= state.totalPages) return;
        const nextPage = state.page + 1;
        setCol(col.key, { loadingMore: true });
        fetchColPage(col, nextPage, selectedProject, true);
    }, [colData, selectedProject, setCol, fetchColPage]);

    // ── Projects dropdown ──────────────────────────────────────────────────────

    useEffect(() => {
        let isMounted = true;
        async function loadProjects() {
            setProjectsLoading(true);
            try {
                const res = await userapiservicer.getProjects();
                const list = Array.isArray(res) ? res : res?.projects || [];
                const names = list.map((p) => p.projectName).filter(Boolean);
                if (isMounted) setProjects([ALL_PROJECTS, ...names]);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                // Fallback: derive project list from currently loaded tasks
                if (isMounted) {
                    const allTasks = Object.values(colData).flatMap((c) => c.tasks);
                    const fallback = Array.from(new Set(allTasks.map((t) => t.project)));
                    setProjects([ALL_PROJECTS, ...fallback]);
                }
            } finally {
                if (isMounted) setProjectsLoading(false);
            }
        }
        loadProjects();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Cleanup ────────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => clearTimeout(popTimeout.current);
    }, []);

    // ── Drag & Drop ────────────────────────────────────────────────────────────

    const handleDragStart = (e, id) => {
        setDragTaskId(id);
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => {
            const el = document.querySelector(`[data-task-id="${id}"]`);
            if (el) el.classList.add("opacity-40");
        }, 0);
    };

    const handleDragEnd = () => {
        setDragTaskId(null);
        setDragOverCol(null);
        document.querySelectorAll("[data-task-id]").forEach((el) =>
            el.classList.remove("opacity-40")
        );
    };

    const handleDrop = async (columnKey) => {
        if (dragTaskId == null) return;
        await moveTask(dragTaskId, columnKey);
    };

    const handleMoveTask = async (taskId, columnKey) => {
        await moveTask(taskId, columnKey);
    };

    const moveTask = async (taskId, columnKey) => {
        const apiStatus = COLUMN_TO_STATUS[columnKey];

        // Find the task and its current column
        let prevTask = null;
        let fromColKey = null;
        for (const col of COLUMNS) {
            const found = colData[col.key].tasks.find((t) => t.id === taskId);
            if (found) {
                prevTask = found;
                fromColKey = col.key;
                break;
            }
        }

        if (!prevTask || prevTask.status === columnKey) {
            setDragTaskId(null);
            setDragOverCol(null);
            return;
        }

        // Optimistic update — remove from source column, add to target column
        setColData((prev) => {
            const next = { ...prev };
            // Remove from source
            next[fromColKey] = {
                ...next[fromColKey],
                tasks: next[fromColKey].tasks.filter((t) => t.id !== taskId),
                total: Math.max(0, next[fromColKey].total - 1),
            };
            // Add to target (at top, since most recently updated)
            const movedTask = { ...prevTask, status: columnKey, updatedAt: Date.now() };
            next[columnKey] = {
                ...next[columnKey],
                tasks: [movedTask, ...next[columnKey].tasks],
                total: next[columnKey].total + 1,
            };
            return next;
        });

        setDragTaskId(null);
        setDragOverCol(null);
        setPoppedCol(columnKey);
        clearTimeout(popTimeout.current);
        popTimeout.current = setTimeout(() => setPoppedCol(null), 350);

        try {
            await userapiservicer.updateTaskStatus(taskId, apiStatus);
        } catch (err) {
            console.error("Failed to update task status:", err);
            setGlobalError(err?.response?.data?.message || "Failed to update task status. Please try again.");
            // Roll back: re-fetch both affected columns
            const fromCol = COLUMNS.find((c) => c.key === fromColKey);
            const toCol = COLUMNS.find((c) => c.key === columnKey);
            if (fromCol) fetchColPage(fromCol, 1, selectedProject, false);
            if (toCol) fetchColPage(toCol, 1, selectedProject, false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    const anyLoading = COLUMNS.every((c) => colData[c.key].loading);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
            <style>{ANIMATION_STYLES}</style>

            {/* Page Header */}
            <div className="tb-header-in relative z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Task Board</h1>
                    <p className="text-slate-500 text-sm sm:text-[16px] mt-1">Drag tasks between columns to update status</p>
                </div>
                <ModernSelect
                    value={selectedProject}
                    options={projects}
                    onChange={setSelectedProject}
                    loading={projectsLoading}
                />
            </div>

            {globalError && (
                <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2.5 flex items-center justify-between">
                    <span>{globalError}</span>
                    <button onClick={() => setGlobalError(null)} className="ml-4 text-rose-400 hover:text-rose-600 font-bold text-base leading-none">×</button>
                </div>
            )}

            {anyLoading ? (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-16">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading tasks...
                </div>
            ) : (
                /* Kanban Columns */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
                    {COLUMNS.map((col, colIndex) => {
                        const state = colData[col.key];
                        const isOver = dragOverCol === col.key;
                        const hasMore = state.page < state.totalPages;

                        return (
                            <div
                                key={col.key}
                                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                                onDragLeave={() => setDragOverCol(null)}
                                onDrop={() => handleDrop(col.key)}
                                onDragEnd={handleDragEnd}
                                style={{ animationDelay: `${colIndex * 80}ms` }}
                                className={`tb-column-in flex flex-col rounded-xl w-full h-full ${col.colBorder} ${isOver ? col.dropHighlight : col.bgColor} transition-colors duration-200`}
                            >
                                {/* Column Header */}
                                <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
                                    <span className={`flex items-center gap-1.5 text-[15px] font-bold tracking-widest uppercase ${col.headerColor}`}>
                                        {col.key === "blocker" && <AlertTriangle className="w-4 h-4" />}
                                        {col.label}
                                    </span>
                                    <span
                                        key={state.total}
                                        className={`min-w-[26px] h-[26px] px-1.5 flex items-center justify-center rounded-full text-[12px] font-bold ${col.badgeBg} ${col.badgeText} ${poppedCol === col.key ? "tb-badge-pop" : ""}`}
                                    >
                                        {state.loading ? "…" : state.total}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="tb-scroll-col px-4 pb-5 flex flex-col gap-3 flex-1 max-h-[calc(100vh-260px)] overflow-y-auto">
                                    {state.loading ? (
                                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-10">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading…
                                        </div>
                                    ) : state.error ? (
                                        <div className="text-[13px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                                            {state.error}
                                        </div>
                                    ) : (
                                        <>
                                            {state.tasks.map((task, i) => (
                                                <div key={task.id} data-task-id={task.id}>
                                                    <TaskCard
                                                        task={task}
                                                        onDragStart={handleDragStart}
                                                        onMoveStatus={handleMoveTask}
                                                        style={{ animationDelay: `${i * 60}ms` }}
                                                    />
                                                </div>
                                            ))}

                                            {/* Show More — triggers next backend page */}
                                            {hasMore && (
                                                <button
                                                    onClick={() => handleShowMore(col)}
                                                    disabled={state.loadingMore}
                                                    className="w-full py-2 mt-1 border border-slate-300 border-dashed rounded-xl text-slate-500 font-semibold text-[13px] hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {state.loadingMore ? (
                                                        <>
                                                            <Loader2 size={13} className="animate-spin opacity-70" />
                                                            Loading…
                                                        </>
                                                    ) : (
                                                        <>
                                                            Show More
                                                            <ChevronDown size={14} className="opacity-70" />
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {state.tasks.length === 0 && (
                                                <div
                                                    className={`tb-empty-in rounded-xl border-2 border-dashed ${col.emptyBorder} flex-1 min-h-[110px] flex items-center justify-center text-center`}
                                                >
                                                    <p className="text-[14px] font-medium text-slate-400">Drop tasks here</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}