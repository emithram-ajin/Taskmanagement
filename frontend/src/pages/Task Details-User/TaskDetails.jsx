import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    X,
    ChevronDown,
    Check,
    Loader2,
    RotateCcw,
    ListChecks,
    Flag,
    CalendarClock,
    Calendar as CalendarIcon,
} from "lucide-react";
import userapiservicer from "../../services/userapiServices";

// Exactly mirrors the Task model's enums (case-sensitive, matches the
// backend schema verbatim so filter values sent/compared are valid).
const STATUS_OPTIONS = [
    { value: "assigned", label: "Assigned" },
    { value: "blocker", label: "Blocker" },
    { value: "progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
];
const PRIORITY_OPTIONS = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
];

// Table column count — keep in sync with the <thead> below. Used for
// colSpan on the loading/error/empty state rows.
const COLUMN_COUNT = 7;

function StatusBadge({ status }) {
    const styles =
        status === "progress"
            ? "bg-indigo-100 text-indigo-700"
            : status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : status === "assigned"
                    ? "bg-blue-100 text-blue-700"
                    : status === "blocker"
                        ? "bg-rose-100 text-rose-700 border border-rose-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300";
    const label =
        STATUS_OPTIONS.find((s) => s.value === status)?.label || status || "—";
    return (
        <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${styles}`}>
            {label}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const styles =
        priority === "High"
            ? "bg-rose-100 text-rose-700 border border-rose-300"
            : priority === "Low"
                ? "bg-gray-100 text-gray-600 border border-gray-300"
                : "bg-amber-100 text-amber-800 border border-amber-300";
    const label =
        PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || priority || "—";
    return (
        <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${styles}`}>
            {label}
        </span>
    );
}

// ── Toolbar filter pills ────────────────────────────────────
// Compact, standalone pill controls meant to sit in a single row directly
// above the table — not boxed inside a shared card.

function FilterPillSelect({ icon: Icon, label, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find((o) => o.value === value);
    const isActive = Boolean(value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:text-gray-800"
                }`}
            >
                <Icon size={14} className={isActive ? "text-indigo-500" : "text-gray-400"} />
                {selected ? selected.label : label}
                {isActive && (
                    <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className="ml-0.5 rounded-full hover:bg-indigo-100 p-0.5"
                        aria-label={`Clear ${label} filter`}
                    >
                        <X size={12} />
                    </span>
                )}
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-20 mt-1.5 min-w-[170px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
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
                                    isSelected
                                        ? "bg-indigo-50 text-indigo-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {option.label}
                                {isSelected && <Check size={14} className="text-indigo-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Custom calendar (no native <input type="date">) ────────
// A real date input always triggers the browser/OS's own calendar popup on
// click — there's no reliable way to suppress that while keeping it
// clickable, which caused two calendars to appear stacked. This builds a
// small self-contained month-grid picker instead, fully in our own markup.

function pad2(n) {
    return String(n).padStart(2, "0");
}
function toDateStr(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
function parseDateStr(str) {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}
function formatDMY(str) {
    const d = parseDateStr(str);
    if (!d) return "";
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}
function isSameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function buildMonthWeeks(viewDate) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstWeekday - 1; i >= 0; i--) {
        cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    let nextDay = 1;
    while (cells.length < 42) {
        cells.push({ date: new Date(year, month + 1, nextDay), inMonth: false });
        nextDay += 1;
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

function formatRangeLabel(from, to) {
    const fmt = (v) => {
        const d = parseDateStr(v);
        if (!d) return "";
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    };
    if (from && to) return `${fmt(from)} – ${fmt(to)}`;
    if (from) return `From ${fmt(from)}`;
    if (to) return `Until ${fmt(to)}`;
    return "";
}

function DateRangePill({ icon: Icon, label, from, to, onChangeFrom, onChangeTo, onClear }) {
    const [open, setOpen] = useState(false);
    const [activeField, setActiveField] = useState("from");
    const [viewDate, setViewDate] = useState(() => parseDateStr(from) || parseDateStr(to) || new Date());
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            const base = activeField === "from" ? parseDateStr(from) || parseDateStr(to) : parseDateStr(to) || parseDateStr(from);
            setViewDate(base || new Date());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const isActive = Boolean(from || to);
    const rangeLabel = formatRangeLabel(from, to);
    const fromDate = parseDateStr(from);
    const toDate = parseDateStr(to);
    const weeks = buildMonthWeeks(viewDate);
    const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const changeMonth = (delta) => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const pickDate = (date) => {
        const str = toDateStr(date);
        if (activeField === "from") {
            onChangeFrom(str);
            if (toDate && date > toDate) onChangeTo("");
            setActiveField("to");
        } else {
            if (fromDate && date < fromDate) {
                onChangeTo(from);
                onChangeFrom(str);
            } else {
                onChangeTo(str);
            }
            setActiveField("from");
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:text-gray-800"
                }`}
            >
                <Icon size={14} className={isActive ? "text-indigo-500" : "text-gray-400"} />
                {isActive ? rangeLabel : label}
                {isActive && (
                    <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                            setActiveField("from");
                        }}
                        className="ml-0.5 rounded-full hover:bg-indigo-100 p-0.5"
                        aria-label={`Clear ${label} filter`}
                    >
                        <X size={12} />
                    </span>
                )}
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-20 mt-1.5 w-[300px] bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                    {/* From / To field selectors */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setActiveField("from")}
                            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-2 text-sm text-left transition-colors duration-150 ${
                                activeField === "from" ? "border-indigo-500 ring-2 ring-indigo-500/30 text-gray-800" : "border-gray-300 text-gray-500"
                            }`}
                        >
                            <CalendarIcon size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate">{from ? formatDMY(from) : "dd-mm-yyyy"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveField("to")}
                            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-2 text-sm text-left transition-colors duration-150 ${
                                activeField === "to" ? "border-indigo-500 ring-2 ring-indigo-500/30 text-gray-800" : "border-gray-300 text-gray-500"
                            }`}
                        >
                            <CalendarIcon size={13} className="text-gray-400 shrink-0" />
                            <span className="truncate">{to ? formatDMY(to) : "dd-mm-yyyy"}</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 -mt-2">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pl-1">From</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pl-1">To</span>
                    </div>

                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">{monthLabel}</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                                aria-label="Previous month"
                            >
                                <ChevronDown size={14} className="rotate-90" />
                            </button>
                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                                aria-label="Next month"
                            >
                                <ChevronDown size={14} className="-rotate-90" />
                            </button>
                        </div>
                    </div>

                    {/* Weekday header */}
                    <div className="grid grid-cols-7 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="flex flex-col gap-0.5">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="grid grid-cols-7">
                                {week.map(({ date, inMonth }, di) => {
                                    const isFrom = isSameDay(date, fromDate);
                                    const isTo = isSameDay(date, toDate);
                                    const inRange = fromDate && toDate && date > fromDate && date < toDate;
                                    return (
                                        <button
                                            key={di}
                                            type="button"
                                            onClick={() => pickDate(date)}
                                            className={`h-8 text-sm rounded-md transition-colors duration-100 ${
                                                !inMonth
                                                    ? "text-gray-300 hover:bg-gray-50"
                                                    : isFrom || isTo
                                                        ? "bg-indigo-600 text-white font-semibold"
                                                        : inRange
                                                            ? "bg-indigo-50 text-indigo-700"
                                                            : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                onClear();
                                setActiveField("from");
                            }}
                            className="text-xs font-medium text-gray-400 hover:text-rose-600 transition-colors duration-150"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const t = new Date();
                                if (activeField === "from") {
                                    onChangeFrom(toDateStr(t));
                                    setActiveField("to");
                                } else {
                                    onChangeTo(toDateStr(t));
                                    setActiveField("from");
                                }
                                setViewDate(t);
                            }}
                            className="text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors duration-150"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-150"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatDisplayDate(dateInput) {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

// Normalize a task returned by the API (populated fields) into the flat
// shape this table's UI expects, while keeping raw date values around for
// filtering/sorting.
function normalizeTask(task) {
    return {
        id: task._id,
        title: task.title,
        description: task.description,
        project: task.project?.projectName || "—",
        projectId: task.project?._id || "",
        assignee: task.assignee?.name || "Unassigned",
        assigneeEmail: task.assignee?.email || "",
        assigneeDepartment: task.assignee?.department || "",
        status: task.status || "",
        priority: task.priority || "",
        deadlineRaw: task.deadline || null,
        deadline: formatDisplayDate(task.deadline),
        createdAtRaw: task.createdAt || null,
        createdAt: formatDisplayDate(task.createdAt),
        updatedAtRaw: task.updatedAt || null,
        updatedAt: formatDisplayDate(task.updatedAt),
        createdByName: task.createdBy?.name || "—",
        createdByEmail: task.createdBy?.email || "",
    };
}

// True if `dateRaw` falls within [from, to] (inclusive), treating from/to as
// plain YYYY-MM-DD strings from the date picker. Empty from/to means that
// side is unbounded.
function withinDateRange(dateRaw, from, to) {
    if (!from && !to) return true;
    if (!dateRaw) return false;
    const d = new Date(dateRaw);
    if (isNaN(d.getTime())) return false;
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);

    if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        if (dayStart < fromDate) return false;
    }
    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (dayStart > toDate) return false;
    }
    return true;
}

const EMPTY_FILTERS = {
    status: "",
    priority: "",
    deadlineFrom: "",
    deadlineTo: "",
};

export default function TaskDetails() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const fetchMyTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userapiservicer.getMyTasks();
            const normalized = (data.tasks || []).map(normalizeTask);
            setTasks(normalized);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            setError(err?.response?.data?.message || "Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            if (filters.status && t.status !== filters.status) return false;
            if (filters.priority && t.priority !== filters.priority) return false;
            if (!withinDateRange(t.deadlineRaw, filters.deadlineFrom, filters.deadlineTo)) return false;
            return true;
        });
    }, [tasks, filters]);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => setFilters(EMPTY_FILTERS);

    return (
        <div className="bg-slate-50 min-h-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-full overflow-hidden">
            {/* Title */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-gray-900 mb-1">
                Task Management
            </h1>
            <p className="text-gray-500 text-sm sm:text-[15px] mb-4 sm:mb-6">Create and manage tasks</p>

            {/* Filter toolbar — standalone pills sitting directly above the table */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <FilterPillSelect
                    icon={ListChecks}
                    label="Status"
                    value={filters.status}
                    options={STATUS_OPTIONS}
                    onChange={(val) => updateFilter("status", val)}
                />
                <FilterPillSelect
                    icon={Flag}
                    label="Priority"
                    value={filters.priority}
                    options={PRIORITY_OPTIONS}
                    onChange={(val) => updateFilter("priority", val)}
                />
                <DateRangePill
                    icon={CalendarClock}
                    label="Deadline"
                    from={filters.deadlineFrom}
                    to={filters.deadlineTo}
                    onChangeFrom={(val) => updateFilter("deadlineFrom", val)}
                    onChangeTo={(val) => updateFilter("deadlineTo", val)}
                    onClear={() => setFilters((prev) => ({ ...prev, deadlineFrom: "", deadlineTo: "" }))}
                />

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-rose-600 transition-colors duration-150 pl-1"
                    >
                        <RotateCcw size={13} />
                        Clear all
                    </button>
                )}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[820px]">
                    <thead>
                        <tr className="border-b border-gray-200 bg-white">
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Task</th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Project</th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Assignee</th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Status</th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Priority</th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Assigned</th>
                            <th className="px-6 py-4 text-[15px] font-semibold text-gray-800">Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={COLUMN_COUNT} className="px-6 py-10 text-center text-gray-400">
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading tasks...
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!loading && error && (
                            <tr>
                                <td colSpan={COLUMN_COUNT} className="px-6 py-10 text-center text-rose-500 text-sm">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading && !error && tasks.length === 0 && (
                            <tr>
                                <td colSpan={COLUMN_COUNT} className="px-6 py-10 text-center text-gray-400 text-sm">
                                    No tasks assigned to you yet.
                                </td>
                            </tr>
                        )}

                        {!loading && !error && tasks.length > 0 && filteredTasks.length === 0 && (
                            <tr>
                                <td colSpan={COLUMN_COUNT} className="px-6 py-10 text-center text-gray-400 text-sm">
                                    No tasks match the current filters.
                                </td>
                            </tr>
                        )}

                        {!loading && !error && filteredTasks.map((task, i) => (
                            <tr
                                key={task.id}
                                className={`transition-colors duration-100 hover:bg-gray-50 ${
                                    i !== filteredTasks.length - 1 ? "border-b border-gray-100" : ""
                                }`}
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
                                <td className="px-6 py-5 align-top text-[15px] text-gray-600">
                                    {task.createdAt}
                                </td>
                                <td className="px-6 py-5 align-top text-[15px] font-medium text-red-500">
                                    {task.deadline}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}