import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  ShoppingCart,
  Coffee,
  Users,
  Package,
  ClipboardList,
  X,
  Calculator,
  Printer,
  BarChart3,
} from 'lucide-react';
import type { View } from '@/types';

interface FloatingActionsProps {
  onViewChange: (view: View) => void;
  onQuickAction?: (action: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  view?: View;
  action?: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { id: 'new-sale', label: 'Nueva Venta', icon: ShoppingCart, view: 'pos', color: 'bg-amber-500' },
  { id: 'new-product', label: 'Nuevo Producto', icon: Coffee, view: 'products', color: 'bg-blue-500' },
  { id: 'new-customer', label: 'Nuevo Cliente', icon: Users, view: 'customers', color: 'bg-green-500' },
  { id: 'inventory-check', label: 'Revisar Inventario', icon: Package, view: 'inventory', color: 'bg-purple-500' },
  { id: 'activity-log', label: 'Ver Actividad', icon: ClipboardList, view: 'activity', color: 'bg-orange-500' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, view: 'dashboard', color: 'bg-pink-500' },
  { id: 'calculator', label: 'Calculadora', icon: Calculator, action: 'calculator', color: 'bg-gray-600' },
  { id: 'print-last', label: 'Reimprimir Último', icon: Printer, action: 'print-last', color: 'bg-teal-500' },
];

export function FloatingActions({ onViewChange, onQuickAction }: FloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: QuickAction) => {
    if (action.view) {
      onViewChange(action.view);
    }
    if (action.action && onQuickAction) {
      onQuickAction(action.action);
    }
    setIsOpen(false);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Quick Actions Menu */}
        <div
          className={cn(
            'flex flex-col items-end gap-2 transition-all duration-300',
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-10 pointer-events-none'
          )}
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-3"
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                <span
                  className={cn(
                    'bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap transition-all duration-200',
                    isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  )}
                >
                  {action.label}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAction(action)}
                      className={cn(
                        'w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110',
                        action.color
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{action.label}</TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300',
            isOpen
              ? 'bg-red-500 hover:bg-red-600 rotate-45'
              : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Keyboard Shortcut Hint */}
        {!isOpen && (
          <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
            Pressione <kbd className="bg-gray-700 px-1 rounded">/</kbd> para atalhos
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
