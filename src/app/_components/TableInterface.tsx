"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Eye, Filter, Group, ArrowUpDown, Palette, List, Share, Search, Plus, CheckSquare, Info, Trash2, ChevronDown, Type, Hash } from "lucide-react";
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
  onTypeChange?: (newType: "TEXT" | "NUMBER") => void;
  currentType: "TEXT" | "NUMBER";
  className?: string;
  isLoading?: boolean;
}

function EditableHeader({ value, onSave, onDelete, onTypeChange, currentType, className, isLoading }: EditableHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update edit value when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

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
      <span onDoubleClick={handleDoubleClick} className="cursor-pointer select-none hover:text-blue-600 transition-colors">
        {value}
      </span>
      
      {/* Column Options Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-700"
          title="Column options"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 min-w-48">
            <div className="py-1">
              {/* Column Type Options */}
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                Column Type
              </div>
              <button
                onClick={() => {
                  if (onTypeChange && currentType !== "TEXT") {
                    onTypeChange("TEXT");
                  }
                  setIsDropdownOpen(false);
                }}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                  currentType === "TEXT" ? "text-blue-600 bg-blue-50" : "text-gray-700"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
                {isLoading && currentType !== "TEXT" && (
                  <span className="text-xs text-gray-500">(changing...)</span>
                )}
              </button>
              <button
                onClick={() => {
                  if (onTypeChange && currentType !== "NUMBER") {
                    onTypeChange("NUMBER");
                  }
                  setIsDropdownOpen(false);
                }}
                disabled={isLoading}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                  currentType === "NUMBER" ? "text-blue-600 bg-blue-50" : "text-gray-700"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Hash className="w-4 h-4" />
                <span>Number</span>
                {isLoading && currentType !== "NUMBER" && (
                  <span className="text-xs text-gray-500">(changing...)</span>
                )}
              </button>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-1"></div>
              
              {/* Delete Option */}
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete column</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const columnHelper = createColumnHelper<TableRow>();

export default function TableInterface({ baseId, table, onChanged }: TableInterfaceProps) {
  const utils = api.useContext();
  
  // Local state for optimistic updates
  const [optimisticTable, setOptimisticTable] = useState(table);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Track which cells are currently being edited to preserve their values during re-renders
  // This prevents text from being deleted when other cells are updated and cause re-renders
  const [editingCells, setEditingCells] = useState<Map<string, string>>(new Map());
  const editingCellsRef = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    editingCellsRef.current = editingCells;
  }, [editingCells]);
  
  // Update optimistic table when prop changes, but avoid clobbering local optimistic values
  useEffect(() => {
    setOptimisticTable((prev) => {
      if (!prev) return table;
      if (prev.id !== table.id) return table; // switched tables

      const prevColIds = prev.columns.map((c) => c.id).join(",");
      const nextColIds = table.columns.map((c) => c.id).join(",");
      const prevRowIds = prev.rows.map((r) => r.id).join(",");
      const nextRowIds = table.rows.map((r) => r.id).join(",");

      // If structure changed (add/remove/reorder), resync; otherwise keep optimistic values
      if (prevColIds !== nextColIds || prevRowIds !== nextRowIds) {
        return table;
      }
      return prev;
    });
  }, [table]);

  // Ensure stable row ordering by maintaining original positions
  // This prevents rows from "jumping around" during optimistic updates
  const getStableRows = (rows: TableRow[]) => {
    // Create a map of original positions from the base table
    const originalPositions = new Map<string, number>();
    table.rows.forEach((row, index) => {
      originalPositions.set(row.id, index);
    });
    
    // Create a stable copy and sort by original position
    const rowsCopy = [...rows];
    return rowsCopy.sort((a, b) => {
      const defaultPos = Number.MAX_SAFE_INTEGER;
      const posA = originalPositions.get(a.id) ?? defaultPos;
      const posB = originalPositions.get(b.id) ?? defaultPos;
      return posA - posB;
    });
  };
  
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
    onSuccess: async (updated) => {
      // Merge server-confirmed values into the optimistic table
      setOptimisticTable(prev => ({
        ...prev,
        rows: prev.rows.map(r => r.id === updated.id ? { ...r, data: updated.data as Record<string, string | number | null> } : r)
      }));
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

  const updateColumnType = api.base.updateColumnType.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
    },
    onError: (error) => {
      console.error('Failed to update column type:', error);
      // You could add a toast notification here
    }
  });

  // Optimistic column rename
  const handleColumnRename = async (columnId: string, newName: string) => {
    // Optimistically update the UI immediately
    setOptimisticTable(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, name: newName } : col
      )
    }));

    try {
      setIsUpdating(true);
      await renameColumn.mutateAsync({ columnId, name: newName });
    } catch (error) {
      console.error('Failed to rename column:', error);
      // Revert optimistic update on error
      setOptimisticTable(prev => ({
        ...prev,
        columns: prev.columns.map(col => 
          col.id === columnId ? { ...col, name: table.columns.find(c => c.id === columnId)?.name || col.name } : col
        )
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Optimistic record update
  const handleRecordUpdate = async (recordId: string, columnId: string, value: string) => {
    let processedValue: string | number | null = value;
    const column = optimisticTable.columns.find(col => col.id === columnId);
    
    // Type validation based on optimistic column type
    if (column && (column.type === "NUMBER" || column.type === "number")) {
      if (value === "" || value === null || value === undefined) {
        processedValue = null;
      } else {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          // If invalid number, don't save
          return;
        }
        processedValue = numValue;
      }
    } else {
      // TEXT type
      processedValue = value || "";
    }

    // Clear the editing state for this cell
    setEditingCells(prev => {
      const newMap = new Map(prev);
      newMap.delete(`${recordId}-${columnId}`);
      return newMap;
    });

    // Optimistically update the UI immediately while preserving row order
    setOptimisticTable(prev => {
      const updatedRows = prev.rows.map(row => 
        row.id === recordId ? {
          ...row,
          data: {
            ...row.data,
            [columnId]: processedValue
          }
        } : row
      );
      
      return {
        ...prev,
        rows: updatedRows
      };
    });

    try {
      setIsUpdating(true);
      await updateRecord.mutateAsync({ 
        recordId, 
        values: { [columnId]: processedValue } 
      });
    } catch (error) {
      console.error('Failed to update record:', error);
      // Revert optimistic update on error while preserving row order
      setOptimisticTable(prev => ({
        ...prev,
        rows: prev.rows.map(row => 
          row.id === recordId ? {
            ...row,
            data: {
              ...row.data,
              [columnId]: table.rows.find(r => r.id === recordId)?.data[columnId] || ""
            }
          } : row
        )
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Optimistic row creation
  const handleCreateRow = async () => {
    // Create a temporary row with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const newRow: TableRow = {
      id: tempId,
      data: Object.fromEntries(
        optimisticTable.columns.map(col => [col.id, ""])
      )
    };

    // Optimistically add the row immediately
    setOptimisticTable(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));

    try {
      await createRecord.mutateAsync({ tableId: optimisticTable.id });
    } catch (error) {
      console.error('Failed to create row:', error);
      // Remove the temporary row on error
      setOptimisticTable(prev => ({
        ...prev,
        rows: prev.rows.filter(row => row.id !== tempId)
      }));
    }
  };

  // Optimistic column creation
  const handleCreateColumn = async () => {
    const newColumnName = `Field ${optimisticTable.columns.length + 1}`;
    
    // Create a temporary column with a temporary ID
    const tempId = `temp-col-${Date.now()}`;
    const newColumn = {
      id: tempId,
      name: newColumnName,
      type: "TEXT" as const,
      order: optimisticTable.columns.length,
      isRequired: false
    };

    // Optimistically add the column immediately
    setOptimisticTable(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      rows: prev.rows.map(row => ({
        ...row,
        data: {
          ...row.data,
          [tempId]: ""
        }
      }))
    }));

    try {
      await createColumn.mutateAsync({ 
        tableId: optimisticTable.id, 
        name: newColumnName 
      });
    } catch (error) {
      console.error('Failed to create column:', error);
      // Remove the temporary column on error
      setOptimisticTable(prev => ({
        ...prev,
        columns: prev.columns.filter(col => col.id !== tempId),
        rows: prev.rows.map(row => {
          const { [tempId]: _, ...restData } = row.data;
          return { ...row, data: restData };
        })
      }));
    }
  };

  // Optimistic column type change
  const handleColumnTypeChange = async (columnId: string, newType: "TEXT" | "NUMBER") => {
    // Optimistically update the column type immediately
    setOptimisticTable(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, type: newType } : col
      )
    }));

    try {
      setIsUpdating(true);
      await updateColumnType.mutateAsync({ columnId, type: newType });
    } catch (error) {
      console.error('Failed to update column type:', error);
      // Revert optimistic update on error
      setOptimisticTable(prev => ({
        ...prev,
        columns: prev.columns.map(col => 
          col.id === columnId ? { ...col, type: table.columns.find(c => c.id === columnId)?.type || col.type } : col
        )
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if any column type change is in progress
  const isColumnTypeChanging = updateColumnType.isPending;

  // Handle cell editing state
  const handleCellEdit = (recordId: string, columnId: string, value: string) => {
    setEditingCells(prev => {
      const newMap = new Map(prev);
      newMap.set(`${recordId}-${columnId}`, value);
      return newMap;
    });
  };

  // Cancel editing for a cell
  const cancelCellEdit = (recordId: string, columnId: string) => {
    setEditingCells(prev => {
      const newMap = new Map(prev);
      newMap.delete(`${recordId}-${columnId}`);
      return newMap;
    });
  };

  // Apply a local optimistic edit as the user types (no server call)
  const applyLocalRecordEdit = (recordId: string, columnId: string, value: string, columnType: "TEXT" | "NUMBER" | "text" | "number") => {
    let processedValue: string | number | null = value;
    const isNumber = columnType === "NUMBER" || columnType === "number";
    if (isNumber) {
      if (value === "" || value == null) {
        processedValue = null;
      } else {
        const n = Number(value);
        if (Number.isNaN(n)) {
          // For invalid numbers, do not update the table yet
          return;
        }
        processedValue = n;
      }
    }
    setOptimisticTable(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === recordId ? {
        ...row,
        data: { ...row.data, [columnId]: processedValue }
      } : row)
    }));
  };

  // Memoize stable, sorted data to avoid remounts on each render
  const stableData = useMemo(() => getStableRows(optimisticTable.rows), [optimisticTable.rows, table.rows]);

  // Local cell editor to avoid focus loss and re-mounts
  interface CellEditorProps {
    recordId: string;
    columnId: string;
    initialValue: string | number | null;
    columnType: "TEXT" | "NUMBER" | "text" | "number";
    onCommit: (value: string) => Promise<void> | void;
  }
  const CellEditor: React.FC<CellEditorProps> = ({ recordId, columnId, initialValue, columnType, onCommit }) => {
    const [value, setValue] = useState<string>(initialValue == null ? "" : String(initialValue));
    const [isFocused, setIsFocused] = useState(false);
    const skipCommitOnBlurRef = useRef(false);

    // Sync when initialValue changes from outside and the input is not focused
    useEffect(() => {
      if (!isFocused) {
        setValue(initialValue == null ? "" : String(initialValue));
      }
    }, [initialValue, isFocused]);

    const handleBlur = async () => {
      if (skipCommitOnBlurRef.current) {
        skipCommitOnBlurRef.current = false;
        setIsFocused(false);
        return;
      }
      await onCommit(value);
      setIsFocused(false);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const inputEl = e.currentTarget;
        skipCommitOnBlurRef.current = true;
        await onCommit(value);
        inputEl?.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        const inputEl = e.currentTarget;
        setValue(initialValue == null ? "" : String(initialValue));
        skipCommitOnBlurRef.current = true;
        inputEl?.blur();
      }
    };

    const isNumber = columnType === "NUMBER" || columnType === "number";

    return (
      <input
        type={isNumber ? "number" : "text"}
        value={value}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => { const v = e.target.value; setValue(v); applyLocalRecordEdit(recordId, columnId, v, columnType); }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="px-2 py-1 w-full bg-transparent outline-none focus:bg-white focus:border focus:border-blue-300 rounded"
        placeholder=""
        inputMode={isNumber ? "decimal" : undefined}
      />
    );
  };

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
    optimisticTable.columns.forEach((col) => {
      cols.push(
        columnHelper.accessor(
          (row): string => String(row.data[col.id] ?? ""),
          {
            id: col.id,
            header: () => (
              <div className="flex items-center space-x-2 group">
                <EditableHeader
                  value={col.name}
                  currentType={col.type === "text" || col.type === "number" ? (col.type === "number" ? "NUMBER" : "TEXT") : col.type}
                  onSave={async (newName) => {
                    await handleColumnRename(col.id, newName);
                  }}
                  onDelete={async () => {
                    if (confirm(`Are you sure you want to delete the column "${col.name}"?`)) {
                      await deleteColumn.mutateAsync({ columnId: col.id });
                    }
                  }}
                  onTypeChange={async (newType) => {
                    try {
                      await handleColumnTypeChange(col.id, newType);
                    } catch (error) {
                      console.error('Failed to update column type:', error);
                    }
                  }}
                  className="font-medium"
                  isLoading={updateColumnType.isPending}
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
              const recordId = info.row.original.id;
              const columnId = col.id;
              
              const onChange = async (v: string) => {
                await handleRecordUpdate(recordId, columnId, v);
              };

              const onInputChange = (v: string) => {
                handleCellEdit(recordId, columnId, v);
              };

              // Get the current value for this cell
              const editingKey = `${recordId}-${columnId}`;
              const editingMap = editingCellsRef.current;
              const baseValueFromAccessor = value ?? "";
              const currentValue = editingMap.has(editingKey)
                ? editingMap.get(editingKey) || ""
                : (baseValueFromAccessor as string);

              // Use the optimistic column type for immediate UI updates
              const currentColumn = optimisticTable.columns.find(c => c.id === col.id);
              const columnType = currentColumn?.type || col.type;

              if (columnType === "NUMBER" || columnType === "number") {
                return (
                  <CellEditor
                    recordId={recordId}
                    columnId={columnId}
                    initialValue={currentValue}
                    columnType={columnType}
                    onCommit={onChange}
                  />
                );
              }
              return (
                <CellEditor
                  recordId={recordId}
                  columnId={columnId}
                  initialValue={currentValue}
                  columnType={columnType}
                  onCommit={onChange}
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
            onClick={handleCreateColumn}
            className="p-1 hover:bg-gray-100 rounded"
            title="Add new column"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        ),
        cell: () => null,
        size: 50,
      })
    );

    return cols;
  }, [optimisticTable.columns, updateColumnType.isPending]);

  const tableInstance = useReactTable({
    data: stableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
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
          <button className="flex items-center space-x-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
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
      <div className="flex-1 overflow-auto relative">
        {(isUpdating || isColumnTypeChanging) && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>{isColumnTypeChanging ? "Changing type..." : "Saving..."}</span>
            </div>
          </div>
        )}
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
                  onClick={handleCreateRow}
                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </td>
              <td colSpan={optimisticTable.columns.length + 1} className="border-r border-gray-200 px-3 py-2">
                <button 
                  onClick={handleCreateRow}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
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
        <span className="text-sm text-gray-600">{optimisticTable.rows.length} records</span>
        <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded">
          <Plus className="w-4 h-4" />
          <span>Add...</span>
        </button>
      </div>
    </div>
  );
}