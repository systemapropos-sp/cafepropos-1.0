import { useState, useMemo } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Package,
  ShoppingBag,
  Clock,
  Calendar,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  RotateCcw,
  Settings,
  Coffee,
  Users,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Activity, Order } from '@/types';

interface ActivityProps {
  activities: Activity[];
  orders: Order[];
}

type ActivityTypeFilter = 'all' | Activity['type'];

export function Activity({ activities, orders }: ActivityProps) {
  const [filter, setFilter] = useState<ActivityTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7');

  // Build activity list from all sources
  const allActivities = useMemo(() => {
    const all: Activity[] = [...activities];

    // Add orders as sales activities
    orders.filter(o => o.status === 'paid').forEach(order => {
      all.push({
        id: `order-${order.id}`,
        type: 'sale',
        description: `${order.tableName || 'Para llevar'} - $${order.total.toFixed(2)}`,
        amount: order.total,
        userId: order.createdBy,
        orderId: order.id,
        createdAt: order.createdAt,
      });
    });

    // Add paused orders
    orders.filter(o => o.isPaused).forEach(order => {
      all.push({
        id: `paused-${order.id}`,
        type: 'order_paused',
        description: `${order.tableName || 'Para llevar'} - $${order.total.toFixed(2)}`,
        userId: order.createdBy,
        orderId: order.id,
        createdAt: order.pausedAt || order.createdAt,
      });
    });

    // Sort by timestamp (newest first)
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, orders]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

    return allActivities.filter(a => {
      const matchesType = filter === 'all' || a.type === filter;
      const matchesSearch = a.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = new Date(a.createdAt) >= cutoffDate;
      return matchesType && matchesSearch && matchesDate;
    });
  }, [allActivities, filter, searchTerm, dateRange]);

  // Stats
  const stats = useMemo(() => {
    const sales = filteredActivities.filter(a => a.type === 'sale');
    const refunds = filteredActivities.filter(a => a.type === 'refund');
    const totalSales = sales.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalRefunds = refunds.reduce((sum, a) => sum + (a.amount || 0), 0);
    
    return {
      total: filteredActivities.length,
      sales: sales.length,
      refunds: refunds.length,
      net: totalSales - totalRefunds,
    };
  }, [filteredActivities]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'sale': return <ShoppingBag className="w-5 h-5 text-green-600" />;
      case 'refund': return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'inventory-in': return <Package className="w-5 h-5 text-blue-600" />;
      case 'inventory-out': return <Package className="w-5 h-5 text-orange-600" />;
      case 'product_created':
      case 'product_updated':
      case 'product_deleted': return <Coffee className="w-5 h-5 text-purple-600" />;
      case 'customer_created':
      case 'customer_updated':
      case 'customer_deleted': return <Users className="w-5 h-5 text-pink-600" />;
      case 'supplier_created':
      case 'supplier_updated':
      case 'supplier_deleted': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'stock_adjusted': return <RotateCcw className="w-5 h-5 text-amber-600" />;
      case 'order_created': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'order_updated': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'order_paused': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'order_resumed': return <RotateCcw className="w-5 h-5 text-teal-600" />;
      case 'settings_changed': return <Settings className="w-5 h-5 text-gray-600" />;
      case 'login': return <LogIn className="w-5 h-5 text-blue-600" />;
      case 'logout': return <LogOut className="w-5 h-5 text-gray-600" />;
      default: return <History className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'sale': return 'bg-green-50 border-green-200';
      case 'refund': return 'bg-red-50 border-red-200';
      case 'inventory-in': return 'bg-blue-50 border-blue-200';
      case 'inventory-out': return 'bg-orange-50 border-orange-200';
      case 'product_created':
      case 'product_updated':
      case 'product_deleted': return 'bg-purple-50 border-purple-200';
      case 'customer_created':
      case 'customer_updated':
      case 'customer_deleted': return 'bg-pink-50 border-pink-200';
      case 'supplier_created':
      case 'supplier_updated':
      case 'supplier_deleted': return 'bg-indigo-50 border-indigo-200';
      case 'stock_adjusted': return 'bg-amber-50 border-amber-200';
      case 'order_created': return 'bg-green-50 border-green-200';
      case 'order_updated': return 'bg-blue-50 border-blue-200';
      case 'order_paused': return 'bg-orange-50 border-orange-200';
      case 'order_resumed': return 'bg-teal-50 border-teal-200';
      case 'settings_changed': return 'bg-gray-50 border-gray-200';
      case 'login': return 'bg-blue-50 border-blue-200';
      case 'logout': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividad</h1>
          <p className="text-gray-500">Registro de todas las operaciones del sistema</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Registros</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ventas</p>
              <p className="text-xl font-bold text-gray-900">{stats.sales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Devoluciones</p>
              <p className="text-xl font-bold text-gray-900">{stats.refunds}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Neto</p>
              <p className="text-xl font-bold text-gray-900">${stats.net.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Input
            placeholder="Buscar actividad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as ActivityTypeFilter)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="sale">Ventas</SelectItem>
            <SelectItem value="refund">Devoluciones</SelectItem>
            <SelectItem value="order_created">Órdenes Creadas</SelectItem>
            <SelectItem value="order_paused">Órdenes Pausadas</SelectItem>
            <SelectItem value="product_created">Productos Creados</SelectItem>
            <SelectItem value="customer_created">Clientes Creados</SelectItem>
            <SelectItem value="stock_adjusted">Ajustes de Stock</SelectItem>
            <SelectItem value="login">Inicios de Sesión</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Hoy</SelectItem>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 3 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay actividad para mostrar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${getActivityColor(activity.type)}`}
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {activity.amount !== undefined && activity.amount > 0 && (
                    <div className={`text-right ${activity.type === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                      <p className="font-semibold">
                        {activity.type === 'refund' ? '-' : '+'}${activity.amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
