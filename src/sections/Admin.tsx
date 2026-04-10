import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Users, UserPlus, Search,
  Edit2, Trash2, Plus,
  TrendingDown,
  Wallet, BadgeCheck, ChevronDown, ChevronUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Employee, EmployeeLoan, EmployeePayment } from '@/types';

interface AdminProps {
  employees: Employee[];
  currentUser: Employee;
  onAddEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'loans' | 'payments' | 'timeEntries'>) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
  onAddLoan: (employeeId: string, loan: Omit<EmployeeLoan, 'id' | 'paidAmount' | 'remainingAmount'>) => void;
  onAddPayment: (employeeId: string, payment: Omit<EmployeePayment, 'id'>) => void;
  onPayLoan: (employeeId: string, loanId: string, amount: number) => void;
}

export function Admin({
  employees,
  currentUser,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddLoan,
  onAddPayment,
  onPayLoan,
}: AdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPayLoanModal, setShowPayLoanModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  // Form states
  const [employeeForm, setEmployeeForm] = useState<{
    name: string;
    pin: string;
    role: 'admin' | 'cashier' | 'waiter';
    phone: string;
    email: string;
    salary: number;
    hireDate: string;
    avatar: string;
  }>({
    name: '',
    pin: '',
    role: 'waiter',
    phone: '',
    email: '',
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0],
    avatar: '',
  });

  const [loanForm, setLoanForm] = useState({
    amount: 0,
    reason: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    type: 'salary' as const,
    periodStart: '',
    periodEnd: '',
    notes: '',
  });

  const [payLoanAmount, setPayLoanAmount] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<EmployeeLoan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone?.includes(searchTerm)
    );
  }, [employees, searchTerm]);

  const totalLoans = useMemo(() => {
    return employees.reduce((sum, e) =>
      sum + e.loans.filter(l => l.status === 'approved' && l.remainingAmount > 0)
        .reduce((s, l) => s + l.remainingAmount, 0), 0
    );
  }, [employees]);

  const totalMonthlySalaries = useMemo(() => {
    return employees.filter(e => e.isActive).reduce((sum, e) => sum + e.salary, 0);
  }, [employees]);

  const handleSaveEmployee = () => {
    if (!employeeForm.name || !employeeForm.pin) {
      toast.error('Nombre y PIN son requeridos');
      return;
    }

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, employeeForm);
      setEditingEmployee(null);
    } else {
      onAddEmployee({
        ...employeeForm,
        isActive: true,
      });
    }
    setShowEmployeeModal(false);
    resetEmployeeForm();
  };

  const handleAddLoan = () => {
    if (!selectedEmployee || !loanForm.amount || !loanForm.reason) {
      toast.error('Monto y motivo son requeridos');
      return;
    }

    onAddLoan(selectedEmployee.id, {
      ...loanForm,
      date: new Date().toISOString(),
      status: 'pending',
    });
    setShowLoanModal(false);
    setLoanForm({ amount: 0, reason: '', notes: '' });
    setSelectedEmployee(null);
  };

  const handleAddPayment = () => {
    if (!selectedEmployee || !paymentForm.amount) {
      toast.error('Monto es requerido');
      return;
    }

    onAddPayment(selectedEmployee.id, {
      ...paymentForm,
      date: new Date().toISOString(),
      createdBy: currentUser.id,
    });
    setShowPaymentModal(false);
    setPaymentForm({ amount: 0, type: 'salary', periodStart: '', periodEnd: '', notes: '' });
    setSelectedEmployee(null);
  };

  const handlePayLoan = () => {
    if (!selectedEmployee || !selectedLoan || !payLoanAmount) {
      toast.error('Monto es requerido');
      return;
    }

    onPayLoan(selectedEmployee.id, selectedLoan.id, payLoanAmount);
    setShowPayLoanModal(false);
    setPayLoanAmount(0);
    setSelectedLoan(null);
    setSelectedEmployee(null);
  };

  const confirmDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      onDeleteEmployee(employeeToDelete.id);
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
    }
  };

  // Helper functions for time tracking display
  const isEmployeeClockedIn = (employee: Employee) => {
    return employee.timeEntries?.some(e => e.punchIn && !e.punchOut) || false;
  };

  const getTodayHours = (employee: Employee) => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = employee.timeEntries?.find(e => e.date === today);
    return todayEntry?.totalHours || 0;
  };

  const getWeekHours = (employee: Employee) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return employee.timeEntries?.reduce((total, entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= weekAgo && entry.totalHours) {
        return total + entry.totalHours;
      }
      return total;
    }, 0) || 0;
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      name: '',
      pin: '',
      role: 'waiter',
      phone: '',
      email: '',
      salary: 0,
      hireDate: new Date().toISOString().split('T')[0],
      avatar: '',
    });
  };

  const openEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      pin: employee.pin,
      role: employee.role,
      phone: employee.phone || '',
      email: employee.email || '',
      salary: employee.salary,
      hireDate: employee.hireDate,
      avatar: employee.avatar || '',
    });
    setShowEmployeeModal(true);
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      cashier: 'bg-blue-100 text-blue-700',
      waiter: 'bg-green-100 text-green-700',
    };
    const labels = { admin: 'Admin', cashier: 'Cajero', waiter: 'Mesero' };
    return (
      <Badge className={cn(styles[role as keyof typeof styles])}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getLoanStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      paid: 'bg-gray-100 text-gray-700',
    };
    const labels = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', paid: 'Pagado' };
    return (
      <Badge className={cn(styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Administración de Empleados
          </h1>
          <p className="text-gray-500 mt-1">Gestiona empleados, préstamos y pagos</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); resetEmployeeForm(); setShowEmployeeModal(true); }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Empleados</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.isActive).length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BadgeCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Préstamos Pendientes</p>
                <p className="text-2xl font-bold">${totalLoans.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nómina Mensual</p>
                <p className="text-2xl font-bold">${totalMonthlySalaries.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employees List */}
      <div className="space-y-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Employee Header */}
              <div className="p-4 flex items-center justify-between">
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedEmployee(expandedEmployee === employee.id ? null : employee.id)}
                >
                  <img
                    src={employee.avatar || 'https://via.placeholder.com/50'}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(employee.role)}
                      <span className="text-sm text-gray-500">${employee.salary}/mes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-sm text-gray-500">Préstamos activos</p>
                    <p className="font-semibold">
                      ${employee.loans
                        .filter(l => l.status === 'approved' && l.remainingAmount > 0)
                        .reduce((s, l) => s + l.remainingAmount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditEmployee(employee)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteEmployee(employee)}
                      disabled={employee.id === currentUser.id}
                      className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedEmployee(expandedEmployee === employee.id ? null : employee.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {expandedEmployee === employee.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEmployee === employee.id && (
                <div className="border-t bg-gray-50 p-4">
                  <Tabs defaultValue="info">
                    <TabsList className="mb-4">
                      <TabsTrigger value="info">Información</TabsTrigger>
                      <TabsTrigger value="time">Horas</TabsTrigger>
                      <TabsTrigger value="loans">Préstamos ({employee.loans.length})</TabsTrigger>
                      <TabsTrigger value="payments">Pagos ({employee.payments.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium">{employee.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{employee.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de contratación</p>
                          <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PIN</p>
                          <p className="font-medium">****</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="time">
                      <div className="space-y-4">
                        {/* Panel de información de tiempo (solo lectura para admin) */}
                        <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isEmployeeClockedIn(employee) ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Clock className={`w-8 h-8 ${isEmployeeClockedIn(employee) ? 'text-green-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Estado Actual</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`w-3 h-3 rounded-full ${isEmployeeClockedIn(employee) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                  <span className={`text-xl font-bold ${isEmployeeClockedIn(employee) ? 'text-green-600' : 'text-gray-600'}`}>
                                    {isEmployeeClockedIn(employee) ? 'Trabajando' : 'Fuera de servicio'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Horas Hoy</p>
                              <p className="text-4xl font-bold text-blue-600">{getTodayHours(employee).toFixed(2)}h</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                            Los empleados registran su entrada/salida desde "Mi Horario" en el menú.
                          </p>
                        </div>

                        {/* Resumen de horas */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Hoy</p>
                            <p className="text-2xl font-bold text-blue-600">{getTodayHours(employee).toFixed(2)}h</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Esta Semana</p>
                            <p className="text-2xl font-bold text-green-600">{getWeekHours(employee).toFixed(2)}h</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Total Registros</p>
                            <p className="text-2xl font-bold text-purple-600">{employee.timeEntries?.length || 0}</p>
                          </div>
                        </div>

                        {/* Tabla de registros recientes */}
                        <div>
                          <h4 className="font-semibold mb-2">Registros Recientes</h4>
                          {employee.timeEntries && employee.timeEntries.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {employee.timeEntries.slice().reverse().map((entry) => (
                                <div key={entry.id} className="bg-white p-3 rounded-lg border flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                                      <p className="text-sm text-gray-500">
                                        {entry.punchIn} - {entry.punchOut || 'En curso'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {entry.totalHours ? (
                                      <p className="font-semibold">{entry.totalHours.toFixed(2)}h</p>
                                    ) : (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                        Activo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No hay registros de horas</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="loans">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Historial de Préstamos</h4>
                        <Button
                          size="sm"
                          onClick={() => { setSelectedEmployee(employee); setShowLoanModal(true); }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nuevo Préstamo
                        </Button>
                      </div>
                      {employee.loans.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay préstamos registrados</p>
                      ) : (
                        <div className="space-y-2">
                          {employee.loans.map((loan) => (
                            <div key={loan.id} className="bg-white p-3 rounded-lg border flex items-center justify-between">
                              <div>
                                <p className="font-medium">${loan.amount.toFixed(2)} - {loan.reason}</p>
                                <p className="text-sm text-gray-500">{new Date(loan.date).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">Restante: ${loan.remainingAmount.toFixed(2)}</p>
                                  {getLoanStatusBadge(loan.status)}
                                </div>
                                {loan.status === 'approved' && loan.remainingAmount > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setSelectedLoan(loan);
                                      setPayLoanAmount(loan.remainingAmount);
                                      setShowPayLoanModal(true);
                                    }}
                                  >
                                    Pagar
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="payments">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Historial de Pagos</h4>
                        <Button
                          size="sm"
                          onClick={() => { setSelectedEmployee(employee); setShowPaymentModal(true); }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Registrar Pago
                        </Button>
                      </div>
                      {employee.payments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
                      ) : (
                        <div className="space-y-2">
                          {employee.payments.map((payment) => (
                            <div key={payment.id} className="bg-white p-3 rounded-lg border flex items-center justify-between">
                              <div>
                                <p className="font-medium capitalize">{payment.type.replace('_', ' ')} - ${payment.amount.toFixed(2)}</p>
                                {payment.periodStart && (
                                  <p className="text-sm text-gray-500">
                                    Período: {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd!).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Modal */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label>PIN (4 dígitos)</Label>
              <Input
                value={employeeForm.pin}
                onChange={(e) => setEmployeeForm({ ...employeeForm, pin: e.target.value.slice(0, 4) })}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <Label>Rol</Label>
              <Select
                value={employeeForm.role}
                onValueChange={(v) => setEmployeeForm({ ...employeeForm, role: v as typeof employeeForm.role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cashier">Cajero</SelectItem>
                  <SelectItem value="waiter">Mesero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Salario Mensual</Label>
              <Input
                type="number"
                value={employeeForm.salary}
                onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                placeholder="555-0000"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                placeholder="empleado@cafe.com"
              />
            </div>
            <div>
              <Label>Fecha de Contratación</Label>
              <Input
                type="date"
                value={employeeForm.hireDate}
                onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
              />
            </div>
            <div>
              <Label>URL de Foto</Label>
              <Input
                value={employeeForm.avatar}
                onChange={(e) => setEmployeeForm({ ...employeeForm, avatar: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEmployeeModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSaveEmployee}>
                {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loan Modal */}
      <Dialog open={showLoanModal} onOpenChange={setShowLoanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Préstamo - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Motivo</Label>
              <Input
                value={loanForm.reason}
                onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
                placeholder="Motivo del préstamo"
              />
            </div>
            <div>
              <Label>Notas</Label>
              <Input
                value={loanForm.notes}
                onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                placeholder="Condiciones de pago, etc."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowLoanModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleAddLoan}>
                Registrar Préstamo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Pago</Label>
              <Select
                value={paymentForm.type}
                onValueChange={(v) => setPaymentForm({ ...paymentForm, type: v as typeof paymentForm.type })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salario</SelectItem>
                  <SelectItem value="bonus">Bono</SelectItem>
                  <SelectItem value="overtime">Horas Extra</SelectItem>
                  <SelectItem value="loan_deduction">Descuento Préstamo</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            {paymentForm.type === 'salary' && (
              <>
                <div>
                  <Label>Inicio de Período</Label>
                  <Input
                    type="date"
                    value={paymentForm.periodStart}
                    onChange={(e) => setPaymentForm({ ...paymentForm, periodStart: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fin de Período</Label>
                  <Input
                    type="date"
                    value={paymentForm.periodEnd}
                    onChange={(e) => setPaymentForm({ ...paymentForm, periodEnd: e.target.value })}
                  />
                </div>
              </>
            )}
            <div>
              <Label>Notas</Label>
              <Input
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notas adicionales"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleAddPayment}>
                Registrar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay Loan Modal */}
      <Dialog open={showPayLoanModal} onOpenChange={setShowPayLoanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar Préstamo - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Préstamo original</p>
              <p className="text-lg font-semibold">${selectedLoan?.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Monto restante</p>
              <p className="text-lg font-semibold text-orange-600">${selectedLoan?.remainingAmount.toFixed(2)}</p>
            </div>
            <div>
              <Label>Monto a Pagar</Label>
              <Input
                type="number"
                value={payLoanAmount}
                onChange={(e) => setPayLoanAmount(Number(e.target.value))}
                max={selectedLoan?.remainingAmount}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPayLoanModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handlePayLoan}>
                Registrar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar a <strong>{employeeToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer. Todos los datos del empleado serán eliminados permanentemente.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleConfirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
