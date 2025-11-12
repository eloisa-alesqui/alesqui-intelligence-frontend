import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Layers, Users, Settings, Shield } from 'lucide-react';

interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const menuItems = [
    { to: '/admin/groups', label: 'Groups', icon: Layers },
    { to: '/admin/users', label: 'Users', icon: Users }
  ];

  return (
    <div className="h-full w-full p-4 sm:p-6 lg:p-8">
      <div className="h-full flex gap-6">
        {/* Left: Admin Navigation (Styled like Assistant Capabilities header) */}
        <aside className="w-72 flex-shrink-0 h-full flex flex-col">
          <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full shadow-sm">
            {/* Header styled similarly to AssistantCapabilities */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Administration</h4>
                  <p className="text-sm text-gray-600">Manage platform entities</p>
                </div>
              </div>
            </div>

            {/* Navigation list */}
            <div className="flex-1 overflow-y-auto p-3">
              <nav className="space-y-1">
                {menuItems.map(mi => {
                  const Icon = mi.icon;
                  return (
                    <NavLink
                      key={mi.to}
                      to={mi.to}
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

            {/* Footer small print */}
            <div className="p-3 border-t bg-white text-[11px] text-gray-400 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Admin Panel
            </div>
          </div>
        </aside>

        {/* Center: Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
