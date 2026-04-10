import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShoppingCart,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  X,
  FileText,
  User,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Purchase, PurchaseItem, Supplier } from '@/types';

interface PurchasesProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  onAdd: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Purchase>) => void;
  onDelete: (id: string) => void;
}

const paymentMethods = [
  { id: 'cash', name: 'Efectivo', icon: DollarSign },
  { id: 'card', name: 'Tarjeta', icon: CreditCard },
  { id: 'transfer', name: 'Transferencia', icon: FileText },
  { id: 'wallet', name: 'Billetera', icon: CreditCard },
];

export function Purchases({ purchases, suppliers, onAdd, onUpdate, onDelete }: PurchasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [formData, setFormData] = useState<{
    invoiceNumber: string;
    supplierId: string;
    date: string;
    items: PurchaseItem[];
    tax: number;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'wallet' | 'points';
    status: 'pending' | 'received' | 'cancelled';
    notes: string;
    image: string;
  }>({
    invoiceNumber: '',
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as PurchaseItem[],
    tax: 0,
    paymentMethod: 'cash',
    status: 'pending',
    notes: '',
    image: '',
  });

  // New item form
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    unitCost: 0,
  });

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUploadedUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=400`;
      setFormData({ ...formData, image: mockUploadedUrl });
      setImagePreview(mockUploadedUrl);
      toast.success('Imagen de factura cargada');
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview('');
  };

  // Calculate totals
  const calculateSubtotal = (items: PurchaseItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = (subtotal: number, tax: number) => {
    return subtotal + (subtotal * tax / 100);
  };

  // Add item to purchase
  const handleAddItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.unitCost <= 0) {
      toast.error('Complete todos los campos del producto');
      return;
    }

    const item: PurchaseItem = {
      id: Date.now().toString(),
      productName: newItem.productName,
      quantity: newItem.quantity,
      unitCost: newItem.unitCost,
      total: newItem.quantity * newItem.unitCost,
    };

    setFormData({
      ...formData,
      items: [...formData.items, item],
    });

    setNewItem({ productName: '', quantity: 1, unitCost: 0 });
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId),
    });
  };

  // Filter purchases
  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = 
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalPurchases = purchases.length;
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length;
  const receivedPurchases = purchases.filter(p => p.status === 'received').length;
  const totalSpent = purchases
    .filter(p => p.status === 'received')
    .reduce((sum, p) => sum + p.total, 0);

  const openAddModal = () => {
    setEditingPurchase(null);
    setImagePreview('');
    setFormData({
      invoiceNumber: `FACT-${String(purchases.length + 1).padStart(3, '0')}`,
      supplierId: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      tax: 10,
      paymentMethod: 'cash',
      status: 'pending',
      notes: '',
      image: '',
    });
    setNewItem({ productName: '', quantity: 1, unitCost: 0 });
    setShowModal(true);
  };

  const openEditModal = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setImagePreview(purchase.image || '');
    setFormData({
      invoiceNumber: purchase.invoiceNumber,
      supplierId: purchase.supplierId,
      date: purchase.date,
      items: purchase.items,
      tax: purchase.tax,
      paymentMethod: purchase.paymentMethod,
      status: purchase.status,
      notes: purchase.notes || '',
      image: purchase.image || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPurchase(null);
    setImagePreview('');
    setFormData({
      invoiceNumber: '',
      supplierId: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      tax: 0,
      paymentMethod: 'cash',
      status: 'pending',
      notes: '',
      image: '',
    });
    setNewItem({ productName: '', quantity: 1, unitCost: 0 });
  };

  const handleSubmit = () => {
    if (!formData.supplierId) {
      toast.error('Seleccione un proveedor');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Agregue al menos un producto');
      return;
    }

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    const subtotal = calculateSubtotal(formData.items);
    const total = calculateTotal(subtotal, formData.tax);

    const purchaseData = {
      ...formData,
      supplierName: supplier?.name || '',
      subtotal,
      total,
      createdBy: '1', // Current user ID
    };

    if (editingPurchase) {
      onUpdate(editingPurchase.id, purchaseData);
    } else {
      onAdd(purchaseData);
    }
    closeModal();
  };

  const handleMarkAsReceived = (purchase: Purchase) => {
    onUpdate(purchase.id, { 
      status: 'received', 
      receivedAt: new Date().toISOString() 
    });
    toast.success('Compra marcada como recibida');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Recibido</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Compras
          </h1>
          <p className="text-gray-500 mt-1">Gestiona tus compras a proveedores</p>
        </div>
        <Button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Compras</p>
                <p className="text-2xl font-bold">{totalPurchases}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-amber-600">{pendingPurchases}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recibidos</p>
                <p className="text-2xl font-bold text-green-600">{receivedPurchases}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gastado</p>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por factura o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="received">Recibido</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchases List */}
      <div className="space-y-4">
        {filteredPurchases.map((purchase) => (
          <div key={purchase.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {purchase.image ? (
                  <img 
                    src={purchase.image} 
                    alt="Factura" 
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{purchase.invoiceNumber}</h3>
                    {getStatusBadge(purchase.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    <span>{purchase.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(purchase.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {purchase.items.length} productos
                    </span>
                    <span className="font-semibold text-amber-600">
                      ${purchase.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {purchase.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsReceived(purchase)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Recibido
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(purchase)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(purchase.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
            
            {/* Items preview */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Productos:</div>
              <div className="flex flex-wrap gap-2">
                {purchase.items.map((item) => (
                  <span key={item.id} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {item.productName} x{item.quantity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPurchase ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número de Factura</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="FACT-001"
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Proveedor</Label>
              <Select 
                value={formData.supplierId} 
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.isActive).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Imagen de Factura</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              {imagePreview || formData.image ? (
                <div className="relative mt-2">
                  <img
                    src={imagePreview || formData.image}
                    alt="Factura"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all"
                >
                  <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Haz clic para subir imagen de factura</p>
                </div>
              )}
            </div>

            {/* Add Items */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Agregar Productos</h4>
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5">
                  <Input
                    placeholder="Nombre del producto"
                    value={newItem.productName}
                    onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="Costo unitario"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAddItem} className="w-full px-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2 mt-4">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="flex-1">{item.productName}</span>
                      <span className="w-20 text-center">x{item.quantity}</span>
                      <span className="w-24 text-right">${item.unitCost.toFixed(2)}</span>
                      <span className="w-24 text-right font-medium">${item.total.toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Impuesto (%)</Label>
                <Input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <Label>Método de Pago</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="received">Recibido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal:</span>
                <span>${calculateSubtotal(formData.items).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Impuesto ({formData.tax}%):</span>
                <span>${(calculateSubtotal(formData.items) * formData.tax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-amber-600">
                  ${calculateTotal(calculateSubtotal(formData.items), formData.tax).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notas</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600">
                {editingPurchase ? 'Guardar Cambios' : 'Crear Compra'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
