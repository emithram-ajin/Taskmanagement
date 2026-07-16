import React, { useState, useEffect } from "react";
import { AlertCircle, ShieldAlert, Loader2, Pencil, X, Check, ChevronDown, User } from "lucide-react";
import userapiservicer from "../../services/userapiServices";

// Normalizes a raw task doc from GET /user/blocked-tasks or
// GET /user/my-blockers into the shape this page's UI renders.
function normalizeBlockedTask(task) {
    return {
        id: task._id,
        title: task.title,
        description: task.description,
        project: task.project?.projectName || "—",
        assignee: task.assignee?.name || "Unassigned",
        deadline: task.deadline ? new Date(task.deadline) : null,
        createdBy: task.createdBy?.name || "—",
        blockerReason: task.blockerReason || "",
        blockerAssigneeId: task.blockerAssignee?._id || "",
        blockerAssigneeName: task.blockerAssignee?.name || "",
    };
}

function formatDate(dateInput) {
    if (!dateInput) return "—";
    return dateInput.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// Modern animated dropdown for picking a department member to assign the
// blocker to. Options are { value: memberId, label: memberName }.
function ModernSelect({ value, options, onChange, loading, placeholder = "Select a member" }) {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => !loading && setOpen((v) => !v)}
                disabled={loading}
                className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 text-sm text-left bg-white transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
                    open ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-slate-300 hover:border-indigo-300"
                }`}
            >
                <span className={`flex items-center gap-2 truncate ${selected ? "text-slate-700" : "text-slate-400"}`}>
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                        {loading ? "Loading members..." : selected ? selected.label : placeholder}
                    </span>
                </span>
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            <div
                className={`absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto origin-top transition-all duration-150 ${
                    open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
            >
                {options.length === 0 && !loading && (
                    <div className="px-3 py-2 text-sm text-slate-400">No members found</div>
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
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors duration-100 ${
                                isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
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

// Small pill used for names in the table (assignee / blocker-assignee / task owner)
function NamePill({ name, tone = "indigo" }) {
    const tones = {
        indigo: "bg-indigo-100 text-indigo-700",
        slate: "bg-slate-100 text-slate-500",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
            {name}
        </span>
    );
}

export default function BlockerTracking() {
    // Which table is active: "blockers" (default) or "mine"
    const [activeTab, setActiveTab] = useState("blockers");

    const [blockedTasks, setBlockedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Blockers assigned to me (tasks where I'm the blockerAssignee, i.e.
    // someone needs *my* help to unblock them)
    const [myBlockers, setMyBlockers] = useState([]);
    const [myBlockersLoading, setMyBlockersLoading] = useState(true);
    const [myBlockersError, setMyBlockersError] = useState(null);

    // Department members, for the Assign-to dropdown
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(true);

    // Edit modal state
    const [editingTask, setEditingTask] = useState(null);
    const [reason, setReason] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const fetchBlockedTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userapiservicer.getBlockedTasks();
            const list = Array.isArray(data) ? data : data?.tasks || [];
            setBlockedTasks(list.map(normalizeBlockedTask));
        } catch (err) {
            console.error("Failed to fetch blocked tasks:", err);
            setError(err?.response?.data?.message || "Failed to load blocked tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBlockers = async () => {
        setMyBlockersLoading(true);
        setMyBlockersError(null);
        try {
            const data = await userapiservicer.getMyBlockers();
            const list = Array.isArray(data) ? data : data?.tasks || [];
            setMyBlockers(list.map(normalizeBlockedTask));
        } catch (err) {
            console.error("Failed to fetch my blockers:", err);
            setMyBlockersError(err?.response?.data?.message || "Failed to load your blockers");
        } finally {
            setMyBlockersLoading(false);
        }
    };

    const fetchMembers = async () => {
        setMembersLoading(true);
        try {
            const data = await userapiservicer.getMyDepartmentMembers();
            const list = Array.isArray(data) ? data : data?.members || [];
            setMembers(list);
        } catch (err) {
            console.error("Failed to fetch department members:", err);
        } finally {
            setMembersLoading(false);
        }
    };

    useEffect(() => {
        fetchBlockedTasks();
        fetchMyBlockers();
        fetchMembers();
    }, []);

    const memberOptions = members.map((m) => ({ value: m._id, label: m.name }));

    const openEditModal = (task) => {
        setEditingTask(task);
        setReason(task.blockerReason || "");
        setAssigneeId(task.blockerAssigneeId || "");
        setSaveError(null);
    };

    const closeEditModal = () => {
        setEditingTask(null);
        setReason("");
        setAssigneeId("");
        setSaveError(null);
    };

    const handleSaveReason = async () => {
        if (!editingTask) return;

        if (!reason.trim()) {
            setSaveError("Blocker reason is required.");
            return;
        }
        if (!assigneeId) {
            setSaveError("Please select a member to assign this blocker to.");
            return;
        }

        setSaving(true);
        setSaveError(null);
        try {
            const res = await userapiservicer.updateBlockerReason(editingTask.id, {
                blockerReason: reason,
                blockerAssignee: assigneeId,
            });
            const updatedDoc = res?.task || res;
            const assignedMember = members.find((m) => m._id === assigneeId);

            setBlockedTasks((prev) =>
                prev.map((t) =>
                    t.id === editingTask.id
                        ? {
                              ...t,
                              blockerReason: updatedDoc?.blockerReason ?? reason,
                              blockerAssigneeId: updatedDoc?.blockerAssignee?._id || assigneeId,
                              blockerAssigneeName: updatedDoc?.blockerAssignee?.name || assignedMember?.name || t.blockerAssigneeName,
                          }
                        : t
                )
            );
            closeEditModal();

            // The blocker's assignment may have changed to/away from someone
            // else, which affects the "My Blockers" list — refresh it so it
            // stays in sync (e.g. reassigning a blocker away from yourself
            // should make it disappear from your own list, and assigning a
            // blocker to yourself should make it appear).
            fetchMyBlockers();
        } catch (err) {
            console.error("Failed to save reason:", err);
            setSaveError(err?.response?.data?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { key: "blockers", label: "Blockers", icon: AlertCircle, count: blockedTasks.length, loading, error },
        { key: "mine", label: "My Blockers", icon: ShieldAlert, count: myBlockers.length, loading: myBlockersLoading, error: myBlockersError },
    ];

    return (
        <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Page Header */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Blocker Tracking</h1>
                <p className="text-slate-700 text-sm sm:text-[16px] mt-1">Monitor open team blockers</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2 mb-5 border-b border-slate-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150 cursor-pointer ${
                                isActive
                                    ? "border-indigo-600 text-indigo-700"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {!tab.loading && !tab.error && (
                                <span
                                    className={`ml-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                                        isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {activeTab === "blockers" && (
                    <>
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <div className="w-9 h-9 shrink-0 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h2 className="text-[20px] font-semibold text-slate-900">
                                Active Blockers {!loading && !error && `(${blockedTasks.length})`}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center gap-2 text-slate-400 text-sm py-8 px-6">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading blocked tasks...
                            </div>
                        ) : error ? (
                            <p className="text-rose-500 text-sm py-6 px-6">{error}</p>
                        ) : blockedTasks.length === 0 ? (
                            <p className="text-slate-400 text-sm py-8 px-6">No open blockers 🎉</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            <th className="px-6 py-3">Task</th>
                                            <th className="px-6 py-3">Project</th>
                                            <th className="px-6 py-3">Assignee</th>
                                            <th className="px-6 py-3">Deadline</th>
                                            <th className="px-6 py-3">Blocker Reason</th>
                                            <th className="px-6 py-3">Assigned To</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {blockedTasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-slate-50/60 transition-colors duration-100">
                                                <td className="px-6 py-4 align-top">
                                                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{task.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top text-sm text-slate-600">{task.project}</td>
                                                <td className="px-6 py-4 align-top">
                                                    <NamePill name={task.assignee} tone="slate" />
                                                </td>
                                                <td className="px-6 py-4 align-top text-sm text-slate-600">{formatDate(task.deadline)}</td>
                                                <td className="px-6 py-4 align-top">
                                                    {task.blockerReason ? (
                                                        <span className="inline-flex items-center gap-1.5 text-sm text-rose-700">
                                                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                                            {task.blockerReason}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {task.blockerAssigneeName ? (
                                                        <NamePill name={task.blockerAssigneeName} tone="indigo" />
                                                    ) : (
                                                        <span className="text-sm italic text-slate-300">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top text-right">
                                                    <button
                                                        onClick={() => openEditModal(task)}
                                                        title="Edit blocker"
                                                        className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors duration-150 cursor-pointer"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "mine" && (
                    <>
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h2 className="text-[20px] font-semibold text-slate-900">
                                My Blockers {!myBlockersLoading && !myBlockersError && `(${myBlockers.length})`}
                            </h2>
                        </div>

                        {myBlockersLoading ? (
                            <div className="flex items-center gap-2 text-slate-400 text-sm py-8 px-6">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading your blockers...
                            </div>
                        ) : myBlockersError ? (
                            <p className="text-rose-500 text-sm py-6 px-6">{myBlockersError}</p>
                        ) : myBlockers.length === 0 ? (
                            <p className="text-slate-400 text-sm py-8 px-6">No blockers assigned to you 🎉</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            <th className="px-6 py-3">Task</th>
                                            <th className="px-6 py-3">Project</th>
                                            <th className="px-6 py-3">Task Owner</th>
                                            <th className="px-6 py-3">Deadline</th>
                                            <th className="px-6 py-3">Blocker Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {myBlockers.map((task) => (
                                            <tr key={task.id} className="hover:bg-slate-50/60 transition-colors duration-100">
                                                <td className="px-6 py-4 align-top">
                                                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{task.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top text-sm text-slate-600">{task.project}</td>
                                                <td className="px-6 py-4 align-top">
                                                    <NamePill name={task.assignee} tone="slate" />
                                                </td>
                                                <td className="px-6 py-4 align-top text-sm text-slate-600">{formatDate(task.deadline)}</td>
                                                <td className="px-6 py-4 align-top">
                                                    {task.blockerReason ? (
                                                        <span className="inline-flex items-center gap-1.5 text-sm text-indigo-700">
                                                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                            {task.blockerReason}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-300">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Blocker Modal — reason + assign-to only */}
            {editingTask && (
                <div
                    className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
                    onClick={closeEditModal}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-md p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Edit Blocker</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{editingTask.title}</p>
                            </div>
                            <button
                                onClick={closeEditModal}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {saveError && (
                                <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                                    {saveError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">
                                    Reason for blocker
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain why this task is blocked..."
                                    rows={4}
                                    disabled={saving}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y disabled:bg-slate-50 disabled:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-2">
                                    Assign to
                                </label>
                                <ModernSelect
                                    value={assigneeId}
                                    options={memberOptions}
                                    onChange={setAssigneeId}
                                    loading={membersLoading}
                                    placeholder="Select a department member"
                                />
                            </div>

                            <div className="flex gap-3 mt-1">
                                <button
                                    onClick={handleSaveReason}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors duration-150 cursor-pointer"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={closeEditModal}
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
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