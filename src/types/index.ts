// Tipos para CafePOS - Sistema de Punto de Venta para Cafetería

// ==================== NAVEGACIÓN ====================
export type View = 
  | 'dashboard' 
  | 'pos' 
  | 'products' 
  | 'customers' 
  | 'inventory' 
  | 'activity' 
  | 'suppliers' 
  | 'settings'
  | 'admin'
  | 'paused-orders'
  | 'timeclock'
  | 'purchases';

// ==================== USUARIOS ====================
export interface User {
  id: string;
  name: string;
  pin: string; // PIN numérico de 4 dígitos
  role: 'admin' | 'cashier' | 'waiter';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
  email?: string;
  salary?: number;
  hireDate?: string;
}

// ==================== EMPLEADOS / ADMIN ====================
export interface Employee {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'cashier' | 'waiter';
  avatar?: string;
  phone?: string;
  email?: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  createdAt: string;
  loans: EmployeeLoan[];
  payments: EmployeePayment[];
  timeEntries: TimeEntry[]; // Registro de entrada/salida
}

export interface TimeEntry {
  id: string;
  date: string;
  punchIn: string; // HH:mm
  punchOut?: string; // HH:mm
  notes?: string;
  totalHours?: number; // Calculado
}

export interface EmployeeLoan {
  id: string;
  amount: number;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
}

export interface EmployeePayment {
  id: string;
  amount: number;
  date: string;
  type: 'salary' | 'bonus' | 'overtime' | 'loan_deduction' | 'other';
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
  createdBy: string;
}

// ==================== PRODUCTOS ====================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number; // Costo para calcular ganancia
  category: ProductCategory;
  image?: string;
  stock: number;
  minStock: number; // Stock mínimo para alertas
  sizes?: ProductSize[]; // Tamaños disponibles (pequeño, mediano, grande)
  extras?: ProductExtra[]; // Extras disponibles
  isActive: boolean;
  preparationTime?: number; // Tiempo en minutos
  tags?: string[]; // vegano, sin-azucar, etc.
}

export interface ProductSize {
  id: string;
  name: string;
  price: number;
}

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
}

export type ProductCategory = 
  | 'coffee' 
  | 'cold-drinks' 
  | 'pastry' 
  | 'sandwich' 
  | 'breakfast' 
  | 'dessert' 
  | 'snack';

// ==================== CLIENTES ====================
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
  address?: string;
  points: number; // Puntos de fidelidad
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// ==================== MESAS ====================
export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: Order;
  zone: 'interior' | 'exterior' | 'terraza' | 'bar';
}

// ==================== PEDIDOS ====================
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface DeliveryInfo {
  customerName: string;
  phone: string;
  address: string;
  reference?: string;
  deliveryInstructions?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // ID del usuario
  createdByName: string;
  isPaused: boolean; // Para pausar la venta
  pausedAt?: string;
  deliveryInfo?: DeliveryInfo; // Info para delivery
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  size?: ProductSize;
  extras: OrderItemExtra[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string; // Notas especiales (sin azúcar, etc.)
}

export interface OrderItemExtra {
  id: string;
  name: string;
  price: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'preparing' 
  | 'ready' 
  | 'served' 
  | 'paid' 
  | 'cancelled';

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'transfer' 
  | 'wallet' 
  | 'points';

// ==================== INVENTARIO ====================
export interface InventoryItem {
  id: string;
  name: string;
  unit: string; // kg, g, L, ml, unidad, etc.
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  supplierId?: string;
  category: InventoryCategory;
  lastRestocked?: string;
  isActive: boolean;
}

export type InventoryCategory = 
  | 'coffee' 
  | 'milk' 
  | 'syrup' 
  | 'pastry' 
  | 'packaging' 
  | 'cleaning' 
  | 'other';

// ==================== PROVEEDORES ====================
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
  image?: string; // URL de la imagen del proveedor/logo
  products: string[]; // IDs de productos que suministra
  isActive: boolean;
  createdAt: string;
}

// ==================== ACTIVIDAD/TRANSACCIONES ====================
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  userId?: string;
  orderId?: string;
  amount?: number;
  createdAt: string;
}

export type ActivityType = 
  | 'sale' 
  | 'refund' 
  | 'inventory-in' 
  | 'inventory-out' 
  | 'product_created' 
  | 'product_updated' 
  | 'product_deleted'
  | 'customer_created'
  | 'customer_updated'
  | 'customer_deleted'
  | 'supplier_created'
  | 'supplier_updated'
  | 'supplier_deleted'
  | 'stock_adjusted'
  | 'order_created'
  | 'order_updated'
  | 'order_paused'
  | 'order_resumed'
  | 'settings_changed'
  | 'login' 
  | 'logout'
  | 'employee_created'
  | 'employee_updated'
  | 'employee_deleted'
  | 'loan_created'
  | 'loan_paid'
  | 'payment_created'
  | 'purchase_created'
  | 'purchase_updated'
  | 'purchase_deleted';

// ==================== CONFIGURACIÓN ====================
export interface AppConfig {
  businessName: string;
  businessLogo?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string; // RNC/Tax ID
  taxRate: number; // Porcentaje de impuesto
  currency: string;
  receiptFooter?: string;
  receiptHeader?: string;
  enableTips: boolean;
  enableLoyalty: boolean;
  loyalty: {
    pointsPerDollar: number;
    minPointsRedeem: number;
    pointValue: number;
  };
  theme: 'light' | 'dark' | 'auto';
  // Nuevos campos
  receiptSettings: {
    showLogo: boolean;
    showTaxId: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
    printTwoCopies: boolean;
  };
  businessHours: {
    open: string;
    close: string;
    workDays: string[];
  };
}

// ==================== ESTADÍSTICAS ====================
export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayAverageTicket: number;
  weekSales: number;
  monthSales: number;
  topProducts: TopProduct[];
  salesByHour: SalesByHour[];
  lowStockProducts: Product[];
  activeTables: number;
  pausedOrders: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
}

export interface SalesByHour {
  hour: number;
  sales: number;
  orders: number;
}

// ==================== COMPRAS ====================
export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'received' | 'cancelled';
  notes?: string;
  image?: string; // Imagen de la factura/recibo
  createdBy: string;
  createdAt: string;
  receivedAt?: string;
}

export interface PurchaseItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

// ==================== DESCUENTOS/PROMOCIONES ====================
export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// ==================== CATEGORÍAS ====================
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}
