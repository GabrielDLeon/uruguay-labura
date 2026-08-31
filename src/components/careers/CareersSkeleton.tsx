export default function CareersSkeleton() {
  return (
    <div className="grid gap-3" aria-live="polite" aria-busy="true">
      <div className="bg-accent animate-pulse h-9 w-full rounded-md sm:max-w-xs" />
      <div className="bg-accent animate-pulse h-10 w-full rounded-md" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-accent animate-pulse h-9 w-full rounded-md" />
      ))}
    </div>
  )
}
