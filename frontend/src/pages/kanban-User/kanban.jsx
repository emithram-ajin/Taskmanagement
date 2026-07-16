import React, { useState, useEffect, useRef, useMemo } from "react";
import { Flag, CalendarDays, User, ChevronDown, AlertTriangle, Loader2 } from "lucide-react";
import userapiservicer from "../../services/userapiServices";

// Order here drives the left-to-right column order on the board.
const COLUMNS = [
    {
        key: "todo",
        label: "TO DO",
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
        headerColor: "text-emerald-600",
        colBorder: "border border-emerald-200",
        bgColor: "bg-emerald-50/30",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-700",
        dropHighlight: "bg-emerald-50",
        emptyBorder: "border-emerald-200",
    },
];

const ALL_PROJECTS = "All Projects";

// Maps the backend's task.status enum to the column keys this board uses.
// (Board columns use "todo" / "in-progress"; the API uses "assigned" / "progress".)
const STATUS_TO_COLUMN = {
    assigned: "todo",
    blocker: "blocker",
    progress: "in-progress",
    completed: "completed",
};

// Inverse map, in case you need to send a column key back to the API later
// (e.g. when persisting a drag-and-drop status change).
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

export default function TaskBoard() {
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState(null);

    const [dragTaskId, setDragTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    const [poppedCol, setPoppedCol] = useState(null);
    const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS);
    const [projects, setProjects] = useState([ALL_PROJECTS]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const popTimeout = useRef(null);

    // Fetch the logged-in user's tasks for the board, same endpoint TaskDetails uses.
    useEffect(() => {
        let isMounted = true;

        async function loadTasks() {
            setTasksLoading(true);
            setTasksError(null);
            try {
                const data = await userapiservicer.getMyTasks();
                const normalized = (data.tasks || []).map(normalizeTask);
                if (isMounted) setTasks(normalized);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
                if (isMounted) {
                    setTasksError(err?.response?.data?.message || "Failed to load tasks");
                }
            } finally {
                if (isMounted) setTasksLoading(false);
            }
        }

        loadTasks();
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch the project list from the API for the dropdown.
    useEffect(() => {
        let isMounted = true;

        async function loadProjects() {
            setProjectsLoading(true);
            try {
                const res = await userapiservicer.getProjects();
                const list = Array.isArray(res) ? res : res?.projects || [];
                const names = list.map((p) => p.projectName).filter(Boolean);

                if (isMounted) {
                    setProjects([ALL_PROJECTS, ...names]);
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                // Fallback: derive project list from whatever tasks are currently loaded,
                // so the dropdown still works even if the endpoint is down.
                if (isMounted) {
                    const fallback = Array.from(new Set(tasks.map((t) => t.project)));
                    setProjects([ALL_PROJECTS, ...fallback]);
                }
            } finally {
                if (isMounted) setProjectsLoading(false);
            }
        }

        loadProjects();
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // fetch once on mount

    const visibleTasks =
        selectedProject === ALL_PROJECTS
            ? tasks
            : tasks.filter((t) => t.project === selectedProject);

    useEffect(() => {
        return () => clearTimeout(popTimeout.current);
    }, []);

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

        // Keep the previous state around so we can roll back if the API call fails.
        const prevTasks = tasks;
        const prevTask = tasks.find((t) => t.id === taskId);

        // Nothing to do if it was dropped back into the same column.
        if (!prevTask || prevTask.status === columnKey) {
            setDragTaskId(null);
            setDragOverCol(null);
            return;
        }

        // Optimistic update — move the card immediately, don't wait on the network.
        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId ? { ...t, status: columnKey, updatedAt: Date.now() } : t
            )
        );
        setDragTaskId(null);
        setDragOverCol(null);

        setPoppedCol(columnKey);
        clearTimeout(popTimeout.current);
        popTimeout.current = setTimeout(() => setPoppedCol(null), 350);

        try {
            await userapiservicer.updateTaskStatus(taskId, apiStatus);
        } catch (err) {
            console.error("Failed to update task status:", err);
            // Roll back to the pre-drop state and let the user know.
            setTasks(prevTasks);
            setTasksError(
                err?.response?.data?.message || "Failed to update task status. Please try again."
            );
        }
    };

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

            {tasksError && (
                <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2.5">
                    {tasksError}
                </div>
            )}

            {tasksLoading ? (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-16">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading tasks...
                </div>
            ) : (
                /* Kanban Columns — equal-width grid, fills the container width instead of scrolling horizontally */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">

                    {COLUMNS.map((col, colIndex) => {
                        const colTasks = visibleTasks
                            .filter((t) => t.status === col.key)
                            .slice()
                            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
                        const isOver = dragOverCol === col.key;

                        return (
                            <div
                                key={col.key}
                                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                                onDragLeave={() => setDragOverCol(null)}
                                onDrop={() => handleDrop(col.key)}
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
                                        key={colTasks.length}
                                        className={`min-w-[26px] h-[26px] px-1.5 flex items-center justify-center rounded-full text-[12px] font-bold ${col.badgeBg} ${col.badgeText} ${poppedCol === col.key ? "tb-badge-pop" : ""}`}
                                    >
                                        {colTasks.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="tb-scroll-col px-4 pb-5 flex flex-col gap-3 flex-1 max-h-[calc(100vh-260px)] overflow-y-auto">
                                    {colTasks.map((task, i) => (
                                        <div key={task.id} data-task-id={task.id}>
                                            <TaskCard
                                                task={task}
                                                onDragStart={handleDragStart}
                                                onMoveStatus={handleMoveTask}
                                                style={{ animationDelay: `${i * 60}ms` }}
                                            />
                                        </div>
                                    ))}

                                    {colTasks.length === 0 && (
                                        <div
                                            className={`tb-empty-in rounded-xl border-2 border-dashed ${col.emptyBorder} flex-1 min-h-[110px] flex items-center justify-center text-center`}
                                        >
                                            <p className="text-[14px] font-medium text-slate-400">Drop tasks here</p>
                                        </div>
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