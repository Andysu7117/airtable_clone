"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { api } from "~/trpc/react";

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    tables: Array<{
      id: string;
      name: string;
      columns: Array<{
        id: string;
        name: string;
        type: string;
        order: number;
      }>;
    }>;
  };
  onDelete: () => void;
}

export default function BaseCard({ base, onDelete }: BaseCardProps) {
  const deleteBase = api.base.delete.useMutation({
    onSuccess: () => {
      onDelete();
    },
    onError: (error) => {
      console.error("Error deleting base:", error);
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${base.name}"? This action cannot be undone.`)) {
      deleteBase.mutate(base.id);
    }
  };

  const getRandomColor = (id: string) => {
    const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-red-500", "bg-indigo-500"];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <Link href={`/base/${base.id}`}>
      <div className="rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200 p-6 border border-gray-200 cursor-pointer group hover:border-gray-300 relative">
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete base"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className={`w-12 h-12 ${getRandomColor(base.id)} rounded-lg mb-4 flex items-center justify-center`}>
          <span className="text-white text-lg font-semibold">
            {base.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
          {base.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-2">
          {base.tables.length} table{base.tables.length === 1 ? '' : 's'}
        </p>
        
        <p className="text-sm text-gray-500">
          Updated {formatDate(base.updatedAt)}
        </p>
      </div>
    </Link>
  );
}