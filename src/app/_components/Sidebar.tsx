"use client";

import { ChevronDown, Plus, Grid, Settings } from "lucide-react";
import type { Table } from "./types";

interface SidebarProps {
  selectedTable: Table;
  onTableSelect: (table: Table) => void;
}

export default function Sidebar({ selectedTable, onTableSelect }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Table Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{selectedTable.name}</h3>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <Plus className="w-4 h-4 mr-1" />
          Add or import
        </button>
      </div>

      {/* View Management */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Grid className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Grid view</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
          <Plus className="w-4 h-4 mr-1" />
          Create new...
        </button>
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <span className="mr-1">🔍</span>
          Find a view
        </button>
      </div>

      {/* View Settings */}
      <div className="p-4">
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
          <span className="text-sm font-medium">Grid view</span>
          <Settings className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="mt-auto p-4 space-y-3">
        <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
          <span className="text-sm font-medium text-gray-600">?</span>
        </button>
        <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
          <span className="text-sm font-medium text-gray-600">🔔</span>
        </button>
        <button className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600">
          <span className="text-sm font-medium text-white">A</span>
        </button>
      </div>
    </div>
  );
}
