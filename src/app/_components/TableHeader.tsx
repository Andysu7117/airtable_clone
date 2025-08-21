import { useState } from "react";
import { Plus } from "lucide-react";
import type { Base, Table } from "./types";

interface TableHeaderProps {
  base: Base;
  selectedTable: Table;
  onTableRename?: (tableId: string, newName: string) => void;
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
        className="text-2xl font-semibold text-gray-900 bg-white border border-blue-500 rounded px-2 py-1 outline-none"
        autoFocus
      />
    );
  }

  return (
    <h1 
      onDoubleClick={handleDoubleClick}
      className="text-2xl font-semibold text-gray-900 cursor-pointer select-none"
    >
      {value}
    </h1>
  );
}

export default function TableHeader({ base, selectedTable, onTableRename }: TableHeaderProps) {
  return (
    <div className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <EditableTableName
            value={selectedTable.name}
            onSave={async (newName) => {
              if (onTableRename) {
                await onTableRename(selectedTable.id, newName);
              }
            }}
          />
          <p className="text-sm text-gray-600 mt-1">
            Manage your data with powerful tools and views
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Import
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 inline mr-2" />
            Add record
          </button>
        </div>
      </div>
    </div>
  );
}
