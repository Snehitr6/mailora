
import { useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

export default function SearchBar({
  search = "",
  setSearch,
  onSearch,
  placeholder = "Search mail",
  className = "",
}) {
  const [focused, setFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [hasWords, setHasWords] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);
  const [dateRange, setDateRange] = useState("anytime");

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setFocused(false);
        setFiltersOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setFocused(false);
        setFiltersOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const updateSearch = (value) => {
    setSearch?.(value);
    onSearch?.(value);
  };

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setSubject("");
    setHasWords("");
    setHasAttachment(false);
    setDateRange("anytime");
  };

  const applyFilters = () => {
    const parts = [];

    if (from.trim()) parts.push(`from:${from.trim()}`);
    if (to.trim()) parts.push(`to:${to.trim()}`);
    if (subject.trim()) parts.push(`subject:${subject.trim()}`);
    if (hasWords.trim()) parts.push(hasWords.trim());
    if (hasAttachment) parts.push("has:attachment");

    if (dateRange === "day") parts.push("newer_than:1d");
    if (dateRange === "week") parts.push("newer_than:7d");
    if (dateRange === "month") parts.push("newer_than:30d");

    updateSearch(parts.join(" "));
    setFiltersOpen(false);
    setFocused(false);
  };

  const hasFilters =
    from.trim() ||
    to.trim() ||
    subject.trim() ||
    hasWords.trim() ||
    hasAttachment ||
    dateRange !== "anytime";

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[720px] ${className}`}
    >
      <div
        className={`flex h-12 items-center gap-3 rounded-full border px-4 transition-all duration-200 ${
          focused || filtersOpen
            ? "border-transparent bg-white shadow-md dark:bg-[#303134]"
            : "border-transparent bg-[#eaf1fb] hover:bg-[#e3ebf7] dark:bg-[#303134] dark:hover:bg-[#3c4043]"
        }`}
      >
        <Search
          size={20}
          className="shrink-0 text-slate-600 dark:text-slate-300"
        />

        <input
          ref={inputRef}
          type="search"
          value={search}
          onChange={(event) => updateSearch(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearch?.(search);
              setFocused(false);
              setFiltersOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label="Search emails"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              updateSearch("");
              inputRef.current?.focus();
            }}
            className="toolbar-btn !h-8 !w-8"
            aria-label="Clear search"
            title="Clear search"
          >
            <X size={17} />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setFiltersOpen((value) => !value);
            setFocused(false);
          }}
          className={`toolbar-btn !h-8 !w-8 ${
            filtersOpen || hasFilters
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : ""
          }`}
          aria-label="Advanced search"
          title="Advanced search"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {filtersOpen && (
        <div className="absolute left-0 right-0 top-14 z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-[#202124] sm:left-auto sm:w-[420px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Advanced search
            </h3>

            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="toolbar-btn !h-8 !w-8"
              aria-label="Close advanced search"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
              <label
                htmlFor="search-from"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                From
              </label>
              <input
                id="search-from"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                placeholder="Sender"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
              <label
                htmlFor="search-to"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                To
              </label>
              <input
                id="search-to"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="Recipient"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
              <label
                htmlFor="search-subject"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Subject
              </label>
              <input
                id="search-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject contains"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
              <label
                htmlFor="search-words"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Has words
              </label>
              <input
                id="search-words"
                value={hasWords}
                onChange={(event) => setHasWords(event.target.value)}
                placeholder="Words in the email"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
              <label
                htmlFor="search-date"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Date within
              </label>
              <div className="relative">
                <select
                  id="search-date"
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 pr-8 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:text-white dark:[color-scheme:dark]"
                >
                  <option value="anytime">Any time</option>
                  <option value="day">Last 24 hours</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 py-1 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={hasAttachment}
                onChange={(event) => setHasAttachment(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Has attachment
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="rounded-full bg-[#0b57d0] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0842a0]"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
