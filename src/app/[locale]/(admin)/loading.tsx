export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-6 h-6 border-2 border-accent-dim border-t-accent rounded-full animate-spin" />
      <p className="font-mono text-[10px] text-text-muted tracking-[2px]">
        LOADING
      </p>
    </div>
  );
}
