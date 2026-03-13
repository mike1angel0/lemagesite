"use client";

interface ShareButtonsProps {
  labels?: { x?: string; facebook?: string; copyLink?: string };
}

export function ShareButtons({ labels }: ShareButtonsProps) {
  const xLabel = labels?.x ?? "X";
  const fbLabel = labels?.facebook ?? "Facebook";
  const copyLabel = labels?.copyLink ?? "Copy Link";

  function shareOnX() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(
      `https://x.com/intent/tweet?url=${url}&text=${title}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  }

  return (
    <>
      <button
        onClick={shareOnX}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {xLabel}
      </button>
      <button
        onClick={shareOnFacebook}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {fbLabel}
      </button>
      <button
        onClick={copyLink}
        className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {copyLabel}
      </button>
    </>
  );
}
