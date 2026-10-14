import { BLOCK_BASE_CLASS } from "@/components/common/block";
import JobDetailSkeleton from "@/components/jobs/JobDetailSkeleton";

const JOB_BLOCKS = Array.from({ length: 4 });
const META_ITEMS = Array.from({ length: 6 });

function JobBlockSkeleton() {
  return (
    <div
      className={`${BLOCK_BASE_CLASS} w-full min-w-0 shrink-0 border-b border-border`}
    >
      <header className="flex items-start gap-3">
        <div className="bg-accent animate-pulse h-8 w-8 shrink-0 rounded-md" />
        <div className="grid min-w-0 flex-1 gap-2">
          <div className="bg-accent animate-pulse h-4 w-3/4 rounded-md" />
          <div className="bg-accent animate-pulse h-3 w-1/2 rounded-md" />
        </div>
        <div className="bg-accent animate-pulse size-5 shrink-0 rounded" />
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="bg-accent animate-pulse h-5 w-20 rounded-full" />
        <div className="bg-accent animate-pulse h-3 w-24 rounded-md" />
        <div className="bg-accent animate-pulse h-3 w-28 rounded-md" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="bg-accent animate-pulse h-3 w-32 rounded-md" />
        <div className="bg-accent animate-pulse h-3 w-24 rounded-md" />
      </div>
    </div>
  );
}

function JobDetailArticleSkeleton() {
  return (
    <article
      className={`${BLOCK_BASE_CLASS} flex min-h-full min-w-0 flex-col gap-4`}
    >
      <header className="flex items-start gap-3">
        <div className="bg-accent animate-pulse h-8 w-8 shrink-0 rounded-md" />
        <div className="grid min-w-0 flex-1 gap-2">
          <div className="bg-accent animate-pulse h-5 w-3/4 rounded-md" />
          <div className="bg-accent animate-pulse h-4 w-1/2 rounded-md" />
        </div>
        <div className="bg-accent animate-pulse size-5 shrink-0 rounded" />
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-accent animate-pulse h-5 w-20 rounded-full" />
        <div className="bg-accent animate-pulse h-5 w-24 rounded-full" />
      </div>

      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {META_ITEMS.map((_, index) => (
          <div key={index} className="grid gap-1.5">
            <div className="bg-accent animate-pulse h-3 w-20 rounded-md" />
            <div className="bg-accent animate-pulse h-4 w-32 rounded-md" />
          </div>
        ))}
      </dl>

      <div className="border-t border-border pt-4">
        <JobDetailSkeleton />
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <div className="bg-accent animate-pulse h-9 w-56 rounded-md" />
        <div className="bg-accent animate-pulse h-3 w-full max-w-72 rounded-md" />
      </footer>
    </article>
  );
}

export default function JobsBoardSkeleton() {
  return (
    <section className="flex flex-col" aria-live="polite" aria-busy="true">
      <div className="px-4 pb-6 sm:px-6">
        <div className="form grid gap-4">
          <div className="bg-accent animate-pulse h-9 w-full rounded-md" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-accent animate-pulse h-8 w-28 rounded-md" />
            <div className="bg-accent animate-pulse h-8 w-32 rounded-md" />
            <div className="bg-accent animate-pulse h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>

      <div className="grid border-t lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex min-w-0 flex-col lg:max-h-[calc(100vh-5rem)] lg:overflow-hidden">
          {JOB_BLOCKS.map((_, index) => (
            <JobBlockSkeleton key={index} />
          ))}
        </div>
        <div className="hidden min-w-0 lg:block lg:border-l lg:border-border">
          <JobDetailArticleSkeleton />
        </div>
      </div>
    </section>
  );
}
