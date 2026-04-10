import { useState } from 'react';
import { 
  Store, 
  Percent, 
  DollarSign, 
  Palette, 
  Save,
  CheckCircle2,
  Star,
  Moon,
  Sun,
  Monitor,
  Image,
  FileText,
  Clock,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { AppConfig } from '@/types';

interface SettingsProps {
  config: AppConfig;
  onUpdate: (updates: Partial<AppConfig>) => void;
}

export function Settings({ config, onUpdate }: SettingsProps) {
  const [formData, setFormData] = useState(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Personaliza tu sistema de punto de venta</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-amber-500 hover:bg-amber-600"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Guardado
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Negocio</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelidad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          {/* Información General */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-600" />
                Información del Negocio
              </h3>
              
              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Logo del Negocio
                  </Label>
                  <div className="flex items-center gap-4 mt-2">
                    {formData.businessLogo && (
                      <img 
                        src={formData.businessLogo} 
                        alt="Logo" 
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    <Input
                      value={formData.businessLogo || ''}
                      onChange={(e) => setFormData({ ...formData, businessLogo: e.target.value })}
                      placeholder="https://..."
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Nombre del negocio</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Café Aroma"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    RNC / Tax ID
                  </Label>
                  <Input
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="RNC-123456789"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="555-1234"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@cafearoma.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Av. Principal 123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horario de Trabajo */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Horario de Trabajo
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora de Apertura</Label>
                  <Input
                    type="time"
                    value={formData.businessHours?.open || '07:00'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      businessHours: { 
                        ...formData.businessHours, 
                        open: e.target.value,
                        close: formData.businessHours?.close || '21:00',
                        workDays: formData.businessHours?.workDays || []
                      } 
                    })}
                  />
                </div>
                <div>
                  <Label>Hora de Cierre</Label>
                  <Input
                    type="time"
                    value={formData.businessHours?.close || '21:00'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      businessHours: { 
                        ...formData.businessHours, 
                        close: e.target.value,
                        open: formData.businessHours?.open || '07:00',
                        workDays: formData.businessHours?.workDays || []
                      } 
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Recibos */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                Configuración de Recibos
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Encabezado del Recibo</Label>
                  <Input
                    value={formData.receiptHeader || ''}
                    onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                    placeholder="Café Aroma - Especialidad en Cafés"
                  />
                </div>

                <div>
                  <Label>Pie del Recibo</Label>
                  <Input
                    value={formData.receiptFooter || ''}
                    onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                    placeholder="¡Gracias por su visita!"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium text-gray-700">Mostrar en recibo:</p>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Logo del negocio</span>
                    <Switch
                      checked={formData.receiptSettings?.showLogo ?? true}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        receiptSettings: { 
                          ...formData.receiptSettings, 
                          showLogo: checked,
                          showTaxId: formData.receiptSettings?.showTaxId ?? true,
                          showPhone: formData.receiptSettings?.showPhone ?? true,
                          showEmail: formData.receiptSettings?.showEmail ?? true,
                          showAddress: formData.receiptSettings?.showAddress ?? true,
                          printTwoCopies: formData.receiptSettings?.printTwoCopies ?? false,
                        } 
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">RNC / Tax ID</span>
                    <Switch
                      checked={formData.receiptSettings?.showTaxId ?? true}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        receiptSettings: { 
                          ...formData.receiptSettings, 
                          showTaxId: checked,
                          showLogo: formData.receiptSettings?.showLogo ?? true,
                          showPhone: formData.receiptSettings?.showPhone ?? true,
                          showEmail: formData.receiptSettings?.showEmail ?? true,
                          showAddress: formData.receiptSettings?.showAddress ?? true,
                          printTwoCopies: formData.receiptSettings?.printTwoCopies ?? false,
                        } 
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Teléfono</span>
                    <Switch
                      checked={formData.receiptSettings?.showPhone ?? true}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        receiptSettings: { 
                          ...formData.receiptSettings, 
                          showPhone: checked,
                          showLogo: formData.receiptSettings?.showLogo ?? true,
                          showTaxId: formData.receiptSettings?.showTaxId ?? true,
                          showEmail: formData.receiptSettings?.showEmail ?? true,
                          showAddress: formData.receiptSettings?.showAddress ?? true,
                          printTwoCopies: formData.receiptSettings?.printTwoCopies ?? false,
                        } 
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Email</span>
                    <Switch
                      checked={formData.receiptSettings?.showEmail ?? true}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        receiptSettings: { 
                          ...formData.receiptSettings, 
                          showEmail: checked,
                          showLogo: formData.receiptSettings?.showLogo ?? true,
                          showTaxId: formData.receiptSettings?.showTaxId ?? true,
                          showPhone: formData.receiptSettings?.showPhone ?? true,
                          showAddress: formData.receiptSettings?.showAddress ?? true,
                          printTwoCopies: formData.receiptSettings?.printTwoCopies ?? false,
                        } 
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Dirección</span>
                    <Switch
                      checked={formData.receiptSettings?.showAddress ?? true}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        receiptSettings: { 
                          ...formData.receiptSettings, 
                          showAddress: checked,
                          showLogo: formData.receiptSettings?.showLogo ?? true,
                          showTaxId: formData.receiptSettings?.showTaxId ?? true,
                          showPhone: formData.receiptSettings?.showPhone ?? true,
                          showEmail: formData.receiptSettings?.showEmail ?? true,
                          printTwoCopies: formData.receiptSettings?.printTwoCopies ?? false,
                        } 
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Imprimir 2 copias</span>
                    <Switch
                      checked={formData.receiptSettings?.printTwoCopies ?? false}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        receiptSettings: { 
                          ...formData.receiptSettings, 
                          printTwoCopies: checked,
                          showLogo: formData.receiptSettings?.showLogo ?? true,
                          showTaxId: formData.receiptSettings?.showTaxId ?? true,
                          showPhone: formData.receiptSettings?.showPhone ?? true,
                          showEmail: formData.receiptSettings?.showEmail ?? true,
                          showAddress: formData.receiptSettings?.showAddress ?? true,
                        } 
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-600" />
              Configuración de Pagos
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tasa de impuesto (%)</Label>
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Habilitar propinas</p>
                  <p className="text-sm text-gray-500">Permite a los clientes agregar propina</p>
                </div>
                <Switch
                  checked={formData.enableTips}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableTips: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Loyalty Settings */}
        <TabsContent value="loyalty" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-600" />
              Programa de Fidelidad
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Habilitar programa de fidelidad</p>
                  <p className="text-sm text-gray-500">Los clientes ganan puntos por compras</p>
                </div>
                <Switch
                  checked={formData.enableLoyalty}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableLoyalty: checked })}
                />
              </div>

              {formData.enableLoyalty && (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Puntos por dólar
                      </Label>
                      <Input
                        type="number"
                        value={formData.loyalty.pointsPerDollar}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          loyalty: { ...formData.loyalty, pointsPerDollar: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Mínimo para canjear</Label>
                      <Input
                        type="number"
                        value={formData.loyalty.minPointsRedeem}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          loyalty: { ...formData.loyalty, minPointsRedeem: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Valor del punto ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.loyalty.pointValue}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          loyalty: { ...formData.loyalty, pointValue: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-600" />
              Apariencia
            </h3>
            
            <div className="space-y-4">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, theme: 'light' })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.theme === 'light' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className="w-8 h-8 text-amber-500" />
                  <span className="font-medium">Claro</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, theme: 'dark' })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.theme === 'dark' 
                      ? 'border-amber-500 bg-gray-800' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className="w-8 h-8 text-gray-600" />
                  <span className="font-medium">Oscuro</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, theme: 'auto' })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.theme === 'auto' 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Monitor className="w-8 h-8 text-blue-500" />
                  <span className="font-medium">Automático</span>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
