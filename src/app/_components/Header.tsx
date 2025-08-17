import Link from "next/link";
import { Home, HelpCircle, Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      {/* Left: Logo / Home */}
      <div className="flex items-center space-x-2">
        <Home className="w-6 h-6 text-gray-700" />
        <span className="font-semibold text-lg text-gray-800">Airtable Clone</span>
      </div>

      {/* Right: Navigation */}
      <nav className="flex items-center space-x-6">
        <Link href="/home">
          <Home className="w-6 h-6 text-gray-700 hover:text-gray-900" />
        </Link>
        <Link href="/help">
          <HelpCircle className="w-6 h-6 text-gray-700 hover:text-gray-900" />
        </Link>
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-700 hover:text-gray-900" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>
        <button>
          <User className="w-6 h-6 text-gray-700 hover:text-gray-900" />
        </button>
      </nav>
    </header>
  );
};

export default Header;