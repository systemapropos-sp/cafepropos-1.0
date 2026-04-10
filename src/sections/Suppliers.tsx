import { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Truck, 
  Phone, 
  Mail,
  MapPin,
  Package,
  User,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Supplier } from '@/types';

interface SuppliersProps {
  suppliers: Supplier[];
  onAdd: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Supplier>) => void;
  onDelete: (id: string) => void;
}

export function Suppliers({ suppliers, onAdd, onUpdate, onDelete }: SuppliersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    image: '',
    products: [] as string[],
    isActive: true,
  });

  // Simular carga de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En producción, aquí se subiría la imagen a un servidor
      // Por ahora, usamos una URL de placeholder que simula una imagen subida
      const mockUploadedUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=400`;
      setFormData({ ...formData, image: mockUploadedUrl });
      setImagePreview(mockUploadedUrl);
      toast.success('Imagen cargada exitosamente');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

  const clearImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview('');
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const handleSubmit = () => {
    if (editingSupplier) {
      onUpdate(editingSupplier.id, formData);
    } else {
      onAdd(formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setImagePreview('');
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      image: '',
      products: [],
      isActive: true,
    });
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setImagePreview(supplier.image || '');
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      image: supplier.image || '',
      products: supplier.products || [],
      isActive: supplier.isActive,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      image: '',
      products: [],
      isActive: true,
    });
    setShowModal(true);
  };

  const activeSuppliers = suppliers.filter(s => s.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500">Gestiona tus proveedores y suministros</p>
        </div>
        <Button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Proveedores</p>
              <p className="text-xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-xl font-bold text-gray-900">{activeSuppliers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Contactos</p>
              <p className="text-xl font-bold text-gray-900">{suppliers.reduce((sum, s) => sum + s.products.length, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {supplier.image ? (
                  <div className="relative">
                    <img 
                      src={supplier.image} 
                      alt={supplier.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{supplier.contact}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(supplier)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(supplier.id)}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{supplier.phone}</span>
              </div>
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.address}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Productos suministrados:</span>
                <span className="font-semibold text-gray-900">{supplier.products.length}</span>
              </div>
            </div>

            <div className="mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                supplier.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {supplier.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la Empresa</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <Label>Contacto</Label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nombre del contacto"
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
                placeholder="proveedor@email.com"
              />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>
            {/* Upload de Imagen */}
            <div>
              <Label>Logo de la Empresa</Label>
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
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                  <p className="text-sm text-gray-500">Haz clic para subir logo</p>
                  <p className="text-xs text-gray-400 mt-1">o arrastra una imagen aquí</p>
                </div>
              )}
              
              {/* Opción alternativa: URL */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">O ingresa URL de imagen:</p>
                <Input
                  value={formData.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-amber-500 hover:bg-amber-600">
                {editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
