import {
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  Wand2,
  ChevronDown,
  Users as TeamIcon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useState } from "react";

import logo from "../../assets/logo.png";
import chefDoodle from "../../ChefDoodle.png";

type SidebarProps = {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "generate", label: "Generate Content", icon: Wand2 },
  { id: "library", label: "Content Library", icon: FolderOpen },
  { id: "brand", label: "Brand Settings", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "profile", label: "Brand Profiles", icon: User },
  { id: "team", label: "Team Management", icon: TeamIcon },
];


export default function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const handleLogout = async () => {
    console.log('Logout clicked, setting isLoggingOut to true');
    setIsLoggingOut(true);
    
    // Force a re-render to ensure the overlay shows
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Wait for 2 seconds with the loading animation
    setTimeout(async () => {
      console.log('Calling signOut after 2 seconds');
      try {
        await signOut();
      } catch (error) {
        console.error('Error during signOut:', error);
      }
    }, 2000);
  };

  const asideClass = [
    "w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30 md:z-10",
    "bg-[rgba(10,10,10,0.8)] border-r border-white/10 backdrop-blur-xl touch-pan-y",
    "transform transition-transform duration-200 ease-out",
    isOpen ? "translate-x-0" : "-translate-x-full",
  ].join(" ");

  return (
    <>
      {/* Logging out overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl font-medium">Logging out...</p>
            <p className="text-white/60 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      )}

      {/* Hamburger toggle when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed top-5 left-5 z-40 p-2.5 rounded-xl
            bg-white/5 border border-white/10 text-white/50 backdrop-blur-xl
            hover:text-white hover:bg-white/10 hover:border-white/20 
            shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 group"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={asideClass}>
        {/* Logo row */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center p-1.5 bg-white/5 rounded-lg border border-white/10">
              <img
                src={logo}
                alt="Ghostwrites logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-[16px] font-bold text-white tracking-tight"
            >
              Ghostwrites
            </span>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-2 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all duration-200 group"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 py-4 border-b border-white/5">
          <div className="relative">
            <button 
              onClick={() => setWsOpen(!wsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-blue-400">
                    {activeWorkspace?.name?.charAt(0) || "W"}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white/80 truncate">
                  {activeWorkspace?.name || "Select Workspace"}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${wsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {wsOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 py-1">
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      activeWorkspace?.id === ws.id ? 'text-white bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Nav items */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-0.5 overflow-y-auto pb-8 scrollbar-bw">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  active
                    ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    : "text-white/40 hover:text-white hover:bg-white/5 font-medium",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / logout footer */}
        <div className="sticky bottom-0 px-3 py-4 border-t border-white/10 space-y-1 bg-[rgba(10,10,10,0.95)]">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 overflow-hidden flex-shrink-0">
                <img
                  src={user.user_metadata?.avatar_url || chefDoodle}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/80 truncate">
                  {user.user_metadata?.full_name ??
                    user.email?.split("@")[0] ??
                    "User"}
                </p>
                <p className="text-[10px] text-white/30 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm text-white/30 hover:text-white hover:bg-white/5
              transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
