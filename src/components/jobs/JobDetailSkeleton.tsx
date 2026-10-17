const DETAIL_SECTIONS = Array.from({ length: 3 });

export default function JobDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-live="polite" aria-busy="true">
      {DETAIL_SECTIONS.map((_, index) => (
        <div key={index} className="grid gap-2">
          <div className="bg-accent animate-pulse h-4 w-40 rounded-md" />
          <div className="bg-accent animate-pulse h-4 w-full rounded-md" />
          <div className="bg-accent animate-pulse h-4 w-5/6 rounded-md" />
        </div>
      ))}
    </div>
  );
}
