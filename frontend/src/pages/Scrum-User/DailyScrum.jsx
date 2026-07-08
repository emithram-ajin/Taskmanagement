import React, { useState } from "react";
import { CalendarDays } from "lucide-react";

const CURRENT_USER = {
    name: "Priya Patel",
    initial: "P",
};

const initialUpdates = [
    {
        id: 1,
        name: CURRENT_USER.name,
        initial: CURRENT_USER.initial,
        date: "Friday, April 10, 2026",
        yesterday: "Optimized 3 API endpoints, reduced response time by 40%",
        today: "Continue API optimization, start database migration planning",
        blockers: "Waiting for database credentials from DevOps",
    },
];

function formatToday() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function DailyScrum() {
    const [updates, setUpdates] = useState(initialUpdates);
    const [yesterday, setYesterday] = useState("");
    const [today, setToday] = useState("");
    const [blockers, setBlockers] = useState("");

    const handleSubmit = () => {
        if (!yesterday.trim() && !today.trim()) return;

        const newUpdate = {
            id: Date.now(),
            name: CURRENT_USER.name,
            initial: CURRENT_USER.initial,
            date: formatToday(),
            yesterday: yesterday.trim() || "—",
            today: today.trim() || "—",
            blockers: blockers.trim() || "None",
        };

        setUpdates((prev) => [newUpdate, ...prev]);
        setYesterday("");
        setToday("");
        setBlockers("");
    };

    return (
        <div className="min-h-screen bg-slate-50 px-8 py-6">
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
                                What did you do yesterday?
                            </label>
                            <textarea
                                value={yesterday}
                                onChange={(e) => setYesterday(e.target.value)}
                                placeholder="Describe your accomplishments from yesterday..."
                                rows={3}
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
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
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
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
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="self-start bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors duration-150"
                        >
                            Submit Update
                        </button>
                    </div>
                </div>

                {/* My Updates */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-5">My Updates</h2>

                    <div className="flex flex-col">
                        {updates.map((update, idx) => (
                            <div
                                key={update.id}
                                className={`py-5 ${idx !== 0 ? "border-t border-slate-100 -mx-6 px-6" : "pt-0"}`}
                            >
                                {/* Author row */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                        {update.initial}
                                    </div>
                                    <div>
                                        <p className="text-[16.5px] font-semibold text-slate-900">{update.name}</p>
                                        <p className="text-[13px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                            {update.date}
                                        </p>
                                    </div>
                                </div>

                                {/* Yesterday */}
                                <div className="mb-3">
                                    <p className="text-[14px] font-semibold text-slate-800 mb-1">Yesterday</p>
                                    <p className="text-[15px] text-slate-600 leading-relaxed">{update.yesterday}</p>
                                </div>

                                {/* Today */}
                                <div className="mb-3">
                                    <p className="text-[14px] font-semibold text-slate-800 mb-1">Today</p>
                                    <p className="text-[15px] text-slate-600 leading-relaxed">{update.today}</p>
                                </div>

                                {/* Blockers */}
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-800 mb-1">Blockers</p>
                                    <p
                                        className={`text-[15px] leading-relaxed ${
                                            update.blockers && update.blockers.toLowerCase() !== "none"
                                                ? "text-rose-600 font-medium"
                                                : "text-slate-600"
                                        }`}
                                    >
                                        {update.blockers}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {updates.length === 0 && (
                            <p className="text-slate-400 text-sm py-4">No updates submitted yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}