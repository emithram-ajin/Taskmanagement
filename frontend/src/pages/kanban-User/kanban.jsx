import React, { useState, useEffect, useRef, useMemo } from "react";
import { Flag, CalendarDays, User, ChevronDown, AlertTriangle } from "lucide-react";

const initialTasks = [
    { id: 1, title: "Database migration", description: "Migrate analytics data to new schema", date: "Apr 30", assignee: "James", project: "Dashboard Redesign", priority: "high", status: "todo", updatedAt: 0 },
    { id: 2, title: "Push notification service", description: "Implement push notifications for iOS and Android", date: "May 1", assignee: "Priya", project: "Mobile App Launch", priority: "medium", status: "todo", updatedAt: 0 },
    { id: 3, title: "Implement analytics charts", description: "Build interactive charts using Recharts library", date: "Apr 20", assignee: "Sarah", project: "Dashboard Redesign", priority: "high", status: "in-progress", updatedAt: 0 },
    { id: 4, title: "API endpoint optimization", description: "Improve response times for dashboard APIs", date: "Apr 25", assignee: "Priya", project: "Dashboard Redesign", priority: "high", status: "in-progress", updatedAt: 0 },
    { id: 5, title: "Mobile UI components", description: "Build reusable component library for mobile app", date: "Apr 15", assignee: "Marcus", project: "Mobile App Launch", priority: "high", status: "in-progress", updatedAt: 0 },
    { id: 6, title: "Social media graphics", description: "Create graphics for LinkedIn, Twitter, Instagram", date: "Apr 20", assignee: "Emma", project: "Q2 Campaign", priority: "medium", status: "in-progress", updatedAt: 0 },
    { id: 7, title: "Design new dashboard layout", description: "Create wireframes and mockups for the new dashboard", date: "Mar 15", assignee: "Sarah", project: "Dashboard Redesign", priority: "high", status: "completed", updatedAt: 0 },
    { id: 8, title: "Content strategy document", description: "Define messaging and content calendar for Q2", date: "Apr 5", assignee: "Emma", project: "Q2 Campaign", priority: "medium", status: "completed", updatedAt: 0 },
];

const COLUMNS = [
    {
        key: "todo",
        label: "TO DO",
        headerColor: "text-slate-600",
        colBorder: "border border-slate-200",
        bgColor: "bg-white",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-600",
        dropHighlight: "bg-slate-50",
    },
    {
        key: "blocker",
        label: "BLOCKER",
        headerColor: "text-rose-600",
        colBorder: "border-2 border-rose-300",
        bgColor: "bg-rose-50/40",
        badgeBg: "bg-rose-500",
        badgeText: "text-white",
        dropHighlight: "bg-rose-50",
    },
    {
        key: "in-progress",
        label: "IN PROGRESS",
        headerColor: "text-indigo-600",
        colBorder: "border-2 border-indigo-300",
        bgColor: "bg-indigo-50/40",
        badgeBg: "bg-indigo-500",
        badgeText: "text-white",
        dropHighlight: "bg-indigo-50",
    },
    {
        key: "completed",
        label: "COMPLETED",
        headerColor: "text-emerald-600",
        colBorder: "border-2 border-emerald-300",
        bgColor: "bg-emerald-50/40",
        badgeBg: "bg-emerald-500",
        badgeText: "text-white",
        dropHighlight: "bg-emerald-50",
    },
];

const ALL_PROJECTS = "All Projects";

// One-time injected keyframes so we don't touch any existing design/colors,
// just add motion on top of what's already there.
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
.tb-scroll-row {
    scroll-behavior: smooth;
}
.tb-scroll-row::-webkit-scrollbar {
    height: 8px;
}
.tb-scroll-row::-webkit-scrollbar-track {
    background: transparent;
}
.tb-scroll-row::-webkit-scrollbar-thumb {
    background-color: rgba(100, 116, 139, 0.3);
    border-radius: 9999px;
}
.tb-scroll-row::-webkit-scrollbar-thumb:hover {
    background-color: rgba(100, 116, 139, 0.5);
}
`;

// Modern custom dropdown — replaces the plain native <select>.
function ModernSelect({ value, options, onChange }) {
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
                className={`w-full flex items-center justify-between gap-3 border rounded-lg px-4 py-2 text-sm text-slate-700 bg-white shadow-sm transition-all duration-150 cursor-pointer ${open
                        ? "border-indigo-500 ring-2 ring-indigo-500/40"
                        : "border-slate-300 hover:shadow-md hover:border-indigo-300"
                    }`}
            >
                <span className="truncate">{value}</span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
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

function TaskCard({ task, onDragStart, style }) {
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

            {/* Date + Assignee */}
            <div className="flex items-center justify-between text-[12px] text-slate-500 mb-3">
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    {task.date}
                </span>
                <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600 font-medium">{task.assignee}</span>
                </span>
            </div>

            {/* Project tag */}
            <div className=" ">
                <span className="text-[13px] font-normal text-gray-600">
                    {task.project}
                </span>
            </div>
        </div>
    );
}

export default function TaskBoard() {
    const [tasks, setTasks] = useState(initialTasks);
    const [dragTaskId, setDragTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    const [poppedCol, setPoppedCol] = useState(null);
    const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS);
    const popTimeout = useRef(null);

    const projects = useMemo(
        () => [ALL_PROJECTS, ...Array.from(new Set(tasks.map((t) => t.project)))],
        [tasks]
    );

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

    const handleDrop = (status) => {
        if (dragTaskId == null) return;
        setTasks((prev) =>
            prev.map((t) => (t.id === dragTaskId ? { ...t, status, updatedAt: Date.now() } : t))
        );
        setDragTaskId(null);
        setDragOverCol(null);

        // Briefly pop the destination column's count badge to
        // acknowledge the drop, then clear it back to normal.
        setPoppedCol(status);
        clearTimeout(popTimeout.current);
        popTimeout.current = setTimeout(() => setPoppedCol(null), 350);
    };

    return (
        <div className="px-8 py-6 flex flex-col">
            <style>{ANIMATION_STYLES}</style>

            {/* Page Header */}
            <div className="tb-header-in relative z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Task Board</h1>
                    <p className="text-slate-500 text-[16px] mt-1">Drag tasks between columns to update status</p>
                </div>
                <ModernSelect
                    value={selectedProject}
                    options={projects}
                    onChange={setSelectedProject}
                />
            </div>

            {/* Kanban Columns */}
            <div className="tb-scroll-row flex gap-5 pb-6 items-stretch overflow-x-auto">
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
                            className={`tb-column-in flex flex-col rounded-xl w-[480px] shrink-0 ${col.colBorder} ${isOver ? col.dropHighlight : col.bgColor} transition-colors duration-200`}
                        >
                            {/* Column Header */}
                            <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
                                <span className={`flex items-center gap-1.5 text-[15px] font-bold tracking-widest uppercase ${col.headerColor}`}>
                                    {col.key === "blocker" && <AlertTriangle className="w-4 h-4" />}
                                    {col.label}
                                </span>
                                <span
                                    key={colTasks.length}
                                    className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold ${col.badgeBg} ${col.badgeText} ${poppedCol === col.key ? "tb-badge-pop" : ""}`}
                                >
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="px-4 pb-5 flex flex-col gap-3 flex-1">
                                {colTasks.map((task, i) => (
                                    <div key={task.id} data-task-id={task.id}>
                                        <TaskCard
                                            task={task}
                                            onDragStart={handleDragStart}
                                            style={{ animationDelay: `${i * 60}ms` }}
                                        />
                                    </div>
                                ))}

                                {colTasks.length === 0 && col.key === "blocker" && (
                                   <div className="tb-empty-in bg-white rounded-xl border border-dashed border-rose-200 p-4 w-full h-38 flex flex-col items-center justify-center text-center gap-1.5">
                                        <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
                                            <AlertTriangle className="w-4 h-4 text-rose-300" />
                                        </div>
                                        <p className="text-[13px] font-semibold text-slate-500">No reported blockers</p>
                                        <p className="text-[12px] text-slate-400">Everything's running smoothly</p>
                                    </div>
                                )}

                                {colTasks.length === 0 && col.key !== "blocker" && (
                                    <div className="tb-empty-in flex-1 flex items-center justify-center text-slate-400 text-sm">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}