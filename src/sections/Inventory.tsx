import { useState } from 'react';
import { 
  Search, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  History,
  Edit3,
  Plus,
  Minus,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InventoryItem, InventoryCategory, Product, Supplier } from '@/types';

interface InventoryProps {
  inventory: InventoryItem[];
  products: Product[];
  suppliers: Supplier[];
  onAdjustStock: (id: string, quantity: number, reason: string) => void;
}

const categories: { id: InventoryCategory; name: string }[] = [
  { id: 'coffee', name: 'Café' },
  { id: 'milk', name: 'Lácteos' },
  { id: 'syrup', name: 'Sirops' },
  { id: 'pastry', name: 'Panadería' },
  { id: 'packaging', name: 'Empaque' },
  { id: 'cleaning', name: 'Limpieza' },
  { id: 'other', name: 'Otros' },
];

export function Inventory({ inventory, suppliers, onAdjustStock }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);
  const [adjustMode, setAdjustMode] = useState<'add' | 'set'>('add');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

  const openAdjustModal = (item: InventoryItem) => {
    setEditingItem(item);
    setAdjustAmount(0);
    setNewQuantity(item.quantity);
    setAdjustReason('');
    setAdjustMode('add');
    setShowAdjustModal(true);
  };

  const handleAdjust = () => {
    if (!editingItem) return;

    if (adjustMode === 'add') {
      if (adjustAmount !== 0) {
        onAdjustStock(editingItem.id, adjustAmount, adjustReason || 'Ajuste manual');
        setShowAdjustModal(false);
        setEditingItem(null);
      }
    } else {
      // Set mode - calculate difference
      const diff = newQuantity - editingItem.quantity;
      if (diff !== 0) {
        onAdjustStock(editingItem.id, diff, adjustReason || 'Ajuste a cantidad específica');
        setShowAdjustModal(false);
        setEditingItem(null);
      }
    }
  };

  const quickAdjust = (item: InventoryItem, amount: number) => {
    onAdjustStock(item.id, amount, amount > 0 ? 'Entrada rápida' : 'Salida rápida');
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minQuantity) return 'low';
    if (item.quantity <= item.minQuantity * 1.5) return 'medium';
    return 'good';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500">Gestiona tu stock y suministros</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-bold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock Bajo</p>
              <p className="text-xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bien Stock</p>
              <p className="text-xl font-bold text-gray-900">{inventory.length - lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoría</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Stock</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mínimo</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Costo/Unidad</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Valor Total</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item);
              const supplier = suppliers.find(s => s.id === item.supplierId);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.unit} • {supplier?.name || 'Sin proveedor'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {categories.find(c => c.id === item.category)?.name || item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'font-semibold',
                      status === 'low' ? 'text-red-600' :
                      status === 'medium' ? 'text-amber-600' :
                      'text-green-600'
                    )}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.minQuantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ${item.costPerUnit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${(item.quantity * item.costPerUnit).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      status === 'low' ? 'bg-red-100 text-red-700' :
                      status === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {status === 'low' ? 'Bajo' :
                       status === 'medium' ? 'Medio' :
                       'Bueno'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => quickAdjust(item, -1)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                        title="Restar 1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openAdjustModal(item)}
                        className="px-3 py-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 text-sm flex items-center"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Ajustar
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAdjust(item, 1)}
                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
                        title="Agregar 1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar Stock - {editingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Actual</p>
                <p className="text-2xl font-bold text-gray-900">{editingItem?.quantity} {editingItem?.unit}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <Tabs value={adjustMode} onValueChange={(v) => setAdjustMode(v as 'add' | 'set')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  Agregar/Restar
                </TabsTrigger>
                <TabsTrigger value="set">
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Establecer Cantidad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div>
                  <Label>Cantidad (+ para agregar, - para restar)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAdjustAmount(prev => prev - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAdjustAmount(prev => prev + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[10, 25, 50, 100].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAdjustAmount(amount)}
                      className="flex-1"
                    >
                      +{amount}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="set" className="space-y-4">
                <div>
                  <Label>Nueva Cantidad Total</Label>
                  <Input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Ingresa la cantidad exacta"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Diferencia: <strong>{newQuantity - (editingItem?.quantity || 0) > 0 ? '+' : ''}{newQuantity - (editingItem?.quantity || 0)} {editingItem?.unit}</strong>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label>Razón del Ajuste</Label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ej: Compra a proveedor, Merma, Inventario físico..."
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                Nuevo stock será: <strong>
                  {adjustMode === 'add' 
                    ? (editingItem?.quantity || 0) + adjustAmount 
                    : newQuantity} {editingItem?.unit}
                </strong>
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdjustModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdjust} className="bg-amber-500 hover:bg-amber-600">
                Aplicar Ajuste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
