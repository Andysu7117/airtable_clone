"use client";

export default function NewBaseCard() {
  return (
    <div className="rounded-xl shadow-md bg-gray-100 hover:bg-gray-200 transition p-6 border-dashed border-2 flex items-center justify-center cursor-pointer">
      <span className="text-gray-500 font-medium">+ Add a new base</span>
    </div>
  );
}