import { useState, useEffect, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
import type {
  User,
  Product,
  Customer,
  Table,
  Order,
  InventoryItem,
  Supplier,
  Activity,
  AppConfig,
  View,
  OrderStatus,
  Employee,
  EmployeeLoan,
  EmployeePayment,
  Purchase,
} from '@/types';

// Mock Data
import {
  mockUsers,
  mockProducts,
  mockTables,
  mockCustomers,
  mockInventory,
  mockSuppliers,
  mockOrders,
  mockActivities,
  mockAppConfig as mockConfig,
  mockEmployees,
  mockPurchases,
} from '@/data/mockData';

// Sections
import { Login } from '@/sections/Login';
import { Dashboard } from '@/sections/Dashboard';
import { POS } from '@/sections/POS';
import { Products } from '@/sections/Products';
import { Customers } from '@/sections/Customers';
import { Inventory } from '@/sections/Inventory';
import { Suppliers } from '@/sections/Suppliers';
import { Activity as ActivitySection } from '@/sections/Activity';
import { Settings } from '@/sections/Settings';
import { Admin } from '@/sections/Admin';
import { PausedOrders } from '@/sections/PausedOrders';
import { TimeClock } from '@/sections/TimeClock';
import { Purchases } from '@/sections/Purchases';

// Components
import { Sidebar } from '@/components/Sidebar';
import { FloatingActions } from '@/components/FloatingActions';

function App() {
  // ========== STATE ==========
  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Navigation
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data
  const [users] = useState<User[]>(mockUsers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [config, setConfig] = useState<AppConfig>(mockConfig);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);

  // POS State
  const [pausedOrders, setPausedOrders] = useState<Order[]>([]);

  // ========== COMPUTED ==========
  const todayOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter((o) => o.createdAt.startsWith(today));
  }, [orders]);

  const todaySales = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + o.total, 0);
  }, [todayOrders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'pending' || o.status === 'preparing'
    );
  }, [orders]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minQuantity);
  }, [inventory]);

  // ========== HANDLERS ==========
  // Auth
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    addActivity('login', `Usuario ${user.name} inició sesión`, user.id);
    toast.success(`Bienvenido, ${user.name}!`);
  }, []);

  const handleLogout = useCallback(() => {
    if (currentUser) {
      addActivity('logout', `Usuario ${currentUser.name} cerró sesión`, currentUser.id);
    }
    setCurrentUser(null);
    setCurrentView('dashboard');
    toast.info('Sesión cerrada');
  }, [currentUser]);

  // Activity
  const addActivity = useCallback(
    (
      type: Activity['type'],
      description: string,
      userId?: string,
      orderId?: string,
      amount?: number
    ) => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        type,
        description,
        userId: userId || currentUser?.id,
        orderId,
        amount,
        createdAt: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev]);
    },
    [currentUser]
  );

  // Products
  const handleAddProduct = useCallback(
    (product: Omit<Product, 'id'>) => {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };
      setProducts((prev) => [...prev, newProduct]);
      addActivity('product_created', `Producto creado: ${newProduct.name}`);
      toast.success('Producto creado exitosamente');
    },
    [addActivity]
  );

  const handleUpdateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      addActivity('product_updated', `Producto actualizado: ${updates.name || id}`);
      toast.success('Producto actualizado');
    },
    [addActivity]
  );

  const handleDeleteProduct = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addActivity('product_deleted', `Producto eliminado: ${product?.name || id}`);
      toast.success('Producto eliminado');
    },
    [products, addActivity]
  );

  // Customers
  const handleAddCustomer = useCallback(
    (customer: Omit<Customer, 'id' | 'createdAt'>) => {
      const newCustomer: Customer = {
        ...customer,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [...prev, newCustomer]);
      addActivity('customer_created', `Cliente creado: ${newCustomer.name}`);
      toast.success('Cliente creado exitosamente');
    },
    [addActivity]
  );

  const handleUpdateCustomer = useCallback(
    (id: string, updates: Partial<Customer>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      addActivity('customer_updated', `Cliente actualizado: ${updates.name || id}`);
      toast.success('Cliente actualizado');
    },
    [addActivity]
  );

  const handleDeleteCustomer = useCallback(
    (id: string) => {
      const customer = customers.find((c) => c.id === id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addActivity('customer_deleted', `Cliente eliminado: ${customer?.name || id}`);
      toast.success('Cliente eliminado');
    },
    [customers, addActivity]
  );

  // Inventory
  const handleAdjustStock = useCallback(
    (id: string, quantity: number, reason: string) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + quantity) }
            : item
        )
      );
      const item = inventory.find((i) => i.id === id);
      addActivity(
        'stock_adjusted',
        `Stock ajustado: ${item?.name} (${quantity > 0 ? '+' : ''}${quantity}) - ${reason}`
      );
      toast.success('Stock ajustado');
    },
    [inventory, addActivity]
  );

  // Suppliers
  const handleAddSupplier = useCallback(
    (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
      const newSupplier: Supplier = {
        ...supplier,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setSuppliers((prev) => [...prev, newSupplier]);
      addActivity('supplier_created', `Proveedor creado: ${newSupplier.name}`);
      toast.success('Proveedor creado exitosamente');
    },
    [addActivity]
  );

  const handleUpdateSupplier = useCallback(
    (id: string, updates: Partial<Supplier>) => {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      addActivity('supplier_updated', `Proveedor actualizado: ${updates.name || id}`);
      toast.success('Proveedor actualizado');
    },
    [addActivity]
  );

  const handleDeleteSupplier = useCallback(
    (id: string) => {
      const supplier = suppliers.find((s) => s.id === id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      addActivity('supplier_deleted', `Proveedor eliminado: ${supplier?.name || id}`);
      toast.success('Proveedor eliminado');
    },
    [suppliers, addActivity]
  );

  // Employees
  const handleAddEmployee = useCallback(
    (employee: Omit<Employee, 'id' | 'createdAt' | 'loans' | 'payments' | 'timeEntries'>) => {
      const newEmployee: Employee = {
        ...employee,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        loans: [],
        payments: [],
        timeEntries: [],
      };
      setEmployees((prev) => [...prev, newEmployee]);
      addActivity('employee_created', `Empleado creado: ${newEmployee.name}`);
      toast.success('Empleado creado exitosamente');
    },
    [addActivity]
  );

  const handleUpdateEmployee = useCallback(
    (id: string, updates: Partial<Employee>) => {
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
      addActivity('employee_updated', `Empleado actualizado: ${updates.name || id}`);
      toast.success('Empleado actualizado');
    },
    [addActivity]
  );

  const handleDeleteEmployee = useCallback(
    (id: string) => {
      const employee = employees.find((e) => e.id === id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      addActivity('employee_deleted', `Empleado eliminado: ${employee?.name || id}`);
      toast.success('Empleado eliminado');
    },
    [employees, addActivity]
  );

  const handleAddLoan = useCallback(
    (employeeId: string, loan: Omit<EmployeeLoan, 'id' | 'paidAmount' | 'remainingAmount'>) => {
      const newLoan: EmployeeLoan = {
        ...loan,
        id: Date.now().toString(),
        paidAmount: 0,
        remainingAmount: loan.amount,
      };
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId ? { ...e, loans: [...e.loans, newLoan] } : e
        )
      );
      addActivity('loan_created', `Préstamo registrado: $${loan.amount}`);
      toast.success('Préstamo registrado');
    },
    [addActivity]
  );

  const handleAddPayment = useCallback(
    (employeeId: string, payment: Omit<EmployeePayment, 'id'>) => {
      const newPayment: EmployeePayment = {
        ...payment,
        id: Date.now().toString(),
      };
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId ? { ...e, payments: [...e.payments, newPayment] } : e
        )
      );
      addActivity('payment_created', `Pago registrado: $${payment.amount}`);
      toast.success('Pago registrado');
    },
    [addActivity]
  );

  const handlePayLoan = useCallback(
    (employeeId: string, loanId: string, amount: number) => {
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === employeeId) {
            return {
              ...e,
              loans: e.loans.map((l) =>
                l.id === loanId
                  ? {
                      ...l,
                      paidAmount: l.paidAmount + amount,
                      remainingAmount: Math.max(0, l.remainingAmount - amount),
                      status: l.remainingAmount - amount <= 0 ? 'paid' : l.status,
                    }
                  : l
              ),
            };
          }
          return e;
        })
      );
      addActivity('loan_paid', `Pago de préstamo: $${amount}`);
      toast.success('Pago registrado');
    },
    [addActivity]
  );

  // Time Tracking - Punch In/Out
  const handlePunchIn = useCallback(
    (employeeId: string) => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === employeeId) {
            // Verificar si ya hay una entrada activa
            const hasActiveEntry = e.timeEntries?.some(entry => entry.punchIn && !entry.punchOut);
            if (hasActiveEntry) {
              toast.error('El empleado ya tiene una entrada activa');
              return e;
            }
            
            const newEntry = {
              id: Date.now().toString(),
              date: today,
              punchIn: timeString,
            };
            return {
              ...e,
              timeEntries: [...(e.timeEntries || []), newEntry],
            };
          }
          return e;
        })
      );
      addActivity('employee_updated', `Entrada registrada para empleado`);
    },
    [addActivity]
  );

  const handlePunchOut = useCallback(
    (employeeId: string, entryId: string) => {
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === employeeId) {
            return {
              ...e,
              timeEntries: e.timeEntries?.map((entry) => {
                if (entry.id === entryId && !entry.punchOut) {
                  // Calcular horas totales
                  const [inHours, inMinutes] = entry.punchIn.split(':').map(Number);
                  const [outHours, outMinutes] = timeString.split(':').map(Number);
                  const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
                  const totalHours = totalMinutes / 60;
                  
                  return {
                    ...entry,
                    punchOut: timeString,
                    totalHours: Math.round(totalHours * 100) / 100,
                  };
                }
                return entry;
              }) || [],
            };
          }
          return e;
        })
      );
      addActivity('employee_updated', `Salida registrada para empleado`);
    },
    [addActivity]
  );

  // Purchases
  const handleAddPurchase = useCallback(
    (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
      const newPurchase: Purchase = {
        ...purchase,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setPurchases((prev) => [newPurchase, ...prev]);
      addActivity('purchase_created', `Compra creada: ${purchase.invoiceNumber}`);
      toast.success('Compra registrada exitosamente');
    },
    [addActivity]
  );

  const handleUpdatePurchase = useCallback(
    (id: string, updates: Partial<Purchase>) => {
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      addActivity('purchase_updated', `Compra actualizada: #${id.slice(-4)}`);
      toast.success('Compra actualizada');
    },
    [addActivity]
  );

  const handleDeletePurchase = useCallback(
    (id: string) => {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
      addActivity('purchase_deleted', `Compra eliminada: #${id.slice(-4)}`);
      toast.success('Compra eliminada');
    },
    [addActivity]
  );

  // Paused Orders
  const handleDeletePausedOrder = useCallback(
    (orderId: string) => {
      setPausedOrders((prev) => prev.filter((o) => o.id !== orderId));
      addActivity('order_updated', `Orden pausada eliminada: #${orderId.slice(-4)}`);
      toast.success('Orden eliminada');
    },
    [addActivity]
  );

  // Orders
  const handleCreateOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);

      // Update table status if dine-in
      if (orderData.tableId) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === orderData.tableId ? { ...t, status: 'occupied' } : t
          )
        );
      }

      // Update customer stats
      if (orderData.customerId) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === orderData.customerId
              ? {
                  ...c,
                  totalVisits: c.totalVisits + 1,
                  totalSpent: c.totalSpent + orderData.total,
                  points:
                    c.points +
                    Math.floor(orderData.total * config.loyalty.pointsPerDollar),
                }
              : c
          )
        );
      }

      addActivity(
        'order_created',
        `Orden creada #${newOrder.id.slice(-4)} - $${newOrder.total.toFixed(2)}`,
        undefined,
        newOrder.id,
        newOrder.total
      );
      toast.success('Orden creada exitosamente');
      return newOrder;
    },
    [config.loyalty.pointsPerDollar, addActivity]
  );

  const handleUpdateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      const order = orders.find((o) => o.id === orderId);

      // Free table if order completed or cancelled
      if ((status === 'paid' || status === 'cancelled') && order?.tableId) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === order.tableId ? { ...t, status: 'available' } : t
          )
        );
      }

      addActivity(
        'order_updated',
        `Orden #${orderId.slice(-4)} cambió a ${status}`,
        undefined,
        orderId
      );
      toast.success(`Orden ${status}`);
    },
    [orders, addActivity]
  );
  
  // Use the handler to avoid unused variable warning
  void handleUpdateOrderStatus;

  const handlePauseOrder = useCallback(
    (order: Order) => {
      setPausedOrders((prev) => [...prev, order]);
      addActivity(
        'order_paused',
        `Orden pausada #${order.id.slice(-4)}`,
        undefined,
        order.id
      );
      toast.success('Orden pausada');
    },
    [addActivity]
  );

  const handleResumeOrder = useCallback(
    (orderId: string) => {
      const order = pausedOrders.find((o) => o.id === orderId);
      if (order) {
        setPausedOrders((prev) => prev.filter((o) => o.id !== orderId));
        return order;
      }
      return null;
    },
    [pausedOrders]
  );

  // Config
  const handleUpdateConfig = useCallback(
    (updates: Partial<AppConfig>) => {
      setConfig((prev) => ({ ...prev, ...updates }));
      addActivity('settings_changed', 'Configuración actualizada');
      toast.success('Configuración guardada');
    },
    [addActivity]
  );

  // Quick Actions
  const handleQuickAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'calculator':
          toast.info('Calculadora abierta');
          break;
        case 'print-last':
          if (orders.length > 0) {
            toast.success(`Reimprimiendo orden #${orders[0].id.slice(-4)}`);
          } else {
            toast.error('No hay órdenes para reimprimir');
          }
          break;
        default:
          break;
      }
    },
    [orders]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          // Toggle floating actions
          break;
        case 'Escape':
          // Close modals or go back
          break;
        case 'F1':
          e.preventDefault();
          setCurrentView('pos');
          break;
        case 'F2':
          e.preventDefault();
          setCurrentView('dashboard');
          break;
        case 'F3':
          e.preventDefault();
          setCurrentView('products');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ========== RENDER ==========
  if (!currentUser) {
    return (
      <>
        <Login users={users} onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <Sidebar
        user={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {currentView === 'dashboard' && (
          <Dashboard
            todaySales={todaySales}
            todayOrders={todayOrders.length}
            activeOrders={activeOrders.length}
            lowStockItems={lowStockItems.length}
            orders={orders}
            products={products}
            activities={activities.slice(0, 10)}
            pausedOrders={pausedOrders.length}
          />
        )}

        {currentView === 'pos' && (
          <POS
            products={products}
            tables={tables}
            customers={customers}
            config={config}
            pausedOrders={pausedOrders}
            onCreateOrder={handleCreateOrder}
            onPauseOrder={handlePauseOrder}
            onResumeOrder={handleResumeOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {currentView === 'products' && (
          <Products
            products={products}
            inventory={inventory}
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {currentView === 'customers' && (
          <Customers
            customers={customers}
            onAdd={handleAddCustomer}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
          />
        )}

        {currentView === 'inventory' && (
          <Inventory
            inventory={inventory}
            products={products}
            suppliers={suppliers}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {currentView === 'suppliers' && (
          <Suppliers
            suppliers={suppliers}
            onAdd={handleAddSupplier}
            onUpdate={handleUpdateSupplier}
            onDelete={handleDeleteSupplier}
          />
        )}

        {currentView === 'activity' && (
          <ActivitySection
            activities={activities}
            orders={orders}
          />
        )}

        {currentView === 'settings' && currentUser.role === 'admin' && (
          <Settings config={config} onUpdate={handleUpdateConfig} />
        )}

        {currentView === 'admin' && currentUser.role === 'admin' && (
          <Admin
            employees={employees}
            currentUser={employees.find(e => e.id === currentUser.id) || employees[0]}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onAddLoan={handleAddLoan}
            onAddPayment={handleAddPayment}
            onPayLoan={handlePayLoan}
          />
        )}

        {currentView === 'paused-orders' && (
          <PausedOrders
            pausedOrders={pausedOrders}
            onResumeOrder={handleResumeOrder}
            onDeleteOrder={handleDeletePausedOrder}
            onViewChange={(view) => setCurrentView(view as View)}
          />
        )}

        {currentView === 'timeclock' && (
          <TimeClock
            currentEmployee={employees.find(e => e.id === currentUser.id) || employees[0]}
            onPunchIn={() => handlePunchIn(currentUser.id)}
            onPunchOut={() => {
              const emp = employees.find(e => e.id === currentUser.id);
              const activeEntry = emp?.timeEntries?.find(e => e.punchIn && !e.punchOut);
              if (activeEntry) {
                handlePunchOut(currentUser.id, activeEntry.id);
              }
            }}
          />
        )}

        {currentView === 'purchases' && (
          <Purchases
            purchases={purchases}
            suppliers={suppliers}
            onAdd={handleAddPurchase}
            onUpdate={handleUpdatePurchase}
            onDelete={handleDeletePurchase}
          />
        )}
      </main>

      {/* Floating Actions */}
      <FloatingActions onViewChange={setCurrentView} onQuickAction={handleQuickAction} />
    </div>
  );
}

export default App;
