"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { MessageCircle, Trash2, Reply, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { addCommentAction, deleteCommentAction, getComments } from "@/lib/actions/comments";
import type { ContentType } from "@/generated/prisma/client";

type CommentUser = {
  id: string;
  name: string | null;
  image: string | null;
};

type CommentData = {
  id: string;
  body: string;
  createdAt: Date;
  user: CommentUser;
  replies: {
    id: string;
    body: string;
    createdAt: Date;
    user: CommentUser;
  }[];
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function CommentItem({
  comment,
  contentType,
  contentId,
  currentUserId,
  isAdmin,
  onRefresh,
  isReply = false,
}: {
  comment: CommentData | CommentData["replies"][0];
  contentType: ContentType;
  contentId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onRefresh: () => void;
  isReply?: boolean;
}) {
  const t = useTranslations("comments");
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const canDelete = currentUserId === comment.user.id || isAdmin;
  const hasReplies = "replies" in comment && comment.replies.length > 0;

  async function handleReply() {
    if (!replyText.trim()) return;
    startTransition(async () => {
      const result = await addCommentAction(contentType, contentId, replyText, comment.id);
      if (result.success) {
        setReplyText("");
        setShowReply(false);
        onRefresh();
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      await deleteCommentAction(comment.id);
      onRefresh();
    });
  }

  return (
    <div className={`flex gap-3 ${isReply ? "ml-10" : ""}`}>
      <div className="shrink-0">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name ?? ""}
            width={isReply ? 28 : 32}
            height={isReply ? 28 : 32}
            className="rounded-full"
          />
        ) : (
          <div className={`${isReply ? "w-7 h-7" : "w-8 h-8"} rounded-full bg-bg-elevated flex items-center justify-center`}>
            <span className="font-sans text-xs text-text-muted">
              {(comment.user.name ?? "?")[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-medium text-text-primary">
            {comment.user.name ?? "Anonymous"}
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="font-sans text-sm text-text-secondary leading-relaxed mt-1 whitespace-pre-wrap">
          {comment.body}
        </p>
        <div className="flex items-center gap-3 mt-2">
          {!isReply && currentUserId && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 font-mono text-[10px] text-text-muted hover:text-text-primary transition-colors"
            >
              <Reply className="size-3" />
              {t("reply")}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-1 font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors"
            >
              <Trash2 className="size-3" />
              {t("delete")}
            </button>
          )}
        </div>

        {showReply && (
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-bg-elevated border border-border rounded px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
            />
            <button
              onClick={handleReply}
              disabled={isPending || !replyText.trim()}
              className="bg-accent rounded px-3 py-2 text-bg disabled:opacity-50 transition-colors"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        )}

        {hasReplies && (
          <div className="flex flex-col gap-4 mt-4">
            {(comment as CommentData).replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                contentType={contentType}
                contentId={contentId}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onRefresh={onRefresh}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({
  contentType,
  contentId,
}: {
  contentType: ContentType;
  contentId: string;
}) {
  const t = useTranslations("comments");
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentUserId = session?.user?.id;
  const isAdmin = (session?.user as unknown as Record<string, unknown>)?.role === "ADMIN";

  function loadComments() {
    getComments(contentType, contentId)
      .then((data) => {
        setComments(data as unknown as CommentData[]);
      })
      .catch(() => {
        // Silently fail if comments table doesn't exist yet
      });
  }

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId]);

  async function handleSubmit() {
    if (!newComment.trim()) return;
    startTransition(async () => {
      const result = await addCommentAction(contentType, contentId, newComment);
      if (result.success) {
        setNewComment("");
        loadComments();
      }
    });
  }

  return (
    <div className="py-10 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="size-5 text-accent" />
        <h3 className="font-serif text-xl text-text-primary">
          {t("title")}
        </h3>
        {comments.length > 0 && (
          <span className="font-mono text-[10px] text-text-muted bg-bg-elevated rounded-full px-2 py-0.5">
            {comments.length}
          </span>
        )}
      </div>

      {currentUserId ? (
        <div className="flex gap-3 mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("placeholder")}
            rows={3}
            className="flex-1 bg-bg-elevated border border-border rounded-lg px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dim resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={isPending || !newComment.trim()}
            className="self-end bg-accent rounded-lg px-4 py-2.5 font-sans text-sm text-bg font-medium disabled:opacity-50 transition-colors"
          >
            {t("submit")}
          </button>
        </div>
      ) : (
        <p className="font-sans text-sm text-text-muted mb-8">
          <a href="/auth/login" className="text-accent hover:underline">{t("loginToComment")}</a>
        </p>
      )}

      {comments.length === 0 ? (
        <p className="font-sans text-sm text-text-muted">{t("noComments")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              contentType={contentType}
              contentId={contentId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onRefresh={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
