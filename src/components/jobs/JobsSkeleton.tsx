export default function JobsSkeleton() {
  return (
    <section
      className="flex flex-col gap-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="card bg-transparent">
        <section className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-2 lg:col-span-2">
              <div className="bg-accent animate-pulse h-4 w-24 rounded-md" />
              <div className="bg-accent animate-pulse h-10 w-full rounded-md" />
            </div>
            <div className="grid gap-2">
              <div className="bg-accent animate-pulse h-4 w-24 rounded-md" />
              <div className="bg-accent animate-pulse h-10 w-full rounded-md" />
            </div>
            <div className="grid gap-2">
              <div className="bg-accent animate-pulse h-4 w-24 rounded-md" />
              <div className="bg-accent animate-pulse h-10 w-full rounded-md" />
            </div>
            <div className="grid gap-2">
              <div className="bg-accent animate-pulse h-4 w-24 rounded-md" />
              <div className="bg-accent animate-pulse h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="bg-accent animate-pulse h-4 w-16 rounded-md" />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-accent animate-pulse h-6 w-full rounded-md" />
              <div className="bg-accent animate-pulse h-6 w-full rounded-md" />
              <div className="bg-accent animate-pulse h-6 w-full rounded-md" />
              <div className="bg-accent animate-pulse h-6 w-full rounded-md" />
            </div>
          </div>
        </section>
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
