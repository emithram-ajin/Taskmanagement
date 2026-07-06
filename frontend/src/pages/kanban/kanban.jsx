import React, { useState } from "react";
import { Flag, CalendarDays, User } from "lucide-react";

const initialTasks = [
    { id: 1, title: "Database migration", description: "Migrate analytics data to new schema", date: "Apr 30", assignee: "James", project: "Dashboard Redesign", priority: "high", status: "todo" },
    { id: 2, title: "Push notification service", description: "Implement push notifications for iOS and Android", date: "May 1", assignee: "Priya", project: "Mobile App Launch", priority: "medium", status: "todo" },
    { id: 3, title: "Implement analytics charts", description: "Build interactive charts using Recharts library", date: "Apr 20", assignee: "Sarah", project: "Dashboard Redesign", priority: "high", status: "in-progress" },
    { id: 4, title: "API endpoint optimization", description: "Improve response times for dashboard APIs", date: "Apr 25", assignee: "Priya", project: "Dashboard Redesign", priority: "high", status: "in-progress" },
    { id: 5, title: "Mobile UI components", description: "Build reusable component library for mobile app", date: "Apr 15", assignee: "Marcus", project: "Mobile App Launch", priority: "high", status: "in-progress" },
    { id: 6, title: "Social media graphics", description: "Create graphics for LinkedIn, Twitter, Instagram", date: "Apr 20", assignee: "Emma", project: "Q2 Campaign", priority: "medium", status: "in-progress" },
    { id: 7, title: "Design new dashboard layout", description: "Create wireframes and mockups for the new dashboard", date: "Mar 15", assignee: "Sarah", project: "Dashboard Redesign", priority: "high", status: "completed" },
    { id: 8, title: "Content strategy document", description: "Define messaging and content calendar for Q2", date: "Apr 5", assignee: "Emma", project: "Q2 Campaign", priority: "medium", status: "completed" },
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

function TaskCard({ task, onDragStart }) {
    const flagColor = task.priority === "high" ? "text-rose-500" : "text-amber-400";

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
            className="bg-white rounded-xl border border-slate-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 select-none"
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">
                    {task.title}
                </h3>
                <Flag className={`w-4 h-4 shrink-0 mt-0.5 ${flagColor}`} />
            </div>

            {/* Description */}
            <p className="text-[13px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
                {task.description}
            </p>

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
            <div className="pt-3 border-t border-slate-100">
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
            prev.map((t) => (t.id === dragTaskId ? { ...t, status } : t))
        );
        setDragTaskId(null);
        setDragOverCol(null);
    };

    return (
        <div className="px-8 py-6 flex flex-col md:h-screen md:overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Task Board</h1>
                    <p className="text-slate-500 text-[16px] mt-1">Drag tasks between columns to update status</p>
                </div>
                <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer self-start sm:self-auto">
                    <option>All Projects</option>
                    <option>Dashboard Redesign</option>
                    <option>Mobile App Launch</option>
                    <option>Q2 Campaign</option>
                </select>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:flex-1 md:min-h-0 pb-6 md:pb-0">
                {COLUMNS.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.key);
                    const isOver = dragOverCol === col.key;

                    return (
                        <div
                            key={col.key}
                            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                            onDragLeave={() => setDragOverCol(null)}
                            onDrop={() => handleDrop(col.key)}
                            className={`flex flex-col rounded-xl ${col.colBorder} ${isOver ? col.dropHighlight : col.bgColor} md:h-full transition-colors duration-150`}
                        >
                            {/* Column Header */}
                            <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
                                <span className={`text-[15px] font-bold tracking-widest uppercase ${col.headerColor}`}>
                                    {col.label}
                                </span>
                                <span className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold ${col.badgeBg} ${col.badgeText}`}>
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="px-4 pb-5 flex flex-col gap-3 md:flex-1 md:min-h-0 md:overflow-y-auto">
                                {colTasks.map((task) => (
                                    <div key={task.id} data-task-id={task.id}>
                                        <TaskCard task={task} onDragStart={handleDragStart} />
                                    </div>
                                ))}

                                {colTasks.length === 0 && (
                                    <div className="flex-1 min-h-[80px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
                                        Drop tasks here
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