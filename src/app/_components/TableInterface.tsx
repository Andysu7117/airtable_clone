"use client";

import { useState, useMemo } from "react";
import { Plus, Type, Hash } from "lucide-react";
import { faker } from "@faker-js/faker";
import type { Column, Table } from "./types";

interface TableInterfaceProps {
  table: Table;
}

export default function TableInterface({ table }: TableInterfaceProps) {
  const [columns, setColumns] = useState<Column[]>(table.columns);
  const [rows, setRows] = useState<any[]>(table.rows);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // Generate sample data
  const generateData = (count: number) => {
    const newRows = [];
    for (let i = 0; i < count; i++) {
      const row: any = {};
      columns.forEach((col) => {
        row[col.id] = col.type === "text" ? faker.lorem.words(2) : faker.number.int({ min: 1, max: 1000 });
      });
      newRows.push(row);
    }
    setRows(newRows);
  };

  // Add column
  const addColumn = () => {
    const newColumn: Column = {
      id: `col_${Date.now()}`,
      name: `Column ${columns.length + 1}`,
      type: "text"
    };
    setColumns([...columns, newColumn]);
    setRows(rows.map(row => ({ ...row, [newColumn.id]: "" })));
  };

  // Add row
  const addRow = () => {
    const newRow: any = {};
    columns.forEach((col) => { newRow[col.id] = ""; });
    setRows([...rows, newRow]);
  };

  // Cell editing
  const startEditing = (rowIndex: number, colIndex: number, value: string) => {
    setEditingCell({ rowIndex, colIndex });
    setEditingValue(value);
  };

  const saveCell = () => {
    if (editingCell && columns[editingCell.colIndex]) {
      const column = columns[editingCell.colIndex];
      if (column) {
        const newRows = [...rows];
        newRows[editingCell.rowIndex][column.id] = editingValue;
        setRows(newRows);
        setEditingCell(null);
        setEditingValue("");
      }
    }
  };

  // Generate initial data
  useMemo(() => {
    if (rows.length === 0) generateData(100);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => generateData(100)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Generate 100 Rows
          </button>
          <button
            onClick={() => generateData(100000)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Generate 100k Rows
          </button>
          <span className="text-sm text-gray-600">
            {rows.length.toLocaleString()} records
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className="w-16 p-3 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">#</span>
        </div>
        
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-32 p-3 border-r border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              {column.type === "text" ? (
                <Type className="w-4 h-4 text-gray-500" />
              ) : (
                <Hash className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-900">{column.name}</span>
            </div>
          </div>
        ))}
        
        <button onClick={addColumn} className="w-12 p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
          <Plus className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-auto">
        {rows.slice(0, 1000).map((row, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-gray-200 hover:bg-gray-50">
            <div className="w-16 p-3 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
              <span className="text-sm text-gray-600">{rowIndex + 1}</span>
            </div>
            
            {columns.map((column, colIndex) => (
              <div key={column.id} className="flex-1 min-w-32 p-3 border-r border-gray-200">
                {editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveCell()}
                    onBlur={saveCell}
                    className="w-full p-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div
                    className="min-h-[24px] cursor-pointer hover:bg-blue-50 p-1 rounded"
                    onClick={() => startEditing(rowIndex, colIndex, row[column.id] || "")}
                  >
                    <span className="text-sm text-gray-900">
                      {row[column.id] || ""}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        
        {rows.length > 1000 && (
          <div className="p-4 text-center text-gray-500 border-b border-gray-200">
            Showing first 1,000 of {rows.length.toLocaleString()} rows
          </div>
        )}
        
        {/* Add row button */}
        <div className="flex border-b border-gray-200">
          <div className="w-16 p-3 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
            <button onClick={addRow} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 p-3">
            <button onClick={addRow} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Add...
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-600">{rows.length.toLocaleString()} records</span>
      </div>
    </div>
  );
}
