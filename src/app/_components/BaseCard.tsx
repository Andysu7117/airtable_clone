"use client";

import Link from "next/link";

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    color: string;
    lastOpened?: string;
  };
}

export default function BaseCard({ base }: BaseCardProps) {
  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "purple":
        return "bg-purple-500";
      case "orange":
        return "bg-orange-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Link href={`/base/${base.id}`}>
      <div className="rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200 p-6 border border-gray-200 cursor-pointer group hover:border-gray-300">
        <div className={`w-12 h-12 ${getColorClass(base.color)} rounded-lg mb-4 flex items-center justify-center`}>
          <span className="text-white text-lg font-semibold">
            {base.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
          {base.name}
        </h3>
        {base.lastOpened && (
          <p className="text-sm text-gray-500">
            Opened {base.lastOpened}
          </p>
        )}
      </div>
    </Link>
  );
}