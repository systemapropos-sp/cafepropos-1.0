import { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  Mail,
  Star,
  TrendingUp,
  Calendar,
  Upload,
  X,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Customer } from '@/types';

interface CustomersProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Customer>) => void;
  onDelete: (id: string) => void;
}

export function Customers({ customers, onAdd, onUpdate, onDelete }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    photo: '',
    address: '',
    notes: '',
    points: 0,
    isActive: true,
  });

  // Simular carga de foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUploadedUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=200`;
      setFormData({ ...formData, photo: mockUploadedUrl });
      setPhotoPreview(mockUploadedUrl);
      toast.success('Foto cargada exitosamente');
    }
  };

  const handlePhotoUrlChange = (url: string) => {
    setFormData({ ...formData, photo: url });
    setPhotoPreview(url);
  };

  const clearPhoto = () => {
    setFormData({ ...formData, photo: '' });
    setPhotoPreview('');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const totalVisits = customers.reduce((sum, c) => sum + c.totalVisits, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const handleSubmit = () => {
    if (editingCustomer) {
      onUpdate(editingCustomer.id, formData);
    } else {
      onAdd({ ...formData, totalVisits: 0, totalSpent: 0 });
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setPhotoPreview('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      photo: '',
      address: '',
      notes: '',
      points: 0,
      isActive: true,
    });
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      photo: customer.photo || '',
      address: customer.address || '',
      notes: customer.notes || '',
      points: customer.points,
      isActive: customer.isActive,
    });
    setPhotoPreview(customer.photo || '');
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setPhotoPreview('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      photo: '',
      address: '',
      notes: '',
      points: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gestiona tu base de clientes y programa de fidelidad</p>
        </div>
        <Button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Puntos Totales</p>
              <p className="text-xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos Clientes</p>
              <p className="text-xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Visitas</p>
              <p className="text-xl font-bold text-gray-900">{totalVisits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {customer.photo ? (
                  <img 
                    src={customer.photo} 
                    alt={customer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span>{customer.points} puntos</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(customer)}
                  className="h-8 w-8"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(customer.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Visitas</p>
                <p className="font-semibold text-gray-900">{customer.totalVisits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gastado</p>
                <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
              </div>
            </div>

            {customer.lastVisit && (
              <div className="mt-3 text-xs text-gray-500">
                Última visita: {new Date(customer.lastVisit).toLocaleDateString('es-ES')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <Label className="self-start mb-2">Foto del Cliente</Label>
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full object-cover"
                    onError={() => setPhotoPreview('')}
                  />
                  <button
                    onClick={clearPhoto}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Subir Foto
                </Button>
              </div>
              <Input
                value={formData.photo}
                onChange={(e) => handlePhotoUrlChange(e.target.value)}
                placeholder="O pegar URL de foto..."
                className="mt-2"
              />
            </div>

            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-0000"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección del cliente..."
              />
            </div>
            {editingCustomer && (
              <div>
                <Label>Puntos</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
            <div>
              <Label>Notas</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-amber-500 hover:bg-amber-600">
                {editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
