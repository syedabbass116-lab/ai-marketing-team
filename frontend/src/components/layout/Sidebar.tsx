import { LayoutDashboard, Wand2, FolderOpen, Calendar, BarChart3, Settings, CreditCard, LogOut, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generate', label: 'Generate Content', icon: Wand2 },
  { id: 'library', label: 'Content Library', icon: FolderOpen },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'brand', label: 'Brand Settings', icon: Settings },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function Sidebar({ activeView, onViewChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile open button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-black border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-900 transition-colors md:hidden"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}

      {/* Overlay for mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`w-64 bg-black border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0 z-30 transform transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:z-10`}
      >
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold text-white">ContentOS</h1>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors md:hidden"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer mb-2">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900/50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
