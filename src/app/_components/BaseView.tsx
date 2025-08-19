"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TableHeader from "./TableHeader";
import TableInterface from "./TableInterface";
import Header from "./Header";
import type { Base, Table } from "./types";

interface BaseViewProps {
  base: Base;
}

export default function BaseView({ base }: BaseViewProps) {
  const [selectedTable, setSelectedTable] = useState<Table | undefined>(base.tables[0]);

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
          selectedTable={selectedTable} 
          onTableSelect={setSelectedTable} 
        />
        
        <div className="flex-1 flex flex-col">
          <TableHeader base={base} />
          <TableInterface table={selectedTable} />
        </div>
      </div>
    </div>
  );
}
