import React from "react";
import { Pencil } from "lucide-react";

// Sample data — replace with props / API data in your real app
const tasks = [
    {
        id: 1,
        title: "API endpoint optimization",
        description: "Improve response times for dashboard APIs",
        project: "Dashboard Redesign",
        assignee: "Priya Patel",
        status: "in progress",
        priority: "medium",
        deadline: "Apr 25, 2026",
    },
    {
        id: 2,
        title: "Push notification service",
        description: "Implement push notifications for iOS and Android",
        project: "Mobile App Launch",
        assignee: "Priya Patel",
        status: "todo",
        priority: "medium",
        deadline: "May 1, 2026",
    },
];

function StatusBadge({ status }) {
    const styles =
        status === "in progress"
            ? "bg-indigo-100 text-indigo-700"
            : "bg-gray-100 text-gray-600 border border-gray-300";
    return (
        <span
            className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${styles}`}
        >
            {status}
        </span>
    );
}

function PriorityBadge({ priority }) {
    return (
        <span className="inline-block px-3 py-1 rounded-md text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            {priority}
        </span>
    );
}

export default function TaskDetails() {
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
        </div>
    );
}