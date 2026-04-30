import { Bell, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface TopBarProps {
  sidebarOpen: boolean;
}

export default function TopBar({ sidebarOpen }: TopBarProps) {
  return (
    <header
      className={`h-14 bg-black border-b border-white/10 fixed top-0 right-0 z-10
        flex items-center justify-end px-4 md:px-6
        transition-all duration-200 ${sidebarOpen ? 'md:left-64 left-0' : 'left-0'}`}
    >
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative p-2 text-white/30 hover:text-white
            hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full" />
        </button>

        {/* Upgrade CTA */}
        <Button variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Upgrade
        </Button>
      </div>
    </header>
  );
}
