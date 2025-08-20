import { requireAuth } from "~/app/_components/auth";
import BaseView from "~/app/_components/BaseView";
import { api, HydrateClient } from "~/trpc/server";
import type { Base as UiBase, Table as UiTable, TableRow } from "~/app/_components/types";

interface BasePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BasePage({ params }: BasePageProps) {
  const { id } = await params;
  
  // Re-enable auth check
  const { session, user } = await requireAuth();

  const dbBase = await api.base.getById(id);
  const base: UiBase = {
    id: dbBase.id,
    name: dbBase.name,
    tables: dbBase.tables.map((t) => ({
      id: t.id,
      name: t.name,
      columns: t.columns.map((c) => ({
        id: c.id,
        name: c.name,
        type: (c.type as unknown as "TEXT" | "NUMBER"),
        order: c.order,
        isRequired: false,
      })),
      rows: t.records.map((r) => ({ id: r.id, data: r.data as Record<string, string | number> })),
    })),
  };

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        <BaseView baseId={id} initialBase={base} />
      </div>
    </HydrateClient>
  );
}
