"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Eye, Filter, Group, ArrowUpDown, Palette, List, Share, Search, Plus, CheckSquare, Info, Trash2 } from "lucide-react";
import type { Table as TableType, TableRow } from "./types";
import { api } from "~/trpc/react";

interface TableInterfaceProps {
  baseId: string;
  table: TableType;
  onChanged?: () => void;
}

interface EditableHeaderProps {
  value: string;
  onSave: (newValue: string) => void;
  onDelete?: () => void;
  className?: string;
}

function EditableHeader({ value, onSave, onDelete, className }: EditableHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-white border border-blue-500 rounded px-1 py-0.5 outline-none ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span onDoubleClick={handleDoubleClick} className="cursor-pointer select-none">
        {value}
      </span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete column"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

const columnHelper = createColumnHelper<TableRow>();

export default function TableInterface({ baseId, table, onChanged }: TableInterfaceProps) {
  const utils = api.useContext();
  
  const createColumn = api.base.createColumn.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    }
  });
  
  const deleteColumn = api.base.deleteColumn.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    }
  });
  
  const createRecord = api.base.createRecord.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    }
  });
  
  const deleteRecord = api.base.deleteRecord.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    }
  });
  
  const updateRecord = api.base.updateRecord.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    }
  });
  
  const renameColumn = api.base.renameColumn.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    }
  });

  const columns = useMemo<ColumnDef<TableRow, string | number | null>[]>(() => {
    // Add checkbox column
    const cols: ColumnDef<TableRow, string | number | null>[] = [
      columnHelper.display({
        id: "select",
        header: () => <div className="w-4 h-4" />,
        cell: () => <CheckSquare className="w-4 h-4 text-gray-400" />,
        size: 50,
      }),
    ];

    // Add data columns
    table.columns.forEach((col) => {
      cols.push(
        columnHelper.accessor(
          (row): string => String(row.data[col.id] ?? ""),
          {
            id: col.id,
            header: () => (
              <div className="flex items-center space-x-2 group">
                <EditableHeader
                  value={col.name}
                  onSave={async (newName) => {
                    await renameColumn.mutateAsync({ columnId: col.id, name: newName });
                  }}
                  onDelete={async () => {
                    if (confirm(`Are you sure you want to delete the column "${col.name}"?`)) {
                      await deleteColumn.mutateAsync({ columnId: col.id });
                    }
                  }}
                  className="font-medium"
                />
                {col.isRequired && <span className="text-red-500">*</span>}
                {col.name === "Notes" && <List className="w-4 h-4 text-gray-500" />}
                {col.name === "Assignee" && <span className="text-blue-600 font-medium">A</span>}
                {col.name === "Status" && <span className="text-gray-500">⏰</span>}
                {col.name === "Attachments" && <span className="text-gray-500">📎</span>}
                {col.name === "Attachment Sum" && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">∑</span>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
            ),
            cell: (info) => {
              const value = info.getValue();
              const onChange = async (v: string) => {
                const recordId = info.row.original.id;
                await updateRecord.mutateAsync({ recordId, values: { [col.id]: v } });
              };

              if ((col.type === "NUMBER" || col.type === "number")) {
                return (
                  <input
                    type="number"
                    defaultValue={value ? Number(value) : undefined}
                    onBlur={(e) => onChange(e.currentTarget.value)}
                    className="px-2 py-1 w-full bg-transparent outline-none"
                  />
                );
              }
              return (
                <input
                  type="text"
                  defaultValue={value ? String(value) : ""}
                  onBlur={(e) => onChange(e.currentTarget.value)}
                  placeholder=""
                  className="px-2 py-1 w-full bg-transparent outline-none"
                />
              );
            },
            size: 200,
          }
        ) as ColumnDef<TableRow, string | number | null>
      );
    });

    // Add new column button
    cols.push(
      columnHelper.display({
        id: "addColumn",
        header: () => (
          <button
            onClick={async () => {
              await createColumn.mutateAsync({ tableId: table.id, name: `Field ${table.columns.length + 1}` });
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        ),
        cell: () => null,
        size: 50,
      })
    );

    return cols;
  }, [table.columns, table.id, createColumn, renameColumn, deleteColumn, updateRecord, utils.base.getById, baseId, onChanged]);

  const tableInstance = useReactTable({
    data: table.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <Eye className="w-4 h-4" />
            <span>Hide fields</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <Group className="w-4 h-4" />
            <span>Group</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <Palette className="w-4 h-4" />
            <span>Color</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <List className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            <Share className="w-4 h-4" />
            <span>Share and sync</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
            Tools
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-r border-gray-200 px-3 py-3 text-left text-sm font-medium text-gray-900 bg-gray-50 first:border-l-0"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableInstance.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 group">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-r border-gray-200 px-3 py-2 text-sm text-gray-900 first:border-l-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {/* Add delete row button */}
                <td className="border-r border-gray-200 px-3 py-2">
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this row?")) {
                        await deleteRecord.mutateAsync({ recordId: row.original.id });
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Add new row button */}
            <tr>
              <td className="border-r border-gray-200 px-3 py-2 first:border-l-0">
                <button
                  onClick={async () => {
                    await createRecord.mutateAsync({ tableId: table.id });
                  }}
                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </td>
              <td colSpan={table.columns.length + 1} className="border-r border-gray-200 px-3 py-2">
                <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add...
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-600">{table.rows.length} records</span>
        <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
          <Plus className="w-4 h-4" />
          <span>Add...</span>
        </button>
      </div>
    </div>
  );
}