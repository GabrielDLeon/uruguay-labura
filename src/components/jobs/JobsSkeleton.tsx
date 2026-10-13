export default function JobsSkeleton() {
  return (
    <section
      className="flex flex-col gap-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="bg-accent animate-pulse h-4 w-16 rounded-md" />
          <div className="bg-accent animate-pulse h-9 w-full rounded-md" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-accent animate-pulse h-8 w-28 rounded-md" />
          <div className="bg-accent animate-pulse h-8 w-32 rounded-md" />
          <div className="bg-accent animate-pulse h-8 w-20 rounded-md" />
        </div>
        <div>
          <div className="bg-accent animate-pulse h-8 w-36 rounded-md" />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="grid gap-3">
          <div className="bg-accent animate-pulse h-10 w-full rounded-md" />
          <div className="bg-accent animate-pulse h-12 w-full rounded-md" />
          <div className="bg-accent animate-pulse h-12 w-full rounded-md" />
          <div className="bg-accent animate-pulse h-12 w-full rounded-md" />
          <div className="bg-accent animate-pulse h-12 w-full rounded-md" />
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        <article className="card grid gap-3">
          <div className="bg-accent animate-pulse h-5 w-24 rounded-md" />
          <div className="bg-accent animate-pulse h-5 w-4/5 rounded-md" />
          <div className="bg-accent animate-pulse h-4 w-1/2 rounded-md" />
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-accent animate-pulse h-4 w-full rounded-md" />
            <div className="bg-accent animate-pulse h-4 w-full rounded-md" />
            <div className="bg-accent animate-pulse h-4 w-full rounded-md" />
            <div className="bg-accent animate-pulse h-4 w-full rounded-md" />
          </div>
          <div className="bg-accent animate-pulse h-9 w-32 rounded-md" />
        </article>
      </div>
    </section>
  );
}
