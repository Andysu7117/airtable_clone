"use client";

import { useState } from "react";
import { ChevronDown, Plus, Menu, Grid3X3, Search, Settings, HelpCircle, Bell, User } from "lucide-react";
import type { Table } from "./types";

interface SidebarProps {
  selectedTable: Table;
  onTableSelect: (table: Table) => void;
}

export default function Sidebar({ selectedTable, onTableSelect }: SidebarProps) {
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Top Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            <span>{selectedTable.name}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isTableDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                  {selectedTable.name}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button className="flex items-center space-x-2 w-full mt-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
          <Plus className="w-4 h-4" />
          <span>Add or import</span>
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
