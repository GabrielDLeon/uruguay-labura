interface Props {
  message: string;
  onRetry: () => void;
}

export default function JobsLoadError({ message, onRetry }: Props) {
  return (
    <section className="grid gap-4">
      <p className="text-destructive text-sm">
        No se pudieron cargar los llamados. {message}
      </p>
      <div>
        <button type="button" className="btn" data-size="sm" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </section>
  );
}
