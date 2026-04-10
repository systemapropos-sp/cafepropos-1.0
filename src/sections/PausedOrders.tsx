import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Pause, Search, Play, Trash2, Clock, User, Phone, MapPin,
  Table, ShoppingBag, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface PausedOrdersProps {
  pausedOrders: Order[];
  onResumeOrder: (orderId: string) => Order | null;
  onDeleteOrder: (orderId: string) => void;
  onViewChange: (view: string) => void;
}

export function PausedOrders({
  pausedOrders,
  onResumeOrder,
  onDeleteOrder,
  onViewChange,
}: PausedOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dine-in' | 'takeaway' | 'delivery'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredOrders = useMemo(() => {
    return pausedOrders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryInfo?.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryInfo?.phone.includes(searchTerm);
      
      const matchesType = filterType === 'all' || order.type === filterType;
      
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.pausedAt!).getTime() - new Date(a.pausedAt!).getTime());
  }, [pausedOrders, searchTerm, filterType]);

  const stats = useMemo(() => {
    return {
      total: pausedOrders.length,
      totalAmount: pausedOrders.reduce((sum, o) => sum + o.total, 0),
      dineIn: pausedOrders.filter(o => o.type === 'dine-in').length,
      takeaway: pausedOrders.filter(o => o.type === 'takeaway').length,
      delivery: pausedOrders.filter(o => o.type === 'delivery').length,
    };
  }, [pausedOrders]);

  const getOrderTypeBadge = (type: string) => {
    const styles = {
      'dine-in': 'bg-blue-100 text-blue-700',
      'takeaway': 'bg-orange-100 text-orange-700',
      'delivery': 'bg-purple-100 text-purple-700',
    };
    const labels = { 'dine-in': 'En Mesa', 'takeaway': 'Para Llevar', 'delivery': 'Delivery' };
    return (
      <Badge className={cn(styles[type as keyof typeof styles])}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const handleResume = (order: Order) => {
    const resumedOrder = onResumeOrder(order.id);
    if (resumedOrder) {
      toast.success('Orden reanudada en el POS');
      onViewChange('pos');
    }
  };

  const handleDelete = (orderId: string) => {
    if (confirm('¿Estás seguro de eliminar esta orden pausada?')) {
      onDeleteOrder(orderId);
      toast.success('Orden eliminada');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pause className="w-6 h-6" />
            Órdenes Pausadas
          </h1>
          <p className="text-gray-500 mt-1">Gestiona las ventas pausadas y reanúdalas cuando sea necesario</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pausadas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Pause className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Mesa</p>
                <p className="text-2xl font-bold">{stats.dineIn}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Table className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Para Llevar</p>
                <p className="text-2xl font-bold">{stats.takeaway}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivery</p>
                <p className="text-2xl font-bold">{stats.delivery}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente, mesa, teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Todas
          </Button>
          <Button
            variant={filterType === 'dine-in' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('dine-in')}
          >
            En Mesa
          </Button>
          <Button
            variant={filterType === 'takeaway' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('takeaway')}
          >
            Para Llevar
          </Button>
          <Button
            variant={filterType === 'delivery' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('delivery')}
          >
            Delivery
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Pause className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay órdenes pausadas</h3>
          <p className="text-gray-500">Las órdenes pausadas aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Orden #{order.id.slice(-6)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getOrderTypeBadge(order.type)}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(order.pausedAt!)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                </div>

                {/* Customer/Table Info */}
                <div className="space-y-2 mb-4">
                  {order.type === 'dine-in' && order.tableName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Table className="w-4 h-4 text-gray-400" />
                      <span>{order.tableName}</span>
                    </div>
                  )}
                  
                  {order.customerName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{order.customerName}</span>
                    </div>
                  )}

                  {order.deliveryInfo && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{order.deliveryInfo.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.deliveryInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{order.deliveryInfo.address}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Items Summary */}
                <div className="border-t pt-3 mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} - 
                    Subtotal: ${order.subtotal.toFixed(2)}
                  </p>
                  <div className="text-xs text-gray-400 truncate">
                    {order.items.map(i => i.productName).join(', ')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                  >
                    Ver Detalles
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleResume(order)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Reanudar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(order.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de Orden #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {getOrderTypeBadge(selectedOrder.type)}
                <span className="text-sm text-gray-500">
                  Pausada: {new Date(selectedOrder.pausedAt!).toLocaleString()}
                </span>
              </div>

              {selectedOrder.deliveryInfo && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Información de Delivery</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Nombre:</span> {selectedOrder.deliveryInfo.customerName}</p>
                    <p><span className="text-gray-500">Teléfono:</span> {selectedOrder.deliveryInfo.phone}</p>
                    <p><span className="text-gray-500">Dirección:</span> {selectedOrder.deliveryInfo.address}</p>
                    {selectedOrder.deliveryInfo.reference && (
                      <p><span className="text-gray-500">Referencia:</span> {selectedOrder.deliveryInfo.reference}</p>
                    )}
                    {selectedOrder.deliveryInfo.deliveryInstructions && (
                      <p><span className="text-gray-500">Instrucciones:</span> {selectedOrder.deliveryInfo.deliveryInstructions}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.tableName && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Información de Mesa</h4>
                  <p className="text-sm">{selectedOrder.tableName}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-medium">{item.quantity}x {item.productName}</p>
                          {item.size && <p className="text-xs text-gray-500">{item.size.name}</p>}
                          {item.extras.length > 0 && (
                            <p className="text-xs text-gray-500">
                              + {item.extras.map(e => e.name).join(', ')}
                            </p>
                          )}
                          {item.notes && <p className="text-xs text-orange-500">{item.notes}</p>}
                        </div>
                      </div>
                      <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Impuestos</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Descuento</span>
                      <span className="text-green-600">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.tip > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Propina</span>
                      <span>${selectedOrder.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Notas:</span> {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Cerrar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleResume(selectedOrder);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Reanudar Orden
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
