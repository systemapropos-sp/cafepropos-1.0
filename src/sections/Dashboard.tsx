import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  PauseCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { Order, Product, Activity } from '@/types';

interface DashboardProps {
  todaySales: number;
  todayOrders: number;
  activeOrders: number;
  lowStockItems: number;
  pausedOrders: number;
  orders: Order[];
  products: Product[];
  activities: Activity[];
}

export function Dashboard({ 
  todaySales, 
  todayOrders, 
  activeOrders, 
  lowStockItems,
  pausedOrders,
  orders, 
  products, 
  activities 
}: DashboardProps) {
  // Ventas de ayer para comparación
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yesterdayOrders = orders.filter(o => o.createdAt.startsWith(yesterday) && o.status === 'paid');
  const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
  const salesChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
  
  // Ventas de la semana
  const weekStart = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const weekOrdersList = orders.filter(o => o.createdAt >= weekStart && o.status === 'paid');
  const weekSales = weekOrdersList.reduce((sum, o) => sum + o.total, 0);
  
  // Productos con stock bajo
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  // Ticket promedio
  const averageTicket = todayOrders > 0 ? todaySales / todayOrders : 0;
  
  // Datos para gráfico de ventas por hora
  const today = new Date().toISOString().split('T')[0];
  const todayPaidOrders = orders.filter(o => o.createdAt.startsWith(today) && o.status === 'paid');
  
  const salesByHour = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // De 8am a 8pm
    const hourOrders = todayPaidOrders.filter(o => {
      const orderHour = new Date(o.createdAt).getHours();
      return orderHour === hour;
    });
    return {
      hour: `${hour}:00`,
      ventas: hourOrders.reduce((sum, o) => sum + o.total, 0),
      ordenes: hourOrders.length,
    };
  });
  
  // Top productos del día
  const productSales: Record<string, { name: string; quantity: number; total: number }> = {};
  todayPaidOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.productName,
          quantity: 0,
          total: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].total += item.totalPrice;
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  // Ventas por categoría
  const salesByCategory: Record<string, number> = {};
  todayPaidOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const categoryNames: Record<string, string> = {
          'coffee': 'Cafés',
          'cold-drinks': 'Bebidas Frías',
          'pastry': 'Pasteles',
          'sandwich': 'Sándwiches',
          'breakfast': 'Desayunos',
          'dessert': 'Postres',
          'snack': 'Snacks',
        };
        const categoryName = categoryNames[product.category] || product.category;
        salesByCategory[categoryName] = (salesByCategory[categoryName] || 0) + item.totalPrice;
      }
    });
  });
  
  const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({
    name,
    value,
  }));
  
  const COLORS = ['#8B4513', '#4A90D9', '#E891A3', '#F5A623', '#FFD700', '#7ED321', '#9013FE'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen de hoy - {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">${todaySales.toFixed(2)}</p>
              <div className={`flex items-center gap-1 text-sm ${salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(salesChange).toFixed(1)}% vs ayer</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Órdenes Hoy */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Órdenes Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{todayOrders}</p>
              <p className="text-sm text-gray-400">Ticket promedio: ${averageTicket.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Órdenes Activas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Órdenes Activas</p>
              <p className="text-2xl font-bold text-gray-900">{activeOrders}</p>
              <p className="text-sm text-gray-400">{pausedOrders} pausadas</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              <p className="text-sm text-gray-400">productos</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por Hora */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Hora</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="ventas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por Categoría */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {categoryData.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-1 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Productos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Productos Hoy</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay ventas hoy</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} vendidos</p>
                  </div>
                  <p className="font-semibold text-gray-900">${product.total.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="flex items-center gap-3 text-green-600">
                <Package className="w-5 h-5" />
                <p>Todo el inventario está bien</p>
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center gap-3 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm">Stock: {product.stock} / Mín: {product.minStock}</p>
                  </div>
                </div>
              ))
            )}
            {pausedOrders > 0 && (
              <div className="flex items-center gap-3 text-blue-600">
                <PauseCircle className="w-5 h-5" />
                <p>{pausedOrders} orden(es) pausada(s)</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Sin actividad reciente</p>
            ) : (
              activities.slice(0, 8).map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'sale' ? 'bg-green-500' :
                    activity.type === 'login' ? 'bg-blue-500' :
                    activity.type.includes('product') ? 'bg-purple-500' :
                    activity.type.includes('order') ? 'bg-amber-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {activity.amount && (
                    <p className="text-sm font-medium text-green-600">+${activity.amount.toFixed(2)}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ventas de la Semana */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-amber-100">Ventas de la Semana</p>
              <p className="text-3xl font-bold">${weekSales.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-100">Órdenes esta semana</p>
            <p className="text-2xl font-bold">{weekOrdersList.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
