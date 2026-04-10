import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Coffee,
  ShoppingBag,
  User,
  Table2,
  Package,
  DollarSign,
  Clock,
  Save,
  RotateCcw,
  MapPin,
  Phone,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Product, Table, Customer, Order, OrderItem, OrderItemExtra, ProductSize, AppConfig, DeliveryInfo } from '@/types';

interface POSProps {
  products: Product[];
  tables: Table[];
  customers: Customer[];
  config: AppConfig;
  pausedOrders: Order[];
  onCreateOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  onPauseOrder: (order: Order) => void;
  onResumeOrder: (orderId: string) => Order | null;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export function POS({ products, tables, customers, config, pausedOrders, onCreateOrder, onPauseOrder, onResumeOrder, onUpdateOrderStatus }: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [tip, setTip] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');
  
  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPausedModal, setShowPausedModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Delivery info
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    customerName: '',
    phone: '',
    address: '',
    reference: '',
    deliveryInstructions: '',
  });

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.isActive;
    });
  }, [products, searchTerm, selectedCategory]);

  // Categorías
  const categories = [
    { id: 'all', name: 'Todos', icon: Coffee },
    { id: 'coffee', name: 'Cafés', icon: Coffee },
    { id: 'cold-drinks', name: 'Fríos', icon: Package },
    { id: 'pastry', name: 'Pasteles', icon: ShoppingBag },
    { id: 'sandwich', name: 'Sándwiches', icon: ShoppingBag },
    { id: 'breakfast', name: 'Desayunos', icon: Coffee },
    { id: 'dessert', name: 'Postres', icon: ShoppingBag },
  ];

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * (config.taxRate / 100);
  const discountAmount = discount;
  const total = subtotal + tax + tip - discountAmount;

  // Agregar producto al carrito
  const handleAddToCart = (product: Product, size?: ProductSize, extras: OrderItemExtra[] = [], notes?: string) => {
    const unitPrice = size?.price || product.price;
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    const totalPrice = (unitPrice + extrasTotal);

    const newItem: OrderItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      size,
      extras,
      quantity: 1,
      unitPrice,
      totalPrice,
      notes,
    };

    setCart(prev => [...prev, newItem]);
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Actualizar cantidad
  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity + item.extras.reduce((sum, e) => sum + e.price, 0) * newQuantity,
        };
      }
      return item;
    }));
  };

  // Eliminar item
  const removeItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Crear orden y procesar pago
  const handleCreateOrder = (paymentMethod: string) => {
    const orderData = {
      type: orderType,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      tip,
      total,
      paymentMethod: paymentMethod as any,
      notes: orderNotes,
      updatedAt: new Date().toISOString(),
      createdBy: '1',
      createdByName: 'Usuario',
      isPaused: false,
      deliveryInfo: orderType === 'delivery' ? deliveryInfo : undefined,
    };

    const newOrder = onCreateOrder(orderData);
    
    // Marcar la orden como pagada inmediatamente
    if (newOrder && onUpdateOrderStatus) {
      onUpdateOrderStatus(newOrder.id, 'paid');
    }
    
    // Mostrar mensaje de éxito
    toast.success(`Pago procesado: $${total.toFixed(2)}`);
    
    // Limpiar carrito
    setCart([]);
    setSelectedTable(null);
    setSelectedCustomer(null);
    setTip(0);
    setDiscount(0);
    setOrderNotes('');
    setDeliveryInfo({ customerName: '', phone: '', address: '', reference: '', deliveryInstructions: '' });
    setShowPaymentModal(false);
  };

  // Pausar orden
  const handlePauseOrder = () => {
    // Si es delivery, validar que tenga info
    if (orderType === 'delivery' && (!deliveryInfo.customerName || !deliveryInfo.phone || !deliveryInfo.address)) {
      setShowDeliveryModal(true);
      return;
    }

    // Validar que haya items en el carrito
    if (cart.length === 0) {
      toast.error('No hay productos para pausar');
      return;
    }

    const pausedOrderData: Order = {
      id: Date.now().toString(),
      type: orderType,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      tip,
      total,
      status: 'pending',
      notes: orderNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1',
      createdByName: 'Usuario',
      isPaused: true,
      pausedAt: new Date().toISOString(),
      deliveryInfo: orderType === 'delivery' ? deliveryInfo : undefined,
    };

    // Usar onPauseOrder para agregar a órdenes pausadas
    onPauseOrder(pausedOrderData);
    
    toast.success('Orden pausada correctamente');
    
    // Limpiar carrito
    setCart([]);
    setSelectedTable(null);
    setSelectedCustomer(null);
    setTip(0);
    setDiscount(0);
    setOrderNotes('');
    setDeliveryInfo({ customerName: '', phone: '', address: '', reference: '', deliveryInstructions: '' });
  };

  // Resumir orden pausada
  const handleResumeOrder = (order: Order) => {
    const resumedOrder = onResumeOrder(order.id);
    if (resumedOrder) {
      setCart(resumedOrder.items);
      setOrderType(resumedOrder.type);
      setSelectedTable(tables.find(t => t.id === resumedOrder.tableId) || null);
      setSelectedCustomer(customers.find(c => c.id === resumedOrder.customerId) || null);
      setTip(resumedOrder.tip);
      setDiscount(resumedOrder.discount);
      setOrderNotes(resumedOrder.notes || '');
      if (resumedOrder.deliveryInfo) {
        setDeliveryInfo(resumedOrder.deliveryInfo);
      }
      setShowPausedModal(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex gap-4 p-4">
      {/* Panel izquierdo - Productos */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          {/* Tipo de orden */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'dine-in', label: 'En mesa', icon: Table2 },
              { id: 'takeaway', label: 'Para llevar', icon: Package },
              { id: 'delivery', label: 'Delivery', icon: ShoppingBag },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setOrderType(id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                  orderType === id
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Selección de mesa/cliente/delivery */}
          <div className="flex gap-2 mb-4">
            {orderType === 'dine-in' && (
              <button
                onClick={() => setShowTableModal(true)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all flex-1",
                  selectedTable
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Table2 className="w-4 h-4" />
                {selectedTable ? selectedTable.name : 'Seleccionar mesa'}
              </button>
            )}
            {orderType === 'delivery' && (
              <button
                onClick={() => setShowDeliveryModal(true)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all flex-1",
                  deliveryInfo.customerName
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <MapPin className="w-4 h-4" />
                {deliveryInfo.customerName ? 'Delivery: ' + deliveryInfo.customerName.slice(0, 15) + '...' : 'Info de Delivery'}
              </button>
            )}
            <button
              onClick={() => setShowCustomerModal(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all flex-1",
                selectedCustomer
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <User className="w-4 h-4" />
              {selectedCustomer ? selectedCustomer.name : 'Cliente'}
            </button>
            {pausedOrders.length > 0 && (
              <button
                onClick={() => setShowPausedModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
              >
                <Clock className="w-4 h-4" />
                {pausedOrders.length} pausada(s)
              </button>
            )}
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                  selectedCategory === id
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Icon className="w-4 h-4" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setShowProductModal(true);
                }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all text-left group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Coffee className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{product.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Carrito */}
      <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        {/* Header del carrito */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Orden Actual
          </h2>
          {selectedTable && (
            <p className="text-sm text-gray-500 mt-1">{selectedTable.name} • {selectedTable.capacity} personas</p>
          )}
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4" />
              <p>El carrito está vacío</p>
              <p className="text-sm">Agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      {item.size && (
                        <p className="text-sm text-gray-500">{item.size.name}</p>
                      )}
                      {item.extras.length > 0 && (
                        <p className="text-sm text-gray-500">
                          + {item.extras.map(e => e.name).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-amber-600 mt-1">{item.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Impuesto ({config.taxRate}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          {config.enableTips && tip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Propina</span>
              <span>${tip.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-amber-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {config.enableTips && (
            <div className="flex gap-2 mb-2">
              {[0, 1, 2, 5].map(amount => (
                <button
                  key={amount}
                  onClick={() => setTip(amount)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    tip === amount
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {amount === 0 ? 'Sin propina' : `$${amount}`}
                </button>
              ))}
            </div>
          )}
          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePauseOrder}
              disabled={cart.length === 0}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              Pausar
            </button>
            <button
              type="button"
              onClick={() => {
                if (cart.length > 0) {
                  setShowPaymentModal(true);
                }
              }}
              disabled={cart.length === 0}
              className="flex-[2] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <DollarSign className="w-6 h-6 mr-2" />
              <span className="text-lg">PAGAR</span>
              <span className="ml-2 text-xl">${total.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Producto */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductOptionsModal
              product={selectedProduct}
              onAdd={handleAddToCart}
              onCancel={() => setShowProductModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Mesas */}
      <Dialog open={showTableModal} onOpenChange={setShowTableModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Seleccionar Mesa</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  setShowTableModal(false);
                }}
                disabled={table.status === 'occupied' && table.id !== selectedTable?.id}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  selectedTable?.id === table.id
                    ? "border-amber-500 bg-amber-50"
                    : table.status === 'occupied'
                    ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-amber-300"
                )}
              >
                <Table2 className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">{table.name}</p>
                <p className="text-sm text-gray-500">{table.capacity} pers.</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Clientes */}
      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setShowCustomerModal(false);
              }}
              className={cn(
                "w-full p-3 rounded-xl border-2 text-left transition-all",
                !selectedCustomer
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300"
              )}
            >
              <p className="font-medium">Cliente general</p>
            </button>
            {customers.filter(c => c.isActive).map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerModal(false);
                }}
                className={cn(
                  "w-full p-3 rounded-xl border-2 text-left transition-all",
                  selectedCustomer?.id === customer.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-amber-300"
                )}
              >
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.points} puntos</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Pago - Overlay Simple */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPaymentModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesar Pago</h2>
              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                <p className="text-gray-500 text-sm">Total a pagar</p>
                <p className="text-5xl font-bold text-green-600">${total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  handleCreateOrder('cash');
                  setShowPaymentModal(false);
                }}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all bg-white text-center"
              >
                <span className="text-3xl mb-2 block">💵</span>
                <span className="font-semibold text-gray-900">Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateOrder('card');
                  setShowPaymentModal(false);
                }}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all bg-white text-center"
              >
                <span className="text-3xl mb-2 block">💳</span>
                <span className="font-semibold text-gray-900">Tarjeta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateOrder('transfer');
                  setShowPaymentModal(false);
                }}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all bg-white text-center"
              >
                <span className="text-3xl mb-2 block">🏦</span>
                <span className="font-semibold text-gray-900">Transferencia</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateOrder('wallet');
                  setShowPaymentModal(false);
                }}
                className="p-5 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all bg-white text-center"
              >
                <span className="text-3xl mb-2 block">📱</span>
                <span className="font-semibold text-gray-900">Billetera</span>
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Órdenes Pausadas */}
      <Dialog open={showPausedModal} onOpenChange={setShowPausedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Órdenes Pausadas</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {pausedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.tableName || order.deliveryInfo?.customerName || 'Para llevar'}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} items • ${order.total.toFixed(2)}
                    </p>
                    {order.deliveryInfo && (
                      <p className="text-xs text-purple-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Delivery
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleResumeOrder(order)}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Resumir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Delivery */}
      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Información de Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Cliente *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={deliveryInfo.customerName}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, customerName: e.target.value })}
                  placeholder="Nombre completo"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                  placeholder="555-0000"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Dirección *</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                  placeholder="Calle, número, colonia"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Referencia</Label>
              <Input
                value={deliveryInfo.reference}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, reference: e.target.value })}
                placeholder="Casa de color, cerca de..."
              />
            </div>
            <div>
              <Label>Instrucciones de Entrega</Label>
              <Input
                value={deliveryInfo.deliveryInstructions}
                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryInstructions: e.target.value })}
                placeholder="Tocar timbre, dejar en recepción..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeliveryModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                onClick={() => setShowDeliveryModal(false)}
                disabled={!deliveryInfo.customerName || !deliveryInfo.phone || !deliveryInfo.address}
              >
                Guardar Info
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para opciones de producto
interface ProductOptionsModalProps {
  product: Product;
  onAdd: (product: Product, size?: ProductSize, extras?: OrderItemExtra[], notes?: string) => void;
  onCancel: () => void;
}

function ProductOptionsModal({ product, onAdd, onCancel }: ProductOptionsModalProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    product.sizes?.[0]
  );
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([]);
  const [notes, setNotes] = useState('');

  const toggleExtra = (extra: OrderItemExtra) => {
    setSelectedExtras(prev =>
      prev.find(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const calculateTotal = () => {
    const sizePrice = selectedSize?.price || product.price;
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    return sizePrice + extrasTotal;
  };

  return (
    <div className="space-y-4">
      {/* Tamaños */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <Label className="mb-2 block">Tamaño</Label>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all",
                  selectedSize?.id === size.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-amber-300"
                )}
              >
                <p className="font-medium">{size.name}</p>
                <p className="text-sm">${size.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extras */}
      {product.extras && product.extras.length > 0 && (
        <div>
          <Label className="mb-2 block">Extras</Label>
          <div className="flex gap-2 flex-wrap">
            {product.extras.map((extra) => (
              <button
                key={extra.id}
                onClick={() => toggleExtra(extra)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all",
                  selectedExtras.find(e => e.id === extra.id)
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-amber-300"
                )}
              >
                <p className="font-medium">{extra.name}</p>
                <p className="text-sm">+${extra.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notas */}
      <div>
        <Label className="mb-2 block">Notas especiales</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Sin azúcar, templado..."
        />
      </div>

      {/* Total y botones */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-amber-600">${calculateTotal().toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => onAdd(product, selectedSize, selectedExtras, notes)}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
