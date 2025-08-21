import Link from "next/link";
import { ChevronDown, Rocket } from "lucide-react";

interface HeaderProps {
  baseName?: string;
}

const Header = ({ baseName = "Untitled Base" }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* Left: Logo and Base Name */}
      <div className="flex items-center space-x-4">
        <Link href="/home" className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{baseName}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <div className="flex items-center space-x-8">
        <button className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Data
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Automations
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Interfaces
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Forms
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
          <Rocket className="w-4 h-4" />
          <span>Launch</span>
        </button>
        
        <span className="text-sm text-gray-500">Trial: 14 days left</span>
        
        <button className="text-sm text-blue-600 hover:text-blue-700">
          See what&apos;s new
        </button>
        
        <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
          Share
        </button>
      </div>
    </header>
  );
};

export default Header;