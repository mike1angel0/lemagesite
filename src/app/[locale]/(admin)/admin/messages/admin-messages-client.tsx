"use client";

import { useState, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { replyMessageAction } from "@/lib/actions/messages";
import type { AuthState } from "@/lib/actions/auth";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";

interface MessageReply {
  id: string;
  body: string;
  isFromAdmin: boolean;
  read: boolean;
  createdAt: string;
}

interface ThreadUser {
  id: string;
  name: string | null;
  email: string;
}

interface Thread {
  id: string;
  subject: string;
  body: string;
  isFromAdmin: boolean;
  read: boolean;
  createdAt: string;
  user: ThreadUser;
  replies: MessageReply[];
}

const labelClass = "font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted";

export function AdminMessagesClient({ threads }: { threads: Thread[] }) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyState, replyAction, replyPending] = useActionState(replyMessageAction, {} as AuthState);

  if (selectedThread) {
    const thread = threads.find((t) => t.id === selectedThread);
    if (!thread) return null;

    const allMessages = [
      { id: thread.id, body: thread.body, isFromAdmin: thread.isFromAdmin, createdAt: thread.createdAt },
      ...thread.replies,
    ];

    return (
      <div className="p-8 max-w-4xl">
        <button
          onClick={() => setSelectedThread(null)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[2px] text-text-muted hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to messages
        </button>

        <div className="mb-2">
          <span className={labelClass}>From</span>
          <p className="font-sans text-sm text-text-primary mt-1">
            {thread.user.name || thread.user.email}
            <span className="text-text-muted ml-2">({thread.user.email})</span>
          </p>
        </div>

        <h2 className="font-serif text-xl text-text-primary mb-6">{thread.subject}</h2>

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
                  {msg.isFromAdmin ? "You (Admin)" : thread.user.name || "Member"}
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
            Reply sent.
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
            <label htmlFor="admin-reply" className={labelClass}>Reply</label>
            <textarea
              id="admin-reply"
              name="body"
              rows={4}
              placeholder="Write your reply..."
              className="mt-2 w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
            />
          </div>
          <div className="mt-4">
            <Button variant="filled" disabled={replyPending}>
              <Send className="size-4 mr-2" />
              {replyPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="size-5 text-accent" />
        <h1 className="font-serif text-2xl text-text-primary">Messages</h1>
      </div>

      {threads.length === 0 ? (
        <Card>
          <p className="font-sans text-sm text-text-muted">No messages yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => {
            const lastMessage = thread.replies.length > 0
              ? thread.replies[thread.replies.length - 1]
              : thread;
            const hasUnreadFromMember = !lastMessage.isFromAdmin && !lastMessage.read && thread.replies.length > 0;
            const needsReply = !lastMessage.isFromAdmin;

            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className="w-full text-left border border-border rounded px-5 py-4 hover:bg-bg-elevated transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    {needsReply && (
                      <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                    )}
                    <span className="font-sans text-sm font-medium text-text-primary">
                      {thread.subject}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-text-muted tracking-[1px]">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-5">
                  <span className="font-mono text-[9px] text-text-muted tracking-[2px] uppercase">
                    {thread.user.name || thread.user.email}
                  </span>
                  <span className="font-mono text-[9px] text-text-muted">·</span>
                  <span className="font-mono text-[9px] text-text-muted tracking-[1px]">
                    {1 + thread.replies.length} messages
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
