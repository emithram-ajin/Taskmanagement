import React, { useState } from "react";
import { Plus, AlertCircle, CheckCircle2, X, Check } from "lucide-react";

const CURRENT_USER = "Priya Patel";

const TASK_OPTIONS = [

    "Push notification service",
    "Implement analytics charts",
    "API endpoint optimization",
];

const initialBlockers = [
    {
        id: 1,
        description: "Missing database credentials for production migration",
        task: "Database migration",
        reporter: "Priya Patel",
        reported: "Apr 9, 2026",
        status: "open",
    },
];

function formatToday() {
    return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function BlockerTracking() {
    const [blockers, setBlockers] = useState(initialBlockers);
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState("");
    const [task, setTask] = useState("");

    const openBlockers = blockers.filter((b) => b.status === "open");
    const resolvedBlockers = blockers.filter((b) => b.status === "resolved");

    const handleReport = () => {
        if (!description.trim() || !task) return;

        const newBlocker = {
            id: Date.now(),
            description: description.trim(),
            task,
            reporter: CURRENT_USER,
            reported: formatToday(),
            status: "open",
        };

        setBlockers((prev) => [newBlocker, ...prev]);
        setDescription("");
        setTask("");
        setShowForm(false);
    };

    const handleResolve = (id) => {
        setBlockers((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "resolved" } : b))
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 px-8 py-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Blocker Tracking</h1>
                    <p className="text-slate-700 text-[16px] mt-1">Report issues blocking your tasks</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-md rounded-lg px-5 py-2.5 transition-colors duration-150 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Report Blocker
                </button>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {/* Open Blockers */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full min-h-[260px]">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-[20px] font-semibold text-slate-900">
                            Open Blockers ({openBlockers.length})
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {openBlockers.map((blocker) => (
                            <div
                                key={blocker.id}
                                className="bg-rose-50 border border-rose-100 rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <p className="text-[15px] font-semibold text-rose-900 leading-snug">
                                        {blocker.description}
                                    </p>
                                    <button
                                        onClick={() => handleResolve(blocker.id)}
                                        title="Mark as resolved"
                                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-white border border-rose-200 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors duration-150"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[14px] text-rose-700">Task: {blocker.task}</p>
                                <p className="text-[14px] text-rose-700">Reporter: {blocker.reporter}</p>
                                <p className="text-[14px] text-rose-700">Reported: {blocker.reported}</p>
                            </div>
                        ))}

                        {openBlockers.length === 0 && (
                            <p className="text-slate-400 text-sm">No open blockers 🎉</p>
                        )}
                    </div>
                </div>

                {/* Resolved */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-full min-h-[260px]">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h2 className="text-[20px] font-semibold text-slate-900">
                            Resolved ({resolvedBlockers.length})
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {resolvedBlockers.map((blocker) => (
                            <div
                                key={blocker.id}
                                className="bg-emerald-50 border border-emerald-100 rounded-lg p-4"
                            >
                                <p className="text-[15px] font-normal text-emerald-900 leading-snug mb-2  decoration-emerald-400">
                                    {blocker.description}
                                </p>
                                <p className="text-[13px] text-emerald-700">Task: {blocker.task}</p>
                                <p className="text-[14px] text-emerald-700">Reporter: {blocker.reporter}</p>
                                <p className="text-[13px] text-emerald-700">Reported: {blocker.reported}</p>
                            </div>
                        ))}

                        {resolvedBlockers.length === 0 && (
                            <p className="text-slate-400 text-md">No resolved blockers yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Blocker Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-md p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-900">Report Blocker</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">
                                    Related Task
                                </label>
                                <select
                                    value={task}
                                    onChange={(e) => setTask(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                                >
                                    <option value="">Select a task</option>
                                    {TASK_OPTIONS.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what's blocking your progress..."
                                    rows={4}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y"
                                />
                            </div>

                            <div className="flex gap-3 mt-1">
                                <button
                                    onClick={handleReport}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors duration-150"
                                >
                                    Report Blocker
                                </button>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors duration-150"
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