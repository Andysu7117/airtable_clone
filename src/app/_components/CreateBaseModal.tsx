"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "~/trpc/react";

interface CreateBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBaseModal({ isOpen, onClose, onSuccess }: CreateBaseModalProps) {
  const [baseName, setBaseName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createBase = api.base.create.useMutation({
    onSuccess: () => {
      setBaseName("");
      setIsCreating(false);
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating base:", error);
      setIsCreating(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseName.trim() || isCreating) return;

    setIsCreating(true);
    createBase.mutate({ name: baseName.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Create a new base</h2>
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
              disabled={!baseName.trim() || isCreating}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create base"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
