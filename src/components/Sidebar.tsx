import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  ShoppingCart,
  Coffee,
  Users,
  Package,
  ClipboardList,
  Truck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  Shield,
  Pause,
  Clock,
} from 'lucide-react';
import type { User as UserType, View } from '@/types';

interface SidebarProps {
  user: UserType;
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: View;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Venta (POS)', icon: ShoppingCart },
  { id: 'paused-orders', label: 'Pausadas', icon: Pause },
  { id: 'products', label: 'Productos', icon: Coffee },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'purchases', label: 'Compras', icon: ShoppingCart },
  { id: 'activity', label: 'Actividad', icon: ClipboardList },
  { id: 'suppliers', label: 'Proveedores', icon: Truck },
  { id: 'timeclock', label: 'Mi Horario', icon: Clock },
  { id: 'admin', label: 'Admin/Empleados', icon: Shield, adminOnly: true },
  { id: 'settings', label: 'Configuración', icon: Settings, adminOnly: true },
];

export function Sidebar({
  user,
  currentView,
  onViewChange,
  onLogout,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const visibleMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user.role === 'admin'
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-gray-900">CafePOS</span>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 absolute -right-4 top-5 bg-white border border-gray-200 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              const button = (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    'w-full justify-start gap-3 h-11',
                    isActive && 'bg-amber-500 hover:bg-amber-600 text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors',
              collapsed && 'justify-center'
            )}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {!collapsed && showUserMenu && (
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full mt-2 justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          )}

          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar Sesión</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
