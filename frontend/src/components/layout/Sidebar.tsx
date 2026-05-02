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
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from "../../../Logo.png";

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
  { id: "profile", label: "Profile", icon: User },
];

export default function Sidebar({
  activeView,
  onViewChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const asideClass = [
    "w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30 md:z-10",
    "bg-[rgba(10,10,10,0.8)] border-r border-white/10 backdrop-blur-xl touch-pan-y",
    "transform transition-transform duration-200 ease-out",
    isOpen ? "translate-x-0" : "-translate-x-full",
  ].join(" ");

  return (
    <>
      {/* Hamburger toggle when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg
            bg-black border border-[#2a2a2a] text-white/40
            hover:text-white hover:border-[#444] transition-all duration-150"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={asideClass}>
        {/* Logo row */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <img
                src={logo}
                alt="Ghostwrites logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-[15px] font-bold text-white tracking-tight"
            >
              Ghostwrites
            </span>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
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
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs font-bold text-white/60">
                    {user.firstName?.[0] ?? "U"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/80 truncate">
                  {user.fullName ?? user.username ?? "User"}
                </p>
                <p className="text-[10px] text-white/30 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm text-white/30 hover:text-white hover:bg-white/5
              transition-all duration-150 font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
