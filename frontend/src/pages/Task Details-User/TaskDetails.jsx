import React, { useState, useRef, useEffect } from "react";
import { Pencil, X, ChevronDown, Check } from "lucide-react";

// Sample data — replace with props / API data in your real app
const initialTasks = [
    {
        id: 1,
        title: "API endpoint optimization",
        description: "Improve response times for dashboard APIs",
        project: "Dashboard Redesign",
        assignee: "Priya Patel",
        status: "in progress",
        priority: "medium",
        deadline: "25-04-2026",
    },
    {
        id: 2,
        title: "Push notification service",
        description: "Implement push notifications for iOS and Android",
        project: "Mobile App Launch",
        assignee: "Priya Patel",
        status: "todo",
        priority: "medium",
        deadline: "01-05-2026",
    },
];

const PROJECT_OPTIONS = ["Dashboard Redesign", "Mobile App Launch", "Q2 Campaign"];
const ASSIGNEE_OPTIONS = ["Priya Patel", "Sarah", "James", "Marcus", "Emma"];
const STATUS_OPTIONS = [
    { value: "todo", label: "To Do" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
];
const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

function StatusBadge({ status }) {
    const styles =
        status === "in progress"
            ? "bg-indigo-100 text-indigo-700"
            : status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600 border border-gray-300";
    const label =
        STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
    return (
        <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${styles}`}>
            {label}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const styles =
        priority === "high"
            ? "bg-rose-100 text-rose-700 border border-rose-300"
            : priority === "low"
                ? "bg-gray-100 text-gray-600 border border-gray-300"
                : "bg-amber-100 text-amber-800 border border-amber-300";
    const label =
        PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || priority;
    return (
        <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${styles}`}>
            {label}
        </span>
    );
}

// A modern custom dropdown to replace the plain native <select>.
function ModernSelect({ value, options, onChange, placeholder = "Select..." }) {
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

    // Normalize options to { value, label } objects
    const normalized = options.map((o) =>
        typeof o === "string" ? { value: o, label: o } : o
    );
    const selected = normalized.find((o) => o.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm text-left bg-white transition-colors duration-150 ${open
                        ? "border-indigo-500 ring-2 ring-indigo-500/40"
                        : "border-gray-300 hover:border-indigo-300"
                    }`}
            >
                <span className={selected ? "text-gray-800" : "text-gray-400"}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto animate-[fadeIn_0.12s_ease-out]">
                    {normalized.map((option) => {
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
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {option.label}
                                {isSelected && <Check size={15} className="text-indigo-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function TaskDetails() {
    const [tasks, setTasks] = useState(initialTasks);
    const [editingTask, setEditingTask] = useState(null);
    const [form, setForm] = useState(null);

    const openEditModal = (task) => {
        alert("Coming soon");
        // setEditingTask(task);
        // setForm({ ...task });
    };

    const closeModal = () => {
        setEditingTask(null);
        setForm(null);
    };

    const handleUpdate = () => {
        if (!form.title.trim()) return;
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...form } : t)));
        closeModal();
    };

    return (
        <div className="bg-slate-50 min-h-screen px-8 py-6">
            {/* Title */}
            <h1 className="text-[32px] font-bold text-gray-900 mb-1">
                Task Management
            </h1>
            <p className="text-gray-500 text-[15px] mb-6">Create and manage tasks</p>

            {/* Table card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-white">
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Task
                            </th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Project
                            </th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Assignee
                            </th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Status
                            </th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Priority
                            </th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Deadline
                            </th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, i) => (
                            <tr
                                key={task.id}
                                className={i !== tasks.length - 1 ? "border-b border-gray-100" : ""}
                            >
                                <td className="px-6 py-5 align-top">
                                    <div className="text-[15px] font-bold text-gray-900">
                                        {task.title}
                                    </div>
                                    <div className="text-[13px] text-gray-500 mt-0.5">
                                        {task.description}
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-top text-[15px] text-gray-800">
                                    {task.project}
                                </td>
                                <td className="px-6 py-5 align-top text-[15px] text-gray-800">
                                    {task.assignee}
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <PriorityBadge priority={task.priority} />
                                </td>
                                <td className="px-6 py-5 align-top text-[15px] font-medium text-red-500">
                                    {task.deadline}
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <button
                                        onClick={() => openEditModal(task)}
                                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                        aria-label={`Edit ${task.title}`}
                                    >
                                        <Pencil size={16} className="text-gray-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Task Modal — temporarily disabled, pencil icon shows a "Coming soon" alert instead. */}
            {false && editingTask && form && (
                <div
                    className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
                    onClick={closeModal}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Task Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y transition-colors duration-150"
                                />
                            </div>

                            {/* Project */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Project
                                </label>
                                <ModernSelect
                                    value={form.project}
                                    options={PROJECT_OPTIONS}
                                    onChange={(val) => setForm({ ...form, project: val })}
                                />
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Assignee
                                </label>
                                <ModernSelect
                                    value={form.assignee}
                                    options={ASSIGNEE_OPTIONS}
                                    onChange={(val) => setForm({ ...form, assignee: val })}
                                />
                            </div>

                            {/* Status + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Status
                                    </label>
                                    <ModernSelect
                                        value={form.status}
                                        options={STATUS_OPTIONS}
                                        onChange={(val) => setForm({ ...form, status: val })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Priority
                                    </label>
                                    <ModernSelect
                                        value={form.priority}
                                        options={PRIORITY_OPTIONS}
                                        onChange={(val) => setForm({ ...form, priority: val })}
                                    />
                                </div>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Deadline
                                </label>
                                <input
                                    type="text"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    placeholder="DD-MM-YYYY"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-1">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors duration-150"
                                >
                                    Update Task
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}