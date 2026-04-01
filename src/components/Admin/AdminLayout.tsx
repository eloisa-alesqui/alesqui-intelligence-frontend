import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Layers, Users, UserCog, FileText, Menu, X } from 'lucide-react';

interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const menuItems = [
    { to: '/admin/groups', label: 'Groups', icon: Layers },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText }
  ];

  const sidebarContent = (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header styled similarly to AssistantCapabilities */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <UserCog className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Administration</h4>
            <p className="text-sm text-gray-600">Manage platform entities</p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <nav className="space-y-1">
          {menuItems.map(mi => {
            const Icon = mi.icon;
            return (
              <NavLink
                key={mi.to}
                to={mi.to}
                onClick={closeSidebar}
                className={({ isActive }) => `group relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${isActive ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                end
              >
                {({ isActive }: { isActive: boolean }) => (
                  <div className="flex items-center gap-2 w-full">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <span className="truncate">{mi.label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-8">
      <div className="h-full flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-56 lg:w-72 flex-shrink-0 h-full flex-col">
          {sidebarContent}
        </aside>

        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />
        )}

        {/* Mobile drawer */}
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-end p-3">
            <button onClick={closeSidebar} className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close admin menu">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col h-[calc(100%-56px)] px-3 pb-3">
            {sidebarContent}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="md:hidden mb-4">
            <button
              ref={hamburgerRef}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 bg-white shadow-sm"
              aria-label="Open admin menu"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Menu</span>
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
