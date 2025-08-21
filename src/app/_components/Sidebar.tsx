"use client";

import { useState } from "react";
import { ChevronDown, Plus, Menu, Grid3X3, Search, Settings, HelpCircle, Bell, User, Trash2 } from "lucide-react";
import type { Table } from "./types";
import { api } from "~/trpc/react";

interface SidebarProps {
  baseId: string;
  tables: Table[];
  selectedTable: Table;
  onTableSelect: (table: Table) => void;
  onChanged?: () => void;
}

interface EditableTableNameProps {
  value: string;
  onSave: (newValue: string) => void;
}

function EditableTableName({ value, onSave }: EditableTableNameProps) {
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
        className="bg-white border border-blue-500 rounded px-1 py-0.5 outline-none text-sm font-medium text-gray-900"
        autoFocus
      />
    );
  }

  return (
    <span onDoubleClick={handleDoubleClick} className="cursor-pointer select-none">
      {value}
    </span>
  );
}

export default function Sidebar({ baseId, tables, selectedTable, onTableSelect, onChanged }: SidebarProps) {
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const utils = api.useContext();
  
  const createTable = api.base.createTable.useMutation({
    onSuccess: async (t) => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
      // After refetch, optimistic selection to the new table
      onTableSelect({ ...t, columns: t.columns.map((c) => ({ ...c, type: c.type as unknown as "TEXT" | "NUMBER", isRequired: false })), rows: [] });
    },
  });
  
  const renameTable = api.base.renameTable.useMutation({ 
    onSuccess: async () => { 
      await utils.base.getById.invalidate(baseId); 
      onChanged?.(); 
    } 
  });

  const deleteTable = api.base.deleteTable.useMutation({
    onSuccess: async () => {
      await utils.base.getById.invalidate(baseId);
      onChanged?.();
      // If the deleted table was selected, select the first available table
      if (tables.length > 1) {
        const remainingTables = tables.filter(t => t.id !== selectedTable.id);
        if (remainingTables.length > 0) {
          const nextTable = remainingTables[0];
          if (nextTable) {
            onTableSelect(nextTable);
          }
        }
      }
    },
  });

  const handleTableRename = async (newName: string) => {
    try {
      // Optimistically update the local state immediately
      onTableSelect({ ...selectedTable, name: newName });
      
      // Call the API to persist the change
      await renameTable.mutateAsync({ tableId: selectedTable.id, name: newName });
      
      // The refetch will happen automatically via onSuccess callback
    } catch (error) {
      console.error('Failed to rename table:', error);
      
      // If the API call fails, revert the optimistic update
      // Find the original table name from the tables array
      const originalTable = tables.find(t => t.id === selectedTable.id);
      if (originalTable) {
        onTableSelect({ ...selectedTable, name: originalTable.name });
      }
    }
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    if (confirm(`Are you sure you want to delete the table "${tableName}"? This action cannot be undone.`)) {
      await deleteTable.mutateAsync({ tableId });
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            <EditableTableName
              value={selectedTable.name}
              onSave={handleTableRename}
            />
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isTableDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <div className="py-1">
                {tables.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100">
                    <button
                      onClick={() => { onTableSelect(t); setIsTableDropdownOpen(false); }}
                      className={`flex-1 text-left text-sm ${t.id === selectedTable.id ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
                    >
                      {t.name}
                    </button>
                    {tables.length > 1 && (
                      <button
                        onClick={() => handleDeleteTable(t.id, t.name)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 ml-2"
                        title={`Delete ${t.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => createTable.mutate({ baseId })}
          className="flex items-center space-x-2 w-full mt-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add table</span>
        </button>
      </div>

      {/* View Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <Menu className="w-4 h-4" />
          </button>
          <div className="relative flex-1">
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4" />
                <span>Grid view</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isViewDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button className="w-full px-3 py-2 text-left text-sm text-blue-600 bg-blue-50">
                    Grid view
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
          <Plus className="w-4 h-4" />
          <span>Create new...</span>
        </button>
        
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Find a view"
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-3">
          <div className="px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md">
            Grid view
          </div>
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600">
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
