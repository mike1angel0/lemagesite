export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-8 h-8 border-2 border-accent-dim border-t-accent rounded-full animate-spin" />
      <p className="font-mono text-xs text-text-muted tracking-[2px] animate-pulse">
        LOADING
      </p>
    </div>
  );
}
