"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "~/trpc/react";

interface RenameBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  base: {
    id: string;
    name: string;
  } | null;
}

export default function RenameBaseModal({ isOpen, onClose, onSuccess, base }: RenameBaseModalProps) {
  const [baseName, setBaseName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const renameBase = api.base.rename.useMutation({
    onSuccess: () => {
      setBaseName("");
      setIsRenaming(false);
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error renaming base:", error);
      setIsRenaming(false);
    },
  });

  // Update base name when base changes
  useEffect(() => {
    if (base) {
      setBaseName(base.name);
    }
  }, [base]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!base || !baseName.trim() || isRenaming) return;

    setIsRenaming(true);
    renameBase.mutate({ id: base.id, name: baseName.trim() });
  };

  if (!isOpen || !base) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Rename base</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="baseName" className="block text-sm font-medium text-gray-700">
              Base name
            </label>
            <input
              type="text"
              id="baseName"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Enter base name"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!baseName.trim() || isRenaming}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
