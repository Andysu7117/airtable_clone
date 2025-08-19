import { Plus } from "lucide-react";
import type { Base } from "./types";

interface TableHeaderProps {
  base: Base;
}

export default function TableHeader({ base }: TableHeaderProps) {
  return (
    <div className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{base.name}</h1>
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
