"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TableHeader from "./TableHeader";
import TableInterface from "./TableInterface";
import Header from "./Header";
import type { Base, Table } from "./types";
import { api } from "~/trpc/react";
import type { Base as UiBase, Table as UiTable } from "./types";

interface BaseViewProps {
  baseId: string;
  initialBase: UiBase;
}

export default function BaseView({ baseId, initialBase }: BaseViewProps) {
  const { data: dbBase, refetch } = api.base.getById.useQuery(baseId);
  const base: UiBase = dbBase
    ? {
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
      }
    : initialBase;
  const [selectedTable, setSelectedTable] = useState<UiTable | undefined>(base.tables[0]);

  // Keep selection stable and refresh selected table content only when data actually changes
  useEffect(() => {
    if (!dbBase) return;
    const mapTable = (t: typeof dbBase.tables[number]): UiTable => ({
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
    });

    if (!selectedTable) {
      if (dbBase.tables[0]) setSelectedTable(mapTable(dbBase.tables[0]));
      return;
    }
    const match = dbBase.tables.find((t) => t.id === selectedTable.id);
    if (!match && dbBase.tables[0]) {
      setSelectedTable(mapTable(dbBase.tables[0]));
      return;
    }
    if (match) {
      const needsUpdate =
        match.columns.length !== selectedTable.columns.length ||
        match.records.length !== selectedTable.rows.length;
      if (needsUpdate) setSelectedTable(mapTable(match));
    }
  }, [dbBase, selectedTable]);

  if (!selectedTable) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No tables found</h2>
          <p className="text-gray-600">Create a table to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header baseName={base.name} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          baseId={baseId}
          tables={base.tables}
          selectedTable={selectedTable}
          onTableSelect={setSelectedTable}
          onChanged={() => void refetch()}
        />
        
        <div className="flex-1 flex flex-col">
          <TableHeader base={base} />
          {selectedTable && (
            <TableInterface baseId={baseId} table={selectedTable} onChanged={() => void refetch()} />
          )}
        </div>
      </div>
    </div>
  );
}
