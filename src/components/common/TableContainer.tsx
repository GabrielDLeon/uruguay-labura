import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Envoltorio canónico de tablas del sitio: borde redondeado y scroll
 * horizontal contenido. Lo comparten `DataTable` y `JobsTable`.
 */
export default function TableContainer({ children }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
