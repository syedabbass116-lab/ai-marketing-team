import { Bell, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface TopBarProps {
  sidebarOpen: boolean;
}

export default function TopBar({ sidebarOpen }: TopBarProps) {
  return (
    <header
      className={`h-16 bg-black border-b border-gray-800 fixed top-0 right-0 z-10 flex items-center justify-end px-4 md:px-6 transition-all ${
        sidebarOpen ? "md:left-64 left-0" : "left-0"
      }`}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
          Upgrade Plan
        </Button>
      </div>
    </header>
  );
}
