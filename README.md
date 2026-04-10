# CafePOS ☕

Sistema de Punto de Venta moderno y completo para cafeterías y restaurantes.

![CafePOS](https://img.shields.io/badge/CafePOS-v1.6-amber)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-cyan)

## ✨ Características

### 🏪 Ventas (POS)
- Interfaz intuitiva de punto de venta
- Soporte para Dine-in, Takeaway y Delivery
- Gestión de mesas y reservaciones
- Órdenes pausadas y recuperación
- Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, Billetera)
- Propinas configurables
- Descuentos por porcentaje o monto fijo

### 📦 Productos
- Catálogo de productos con imágenes
- Categorías personalizables
- Tamaños y extras
- Control de stock
- Alertas de stock bajo

### 👥 Clientes
- Base de datos de clientes con fotos
- Sistema de fidelidad con puntos
- Historial de compras
- Información de contacto

### 📊 Dashboard
- Estadísticas de ventas en tiempo real
- Productos más vendidos
- Ventas por hora
- Alertas de inventario

### 🏭 Proveedores
- Gestión de proveedores con logo/imagen
- Información de contacto
- Productos asociados

### 🛒 Compras
- Registro de compras a proveedores
- Upload de imágenes de facturas
- Seguimiento de estado (Pendiente/Recibido/Cancelado)
- Historial de compras

### 📦 Inventario
- Control de stock en tiempo real
- Ajustes de inventario
- Categorías de productos
- Alertas de stock bajo

### 👨‍💼 Admin / Empleados
- Gestión de empleados
- Sistema de préstamos y pagos
- Control de horarios (Punch In/Out)
- Diferentes roles (Admin, Cajero, Mesero)

### ⏰ Mi Horario (TimeClock)
- Registro de entrada/salida para empleados
- Resumen de horas trabajadas
- Historial de registros

### ⚙️ Configuración
- Información del negocio (nombre, logo, RNC/Tax ID)
- Configuración de impuestos
- Configuración de recibos
- Horario de trabajo
- Sistema de fidelidad

## 🚀 Tecnologías

- **Frontend:** React 18 + TypeScript
- **Estilos:** Tailwind CSS
- **Componentes UI:** shadcn/ui
- **Gráficos:** Recharts
- **Notificaciones:** Sonner
- **Iconos:** Lucide React
- **Build Tool:** Vite

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/systemapropos-sp/cafepropos-1.0.git
cd cafepropos-1.0
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 🔐 Acceso

**PIN de acceso:** `1234`

Usuarios de prueba:
- Admin: PIN `1234`
- María (Cajera): PIN `5678`
- Juan (Mesero): PIN `9012`
- Ana (Mesera): PIN `3456`

## 📁 Estructura del Proyecto

```
cafepropos-1.0/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── data/          # Datos mock
│   ├── sections/      # Páginas/Vistas
│   ├── types/         # Tipos TypeScript
│   ├── lib/           # Utilidades
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── public/            # Archivos estáticos
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 📝 Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta linter

## 🎨 Personalización

### Colores
Los colores principales se pueden personalizar en `tailwind.config.js`:
- Primary: Amber (#f59e0b)
- Secondary: Orange (#ea580c)

### Configuración del Negocio
Accede a la sección **Configuración** para personalizar:
- Nombre del negocio
- Logo
- RNC/Tax ID
- Información de contacto
- Configuración de impuestos
- Configuración de recibos

## 🔮 Roadmap

- [ ] Soporte para múltiples sucursales
- [ ] Sistema de reservaciones avanzado
- [ ] Reportes PDF/Excel
- [ ] Integración con impresoras térmicas
- [ ] App móvil para empleados
- [ ] Panel de cocina (Kitchen Display)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para cafeterías y restaurantes.

---

¿Tienes preguntas o sugerencias? ¡Abre un issue!
