"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BarChart3, Pencil, Filter, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import type { FormDTO } from "@/lib/types";
import FormCardActions from "./FormCardActions";
import NewFormButton from "./NewFormButton";

type FormWithCount = {
  form: FormDTO;
  responseCount: number;
};

export default function FormList({ initialForms }: { initialForms: FormWithCount[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "draft">("all");
  const [sortBy, setSortBy] = useState<"newest" | "responses" | "questions">("newest");

  const totalForms = initialForms.length;
  const liveForms = useMemo(
    () => initialForms.filter((f) => f.form.settings.published).length,
    [initialForms]
  );
  const totalResponses = useMemo(
    () => initialForms.reduce((acc, f) => acc + f.responseCount, 0),
    [initialForms]
  );

  const filteredForms = useMemo(() => {
    return initialForms
      .filter(({ form }) => {
        const matchesSearch =
          form.title.toLowerCase().includes(search.toLowerCase()) ||
          (form.description && form.description.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        if (filter === "live") return form.settings.published;
        if (filter === "draft") return !form.settings.published;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "responses") return b.responseCount - a.responseCount;
        if (sortBy === "questions") return b.form.questions.length - a.form.questions.length;
        // Default newest
        return new Date(b.form.createdAt).getTime() - new Date(a.form.createdAt).getTime();
      });
  }, [initialForms, search, filter, sortBy]);

  if (totalForms === 0) {
    return (
      <div className="mt-16 rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
          ⚡
        </div>
        <h2 className="mt-4 text-lg font-bold">No forms created yet</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Start from scratch, use an evaluation template, or describe it and let AI generate it.
        </p>
        <div className="mt-6 flex justify-center">
          <NewFormButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Metrics Banner */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Forms</span>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">{totalForms}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active / Live</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">{liveForms}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Submissions</span>
            <BarChart3 size={16} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">{totalResponses}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms by title or description..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex rounded-xl border border-neutral-200 bg-white p-1 text-xs font-medium text-neutral-600">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === "all" ? "bg-indigo-50 font-semibold text-indigo-600" : "hover:text-neutral-900"
              }`}
            >
              All ({totalForms})
            </button>
            <button
              onClick={() => setFilter("live")}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === "live" ? "bg-emerald-50 font-semibold text-emerald-600" : "hover:text-neutral-900"
              }`}
            >
              Live ({liveForms})
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === "draft" ? "bg-neutral-100 font-semibold text-neutral-900" : "hover:text-neutral-900"
              }`}
            >
              Drafts ({totalForms - liveForms})
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "responses" | "questions")}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 outline-none transition focus:border-indigo-500"
          >
            <option value="newest">Sort: Newest</option>
            <option value="responses">Sort: Most Responses</option>
            <option value="questions">Sort: Most Questions</option>
          </select>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-neutral-700">No forms matched your search.</p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-3 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filteredForms.map(({ form, responseCount }) => (
            <div
              key={form.id}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
            >
              <Link href={`/dashboard/forms/${form.id}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold leading-snug text-neutral-900 group-hover:text-indigo-600 transition">
                    {form.title}
                  </h2>
                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (form.settings.published
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-neutral-100 text-neutral-500")
                    }
                  >
                    {form.settings.published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                  {form.description || "No description provided"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-neutral-400">
                  <span>{form.questions.length} questions</span>
                  <span className="flex items-center gap-1 text-neutral-600">
                    <BarChart3 size={13} /> {responseCount} {responseCount === 1 ? "response" : "responses"}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-indigo-500 font-semibold opacity-0 group-hover:opacity-100 transition">
                    <Pencil size={13} /> Open Editor
                  </span>
                </div>
              </Link>
              <div className="mt-3 -mx-1 flex items-center justify-end border-t border-neutral-100 pt-2">
                <FormCardActions formId={form.id} title={form.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
