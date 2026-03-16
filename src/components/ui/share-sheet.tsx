"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Link2, Check, Mail, Share2 } from "lucide-react";

// ── Platform definitions ──

type SharePlatform = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  share: (url: string, title: string) => void;
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.465 0c-.533.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
    </svg>
  );
}

function buildPlatforms(url: string, title: string): SharePlatform[] {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return [
    {
      id: "x",
      label: "X",
      icon: <XIcon />,
      color: "#000000",
      share: () =>
        window.open(
          `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <FacebookIcon />,
      color: "#1877F2",
      share: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      color: "#25D366",
      share: () =>
        window.open(
          `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <TelegramIcon />,
      color: "#0088CC",
      share: () =>
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      color: "#0A66C2",
      share: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "reddit",
      label: "Reddit",
      icon: <RedditIcon />,
      color: "#FF4500",
      share: () =>
        window.open(
          `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "pinterest",
      label: "Pinterest",
      icon: <PinterestIcon />,
      color: "#E60023",
      share: () =>
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="size-5" />,
      color: "#7A8599",
      share: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
      },
    },
  ];
}

// ── Image generation format types ──

export type ImageFormat = "square" | "story";
export type ImagePlatform = "instagram" | "tiktok";

type ImageAction = {
  platform: ImagePlatform;
  format: ImageFormat;
  label: string;
  generating: boolean;
};

// ── Component ──

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Called when user clicks an image generation button */
  onGenerateImage?: (platform: ImagePlatform, format: ImageFormat) => void;
  /** Which image format is currently generating (null if none) */
  generatingImage?: { platform: ImagePlatform; format: ImageFormat } | null;
  /** Show image generation section */
  showImageGen?: boolean;
}

export function ShareSheet({
  isOpen,
  onClose,
  title,
  onGenerateImage,
  generatingImage,
  showImageGen = true,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title,
        url: window.location.href,
      });
    } catch {
      // User cancelled or not supported
    }
  }, [title]);

  if (!isOpen) return null;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const platforms = buildPlatforms(url, title);

  const imageActions: ImageAction[] = [
    {
      platform: "instagram",
      format: "square",
      label: "IG Post",
      generating:
        generatingImage?.platform === "instagram" &&
        generatingImage?.format === "square",
    },
    {
      platform: "instagram",
      format: "story",
      label: "IG Story",
      generating:
        generatingImage?.platform === "instagram" &&
        generatingImage?.format === "story",
    },
    {
      platform: "tiktok",
      format: "square",
      label: "TikTok Post",
      generating:
        generatingImage?.platform === "tiktok" &&
        generatingImage?.format === "square",
    },
    {
      platform: "tiktok",
      format: "story",
      label: "TikTok Story",
      generating:
        generatingImage?.platform === "tiktok" &&
        generatingImage?.format === "story",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg slide-in-from-bottom">
        <div className="bg-bg-elevated border-t border-border rounded-t-2xl px-6 pt-4 pb-8 max-h-[85vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-border-strong" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-accent-dim">
              Share
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded-full hover:bg-bg-surface"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Share platforms grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  p.share(url, title);
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-text-primary group-hover:border-accent-dim transition-colors">
                  {p.icon}
                </div>
                <span className="font-sans text-[10px] text-text-muted group-hover:text-text-secondary transition-colors">
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          {/* Copy link + Native share */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors"
            >
              {copied ? (
                <Check className="size-4 text-green-400" />
              ) : (
                <Link2 className="size-4" />
              )}
              <span className="font-sans text-xs">
                {copied ? "Copied!" : "Copy Link"}
              </span>
            </button>

            {hasNativeShare && (
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors"
              >
                <Share2 className="size-4" />
                <span className="font-sans text-xs">More...</span>
              </button>
            )}
          </div>

          {/* Image generation section */}
          {showImageGen && onGenerateImage && (
            <>
              <div className="border-t border-border pt-5">
                <h3 className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-accent-dim mb-4">
                  Create Image
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {imageActions.map((action) => (
                    <button
                      key={`${action.platform}-${action.format}`}
                      onClick={() =>
                        onGenerateImage(action.platform, action.format)
                      }
                      disabled={generatingImage !== null}
                      className="flex items-center justify-center gap-2 h-11 rounded-lg border border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:border-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {action.generating ? (
                        <span className="font-sans text-xs text-accent animate-pulse">
                          Generating...
                        </span>
                      ) : (
                        <span className="font-sans text-xs">
                          {action.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-text-muted mt-3 text-center tracking-wider">
                  Downloads branded images for Instagram & TikTok
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
