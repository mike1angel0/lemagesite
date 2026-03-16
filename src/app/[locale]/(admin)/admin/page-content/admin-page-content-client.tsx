"use client";

import { useState, useActionState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { savePageContentAction } from "@/lib/actions/admin-page-content";
import type { AuthState } from "@/lib/actions/auth";

const PAGES = [
  { namespace: "poetry", label: "Poetry" },
  { namespace: "photography", label: "Photography" },
  { namespace: "essays", label: "Essays" },
  { namespace: "research", label: "Research" },
  { namespace: "events", label: "Events" },
  { namespace: "books", label: "Books" },
  { namespace: "music", label: "Music" },
  { namespace: "shop", label: "Shop" },
  { namespace: "membership", label: "Membership" },
] as const;

const FIELDS = [
  { key: "sectionLabel", label: "Section Label", type: "input" as const },
  { key: "heroTitle", label: "Hero Title", type: "input" as const },
  { key: "heroDescription", label: "Hero Description", type: "textarea" as const },
] as const;

const LOCALES = ["en", "ro"] as const;

interface Props {
  initialSettings: Record<string, string>;
  defaults: Record<string, string>;
}

export function AdminPageContentClient({ initialSettings, defaults }: Props) {
  const [selectedPage, setSelectedPage] = useState<string>("poetry");
  const [selectedLocale, setSelectedLocale] = useState<"en" | "ro">("en");
  const [values, setValues] = useState<Record<string, string>>(initialSettings);
  const [saveState, saveAction, savePending] = useActionState(savePageContentAction, {} as AuthState);

  function getValue(namespace: string, locale: string, field: string): string {
    return values[`${locale}:${namespace}.${field}`] ?? "";
  }

  function getDefault(namespace: string, locale: string, field: string): string {
    return defaults[`${locale}:${namespace}.${field}`] ?? "";
  }

  function setValue(namespace: string, locale: string, field: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [`${locale}:${namespace}.${field}`]: value,
    }));
  }

  function useDefaults() {
    setValues((prev) => {
      const next = { ...prev };
      for (const locale of LOCALES) {
        for (const field of FIELDS) {
          const key = `${locale}:${selectedPage}.${field.key}`;
          const defaultVal = defaults[key];
          if (defaultVal) {
            next[key] = defaultVal;
          }
        }
      }
      return next;
    });
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Page Content</h1>
        <form action={saveAction}>
          <input type="hidden" name="namespace" value={selectedPage} />
          {LOCALES.map((locale) =>
            FIELDS.map((field) => (
              <input
                key={`${locale}:${field.key}`}
                type="hidden"
                name={`${locale}:${field.key}`}
                value={getValue(selectedPage, locale, field.key)}
              />
            ))
          )}
          <button
            type="submit"
            disabled={savePending}
            className="inline-flex items-center gap-1.5 bg-accent text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savePending ? "Saving..." : saveState.success ? <><Check size={14} /> Saved</> : "Save Changes"}
          </button>
        </form>
      </div>

      {saveState.error && (
        <div className="mx-8 mt-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
          {saveState.error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Page List */}
        <div className="w-56 border-r border-border py-4 shrink-0">
          <span className="px-5 font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
            Pages
          </span>
          <nav className="flex flex-col mt-3">
            {PAGES.map((page) => (
              <button
                key={page.namespace}
                onClick={() => setSelectedPage(page.namespace)}
                className={`text-left px-5 py-2.5 font-sans text-[13px] transition-colors ${
                  selectedPage === page.namespace
                    ? "bg-bg-elevated text-text-primary font-medium"
                    : "text-text-secondary hover:bg-bg-elevated/50 hover:text-text-primary"
                }`}
              >
                {page.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Panel */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {/* Locale Tabs + Use Defaults */}
          <div className="flex items-center gap-4 mb-6">
            {LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => setSelectedLocale(locale)}
                className={`font-mono text-xs tracking-[2px] uppercase px-4 py-2 rounded-md transition-colors ${
                  selectedLocale === locale
                    ? "bg-accent text-bg font-medium"
                    : "text-text-secondary border border-border hover:border-accent-dim"
                }`}
              >
                {locale === "en" ? "English" : "Română"}
              </button>
            ))}
            <div className="flex-1" />
            <button
              type="button"
              onClick={useDefaults}
              className="inline-flex items-center gap-1.5 font-sans text-xs text-text-secondary border border-border rounded-md px-3 py-2 hover:border-accent-dim hover:text-text-primary transition-colors"
            >
              <RotateCcw size={12} />
              Use Defaults
            </button>
          </div>

          {/* Fields */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">
              {PAGES.find((p) => p.namespace === selectedPage)?.label} — {selectedLocale === "en" ? "English" : "Română"}
            </h2>
            <div className="space-y-5">
              {FIELDS.map((field) => {
                const defaultVal = getDefault(selectedPage, selectedLocale, field.key);
                const placeholder = defaultVal
                  ? `Default: ${defaultVal.replace(/\n/g, " ")}`
                  : "No default set";
                return (
                  <div key={field.key}>
                    <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={getValue(selectedPage, selectedLocale, field.key)}
                        onChange={(e) => setValue(selectedPage, selectedLocale, field.key, e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-dim resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={getValue(selectedPage, selectedLocale, field.key)}
                        onChange={(e) => setValue(selectedPage, selectedLocale, field.key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent-dim"
                      />
                    )}
                    {defaultVal && !getValue(selectedPage, selectedLocale, field.key) && (
                      <p className="font-sans text-[11px] text-text-muted mt-1">
                        Using default from translation file
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="font-sans text-xs text-text-muted mt-4">
            Empty fields fall back to the default translation file values. Changes apply per-page and are saved for both languages at once.
          </p>
        </div>
      </div>
    </>
  );
}
