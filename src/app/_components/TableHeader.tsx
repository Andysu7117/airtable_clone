"use client";

import { ChevronDown, Eye, Filter, Group, SortAsc, Palette, Share, Search } from "lucide-react";
import type { Base } from "./types";

interface TableHeaderProps {
  base: Base;
}

export default function TableHeader({ base }: TableHeaderProps) {
  return (
    <>
      {/* Top Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{base.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            <span className="mr-1">↻</span>
          </button>
          <span className="text-sm text-gray-600">Trial: 14 days left</span>
          <button className="text-sm text-blue-600 hover:text-blue-700">See what&apos;s new</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Share</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          <button className="py-3 px-1 border-b-2 border-green-500 text-green-600 font-medium">
            Data
          </button>
          <button className="py-3 px-1 text-gray-500 hover:text-gray-700">
            Automations
          </button>
          <button className="py-3 px-1 text-gray-500 hover:text-gray-700">
            Interfaces
          </button>
          <button className="py-3 px-1 text-gray-500 hover:text-gray-700">
            Forms
          </button>
        </div>
      </div>

      {/* Table Controls */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Eye className="w-4 h-4 mr-1" />
              Hide fields
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Group className="w-4 h-4 mr-1" />
              Group
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <SortAsc className="w-4 h-4 mr-1" />
              Sort
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Palette className="w-4 h-4 mr-1" />
              Color
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Share className="w-4 h-4 mr-1" />
              Share and sync
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Search className="w-4 h-4 mr-1" />
              Q
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              Tools
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
