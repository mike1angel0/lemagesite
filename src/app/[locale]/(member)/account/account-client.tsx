"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MemberBadge } from "@/components/ui/member-badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { createPortalSessionAction } from "@/lib/actions/stripe";
import { toggleSaveAction } from "@/lib/actions/saved";
import {
  updateSettingsAction,
  changePasswordAction,
  exportAccountDataAction,
  deleteAccountAction,
} from "@/lib/actions/settings";
import { sendMessageAction, replyMessageAction, markReadAction } from "@/lib/actions/messages";
import type { AuthState } from "@/lib/actions/auth";
import { Bookmark, ExternalLink, Globe, Key, Bell, Layers, Link2, Shield, Trash2, MessageSquare, Send, ArrowLeft } from "lucide-react";

interface MessageReply {
  id: string;
  body: string;
  isFromAdmin: boolean;
  read: boolean;
  createdAt: string;
}

interface MessageThread {
  id: string;
  subject: string;
  body: string;
  isFromAdmin: boolean;
  read: boolean;
  createdAt: string;
  replies: MessageReply[];
}

interface SavedItem {
  id: string;
  contentType: string;
  contentId: string;
  title: string;
  slug: string;
  savedAt: Date;
}

interface AccountUser {
  id: string;
  name: string;
  email: string;
  bio: string;
  localePreference: string;
  tier: string;
  membershipStatus: string;
  hasStripeSubscription: boolean;
  hasPassword: boolean;
  connectedProviders: string[];
  emailNotifications: boolean;
  newsletterSubscribed: boolean;
  contentPreferences: string[];
  createdAt: string;
}

const CONTENT_TYPES = [
  { key: "POEM", label: "Poetry" },
  { key: "PHOTO", label: "Photography" },
  { key: "ALBUM", label: "Music" },
  { key: "ESSAY", label: "Essays" },
  { key: "BOOK", label: "Books" },
  { key: "RESEARCH", label: "Research" },
  { key: "EVENT", label: "Events" },
];

const labelClass = "font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted";

export function AccountClient({ user, savedItems: initialSavedItems, messages: initialMessages }: { user: AccountUser; savedItems: SavedItem[]; messages: MessageThread[] }) {
  const t = useTranslations("account");
  const tc = useTranslations("common");

  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, {} as AuthState);
  const [settingsState, settingsAction, settingsPending] = useActionState(updateSettingsAction, {} as AuthState);
  const [passwordState, passwordAction, passwordPending] = useActionState(changePasswordAction, {} as AuthState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccountAction, {} as AuthState);
  const [sendState, sendAction, sendPending] = useActionState(sendMessageAction, {} as AuthState);
  const [replyState, replyAction, replyPending] = useActionState(replyMessageAction, {} as AuthState);
  const [activeTab, setActiveTab] = useState("profile");
  const [savedItems, setSavedItems] = useState(initialSavedItems);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const [locale, setLocale] = useState(user.localePreference);
  const [emailNotifs, setEmailNotifs] = useState(user.emailNotifications);
  const [newsletter, setNewsletter] = useState(user.newsletterSubscribed);
  const [contentPrefs, setContentPrefs] = useState<string[]>(user.contentPreferences);

  const navItems = [
    { key: "profile", label: t("profile") },
    { key: "membership", label: t("membership") },
    { key: "orders", label: t("orders") },
    { key: "saved", label: t("saved") },
    { key: "messages", label: t("messages") },
    { key: "settings", label: t("settings") },
  ];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportAccountDataAction();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `selenarium-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function toggleContentPref(key: string) {
    setContentPrefs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  return (
    <div className="px-5 md:px-10 xl:px-20 py-12">
      {/* -- Header -- */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center font-serif text-2xl text-accent">
          {initials || "?"}
        </div>
        <div>
          <h1 className="font-serif text-2xl text-text-primary">
            {user.name}
          </h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            {user.email}
          </p>
          <div className="mt-2">
            <MemberBadge tier={user.tier} />
          </div>
        </div>
      </div>

      {/* -- Two-column layout -- */}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar */}
        <nav className="w-full md:w-60 shrink-0">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                "block w-full text-left py-3 px-4 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded transition-colors",
                activeTab === item.key && "bg-bg-elevated text-text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <h2 className="font-serif text-xl text-text-primary mb-6">
                {t("profileInformation")}
              </h2>

              {profileState.success && (
                <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                  Profile updated successfully
                </p>
              )}
              {profileState.error && (
                <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                  {profileState.error}
                </p>
              )}

              <form action={profileAction}>
                <div className="space-y-4">
                  <Input id="profile-name" name="name" label={t("profile")} defaultValue={user.name} />
                  <Input
                    id="profile-email"
                    label="Email"
                    type="email"
                    defaultValue={user.email}
                    disabled
                  />
                  <div className="flex flex-col">
                    <label
                      htmlFor="profile-bio"
                      className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2"
                    >
                      {t("bio")}
                    </label>
                    <textarea
                      id="profile-bio"
                      name="bio"
                      rows={3}
                      className="w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
                      defaultValue={user.bio}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="filled" disabled={profilePending}>
                    {profilePending ? tc("loading") : tc("saveChanges")}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "membership" && (
            <Card>
              <h2 className="font-serif text-xl text-text-primary mb-6">
                {t("membership")}
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">
                    {t("currentTier")}
                  </span>
                  <p className="font-sans text-sm text-text-primary mt-1">
                    {user.tier}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">
                    Status
                  </span>
                  <p className="font-sans text-sm text-text-primary mt-1">
                    {user.membershipStatus}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {user.hasStripeSubscription ? (
                  <form action={createPortalSessionAction}>
                    <Button variant="filled">{tc("manageSubscription")}</Button>
                  </form>
                ) : (
                  <Link href="/membership">
                    <Button variant="filled">Upgrade</Button>
                  </Link>
                )}
              </div>
            </Card>
          )}

          {activeTab === "orders" && (
            <Card>
              <h2 className="font-serif text-xl text-text-primary mb-4">
                {t("orders")}
              </h2>
              <p className="font-sans text-sm text-text-muted">
                No orders yet.
              </p>
            </Card>
          )}

          {activeTab === "saved" && (
            <Card>
              <h2 className="font-serif text-xl text-text-primary mb-4">
                {t("saved")}
              </h2>
              {savedItems.length === 0 ? (
                <p className="font-sans text-sm text-text-muted">
                  {t("noSavedItems")}
                </p>
              ) : (
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border border-border rounded px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Bookmark className="size-4 text-accent shrink-0" />
                        <div>
                          <Link
                            href={item.slug}
                            className="font-sans text-sm text-text-primary hover:text-accent transition-colors"
                          >
                            {item.title}
                            <ExternalLink className="inline size-3 ml-1.5 opacity-50" />
                          </Link>
                          <span className="block font-mono text-[9px] text-text-muted tracking-[2px] uppercase mt-0.5">
                            {item.contentType}
                          </span>
                        </div>
                      </div>
                      <form
                        action={async (formData) => {
                          setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
                          await toggleSaveAction(formData);
                        }}
                      >
                        <input type="hidden" name="contentType" value={item.contentType} />
                        <input type="hidden" name="contentId" value={item.contentId} />
                        <button
                          type="submit"
                          className="font-mono text-[10px] text-text-muted hover:text-red-400 tracking-[1px] uppercase transition-colors"
                        >
                          {tc("unsave")}
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === "messages" && (
            <div className="space-y-6">
              {!selectedThread ? (
                <>
                  {/* New Message Form */}
                  <Card>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="size-4 text-accent" />
                      <h3 className="font-serif text-lg text-text-primary">{t("messageTo")}</h3>
                    </div>

                    {sendState.success && (
                      <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                        {t("messageSent")}
                      </p>
                    )}
                    {sendState.error && (
                      <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                        {sendState.error}
                      </p>
                    )}

                    <form action={sendAction}>
                      <div className="space-y-4">
                        <Input id="msg-subject" name="subject" label={t("subject")} />
                        <div className="flex flex-col">
                          <label htmlFor="msg-body" className={labelClass}>{t("messageBody")}</label>
                          <textarea
                            id="msg-body"
                            name="body"
                            rows={4}
                            className="mt-2 w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="filled" disabled={sendPending}>
                          <Send className="size-4 mr-2" />
                          {sendPending ? tc("loading") : t("sendMessage")}
                        </Button>
                      </div>
                    </form>
                  </Card>

                  {/* Thread List */}
                  <Card>
                    <h3 className="font-serif text-lg text-text-primary mb-4">{t("messages")}</h3>
                    {initialMessages.length === 0 ? (
                      <p className="font-sans text-sm text-text-muted">{t("noMessages")}</p>
                    ) : (
                      <div className="space-y-2">
                        {initialMessages.map((thread) => {
                          const hasUnread = thread.replies.some((r) => r.isFromAdmin && !r.read);
                          return (
                            <button
                              key={thread.id}
                              onClick={() => setSelectedThread(thread.id)}
                              className="w-full text-left flex items-center justify-between border border-border rounded px-4 py-3 hover:bg-bg-elevated transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {hasUnread && (
                                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-sans text-sm text-text-primary truncate">
                                    {thread.subject}
                                  </p>
                                  <span className="font-mono text-[9px] text-text-muted tracking-[2px] uppercase">
                                    {new Date(thread.createdAt).toLocaleDateString()}
                                    {" · "}
                                    {thread.replies.length} {thread.replies.length === 1 ? t("reply") : t("reply")}
                                  </span>
                                </div>
                              </div>
                              {hasUnread && (
                                <span className="font-mono text-[9px] text-accent tracking-[2px] uppercase shrink-0 ml-2">
                                  {t("unread")}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </>
              ) : (() => {
                const thread = initialMessages.find((m) => m.id === selectedThread);
                if (!thread) return null;
                const allMessages = [
                  { id: thread.id, body: thread.body, isFromAdmin: thread.isFromAdmin, createdAt: thread.createdAt, read: thread.read },
                  ...thread.replies,
                ];
                return (
                  <Card>
                    <button
                      onClick={() => setSelectedThread(null)}
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[2px] text-text-muted hover:text-accent transition-colors mb-4"
                    >
                      <ArrowLeft className="size-3" />
                      {t("backToMessages")}
                    </button>

                    <h3 className="font-serif text-lg text-text-primary mb-6">{thread.subject}</h3>

                    <div className="space-y-4 mb-6">
                      {allMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "border rounded p-4",
                            msg.isFromAdmin
                              ? "border-accent/20 bg-accent/5"
                              : "border-border"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                              "font-mono text-[10px] uppercase tracking-[2px]",
                              msg.isFromAdmin ? "text-accent" : "text-text-muted"
                            )}>
                              {msg.isFromAdmin ? t("fromAstronomer") : t("fromYou")}
                            </span>
                            <span className="font-mono text-[9px] text-text-muted tracking-[1px]">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-sans text-sm text-text-primary whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      ))}
                    </div>

                    {replyState.success && (
                      <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                        {t("messageSent")}
                      </p>
                    )}
                    {replyState.error && (
                      <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                        {replyState.error}
                      </p>
                    )}

                    <form action={replyAction}>
                      <input type="hidden" name="parentId" value={thread.id} />
                      <div className="flex flex-col">
                        <label htmlFor="reply-body" className={labelClass}>{t("reply")}</label>
                        <textarea
                          id="reply-body"
                          name="body"
                          rows={3}
                          placeholder={t("replyPlaceholder")}
                          className="mt-2 w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
                        />
                      </div>
                      <div className="mt-4">
                        <Button variant="filled" disabled={replyPending}>
                          <Send className="size-4 mr-2" />
                          {replyPending ? tc("loading") : t("reply")}
                        </Button>
                      </div>
                    </form>
                  </Card>
                );
              })()}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Success/error feedback for settings */}
              {settingsState.success && (
                <p className="font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                  {t("settingsSaved")}
                </p>
              )}
              {settingsState.error && (
                <p className="font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                  {settingsState.error}
                </p>
              )}

              {/* 4a. Language Preference */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="size-4 text-accent" />
                  <h3 className="font-serif text-lg text-text-primary">{t("languagePreference")}</h3>
                </div>
                <form action={settingsAction}>
                  <input type="hidden" name="localePreference" value={locale} />
                  <input type="hidden" name="emailNotifications" value={String(emailNotifs)} />
                  <input type="hidden" name="newsletterSubscribed" value={String(newsletter)} />
                  {contentPrefs.map((cp) => (
                    <input key={cp} type="hidden" name="contentPreferences" value={cp} />
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLocale("en")}
                      className={cn(
                        "px-4 py-2 text-sm font-mono tracking-[1px] border rounded transition-colors",
                        locale === "en"
                          ? "bg-accent text-bg-primary border-accent"
                          : "border-border text-text-secondary hover:border-accent-dim",
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocale("ro")}
                      className={cn(
                        "px-4 py-2 text-sm font-mono tracking-[1px] border rounded transition-colors",
                        locale === "ro"
                          ? "bg-accent text-bg-primary border-accent"
                          : "border-border text-text-secondary hover:border-accent-dim",
                      )}
                    >
                      RO
                    </button>
                  </div>
                  <div className="mt-4">
                    <Button variant="filled" disabled={settingsPending}>
                      {settingsPending ? tc("loading") : tc("saveChanges")}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 4b. Change Password */}
              {user.hasPassword ? (
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="size-4 text-accent" />
                    <h3 className="font-serif text-lg text-text-primary">{t("changePassword")}</h3>
                  </div>
                  {passwordState.success && (
                    <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                      {t("passwordChanged")}
                    </p>
                  )}
                  {passwordState.error && (
                    <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                      {passwordState.error}
                    </p>
                  )}
                  <form action={passwordAction}>
                    <div className="space-y-4">
                      <Input
                        id="current-password"
                        name="currentPassword"
                        type="password"
                        label={t("currentPassword")}
                      />
                      <Input
                        id="new-password"
                        name="newPassword"
                        type="password"
                        label={t("newPassword")}
                      />
                      <Input
                        id="confirm-new-password"
                        name="confirmNewPassword"
                        type="password"
                        label={t("confirmNewPassword")}
                      />
                    </div>
                    <div className="mt-6">
                      <Button variant="filled" disabled={passwordPending}>
                        {passwordPending ? tc("loading") : t("changePassword")}
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="size-4 text-accent" />
                    <h3 className="font-serif text-lg text-text-primary">{t("changePassword")}</h3>
                  </div>
                  <p className="font-sans text-sm text-text-muted">{t("noPasswordSet")}</p>
                </Card>
              )}

              {/* 4c. Email Notifications */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="size-4 text-accent" />
                  <h3 className="font-serif text-lg text-text-primary">{t("notificationsSection")}</h3>
                </div>
                <form action={settingsAction}>
                  <input type="hidden" name="localePreference" value={locale} />
                  <input type="hidden" name="emailNotifications" value={String(emailNotifs)} />
                  <input type="hidden" name="newsletterSubscribed" value={String(newsletter)} />
                  {contentPrefs.map((cp) => (
                    <input key={cp} type="hidden" name="contentPreferences" value={cp} />
                  ))}
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-sans text-sm text-text-primary">{t("emailNotifications")}</span>
                      <button
                        type="button"
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          emailNotifs ? "bg-accent" : "bg-border",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                            emailNotifs && "translate-x-5",
                          )}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-sans text-sm text-text-primary">{t("newsletterSubscription")}</span>
                      <button
                        type="button"
                        onClick={() => setNewsletter(!newsletter)}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          newsletter ? "bg-accent" : "bg-border",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                            newsletter && "translate-x-5",
                          )}
                        />
                      </button>
                    </label>
                  </div>
                  <div className="mt-4">
                    <Button variant="filled" disabled={settingsPending}>
                      {settingsPending ? tc("loading") : tc("saveChanges")}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 4d. Content Preferences */}
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="size-4 text-accent" />
                  <h3 className="font-serif text-lg text-text-primary">{t("contentPreferences")}</h3>
                </div>
                <p className="font-sans text-sm text-text-muted mb-4">{t("contentPreferencesDescription")}</p>
                <form action={settingsAction}>
                  <input type="hidden" name="localePreference" value={locale} />
                  <input type="hidden" name="emailNotifications" value={String(emailNotifs)} />
                  <input type="hidden" name="newsletterSubscribed" value={String(newsletter)} />
                  {contentPrefs.map((cp) => (
                    <input key={cp} type="hidden" name="contentPreferences" value={cp} />
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    {CONTENT_TYPES.map((ct) => (
                      <label
                        key={ct.key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <button
                          type="button"
                          onClick={() => toggleContentPref(ct.key)}
                          className={cn(
                            "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors shrink-0",
                            contentPrefs.includes(ct.key)
                              ? "bg-accent border-accent"
                              : "border-border",
                          )}
                        >
                          {contentPrefs.includes(ct.key) && (
                            <svg className="w-3 h-3 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className="font-sans text-sm text-text-primary">{ct.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="filled" disabled={settingsPending}>
                      {settingsPending ? tc("loading") : tc("saveChanges")}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 4e. Connected Accounts */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="size-4 text-accent" />
                  <h3 className="font-serif text-lg text-text-primary">{t("connectedAccounts")}</h3>
                </div>
                <div className="space-y-3">
                  {user.hasPassword && (
                    <div className="flex items-center gap-3 border border-border rounded px-4 py-3">
                      <Key className="size-4 text-text-muted" />
                      <span className="font-sans text-sm text-text-primary">{t("emailPassword")}</span>
                      <span className="ml-auto font-mono text-[10px] text-green-400 tracking-[1px] uppercase">{t("connectedWith")}</span>
                    </div>
                  )}
                  {user.connectedProviders.includes("google") && (
                    <div className="flex items-center gap-3 border border-border rounded px-4 py-3">
                      <svg className="size-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="font-sans text-sm text-text-primary">{t("google")}</span>
                      <span className="ml-auto font-mono text-[10px] text-green-400 tracking-[1px] uppercase">{t("connectedWith")}</span>
                    </div>
                  )}
                  {!user.hasPassword && user.connectedProviders.length === 0 && (
                    <p className="font-sans text-sm text-text-muted">No connected accounts.</p>
                  )}
                </div>
              </Card>

              {/* 4f. Data & Privacy */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="size-4 text-accent" />
                  <h3 className="font-serif text-lg text-text-primary">{t("dataPrivacy")}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className={labelClass}>{t("accountCreated")}</span>
                    <p className="font-sans text-sm text-text-primary mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="font-sans text-sm text-text-muted mb-3">{t("exportDataDescription")}</p>
                    <Button variant="ghost" onClick={handleExport} disabled={exporting}>
                      {exporting ? tc("loading") : t("exportData")}
                    </Button>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="font-sans text-sm text-text-muted mb-3">{t("deleteAccountDescription")}</p>
                    {!showDeleteConfirm ? (
                      <Button
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="!text-red-400 !border-red-400/30 hover:!bg-red-400/10"
                      >
                        <Trash2 className="size-4 mr-2" />
                        {t("deleteAccount")}
                      </Button>
                    ) : (
                      <div className="border border-red-400/30 rounded p-4 bg-red-400/5">
                        <p className="font-sans text-sm text-red-400 mb-4">{t("deleteAccountWarning")}</p>
                        {deleteState.error && (
                          <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                            {deleteState.error}
                          </p>
                        )}
                        <form action={deleteAction}>
                          {user.hasPassword && (
                            <div className="mb-4">
                              <Input
                                id="delete-password"
                                name="password"
                                type="password"
                                label={t("deleteAccountConfirm")}
                              />
                            </div>
                          )}
                          <div className="flex gap-3">
                            <Button
                              variant="filled"
                              disabled={deletePending}
                              className="!bg-red-500 !border-red-500"
                            >
                              {deletePending ? tc("loading") : t("deleteAccount")}
                            </Button>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              {tc("cancel")}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
