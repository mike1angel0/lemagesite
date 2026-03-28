const CACHE_NAME = "selenarium-v1";
const STATIC_ASSETS = [
  "/favicon.ico",
  "/logo.png",
  "/images/placeholder.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle share target POST — extract URL from share data and redirect to admin
  if (request.method === "POST" && url.pathname === "/api/social/capture") {
    event.respondWith(
      (async () => {
        const formData = await request.formData();
        const shareUrl = formData.get("url") || "";
        const shareText = formData.get("content") || formData.get("title") || "";

        // Android/iOS often put the URL in the text field
        // Extract URL from text if url field is empty
        let captureUrl = shareUrl.toString().trim();
        const textStr = shareText.toString().trim();

        if (!captureUrl && textStr) {
          const urlMatch = textStr.match(/https?:\/\/[^\s]+/);
          if (urlMatch) captureUrl = urlMatch[0];
        }
        if (!captureUrl && textStr) {
          captureUrl = textStr;
        }

        // Redirect to admin social page with URL as query param
        // The page will handle the capture with proper auth
        const encodedUrl = encodeURIComponent(captureUrl);
        const encodedContent = encodeURIComponent(textStr);
        return Response.redirect(
          `/admin/social?share_url=${encodedUrl}&share_content=${encodedContent}`,
          303
        );
      })()
    );
    return;
  }

  // Only cache GET requests
  if (request.method !== "GET") return;

  // Skip API routes and auth
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return;

  // Network-first for HTML pages, cache-first for assets
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
