import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar,
  Briefcase,
  User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Employee } from '@/types';

interface TimeClockProps {
  currentEmployee: Employee;
  onPunchIn: () => void;
  onPunchOut: () => void;
}

export function TimeClock({ currentEmployee, onPunchIn, onPunchOut }: TimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Verificar si el empleado está trabajando (tiene entrada sin salida)
  const isClockedIn = currentEmployee.timeEntries?.some(
    entry => entry.punchIn && !entry.punchOut
  ) || false;

  // Obtener entrada activa
  const activeEntry = currentEmployee.timeEntries?.find(
    entry => entry.punchIn && !entry.punchOut
  );

  // Calcular horas trabajadas hoy
  const getTodayHours = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = currentEmployee.timeEntries?.find(e => e.date === today);
    return todayEntry?.totalHours || 0;
  };

  // Calcular horas de la semana
  const getWeekHours = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return currentEmployee.timeEntries?.reduce((total, entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= weekAgo && entry.totalHours) {
        return total + entry.totalHours;
      }
      return total;
    }, 0) || 0;
  };

  // Formatear hora actual
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handlePunchIn = () => {
    if (isClockedIn) {
      toast.error('Ya tienes una entrada registrada');
      return;
    }
    onPunchIn();
    toast.success('Entrada registrada correctamente');
  };

  const handlePunchOut = () => {
    if (!isClockedIn) {
      toast.error('No tienes una entrada activa');
      return;
    }
    onPunchOut();
    toast.success('Salida registrada correctamente');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Control de Tiempo
        </h1>
        <p className="text-gray-500 mt-1">Registra tu entrada y salida de trabajo</p>
      </div>

      {/* Reloj y Fecha */}
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-2">{formatDate(currentTime)}</p>
          <p className="text-6xl font-bold text-gray-900 font-mono">
            {formatTime(currentTime)}
          </p>
        </CardContent>
      </Card>

      {/* Panel Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Estado y Botones */}
        <Card className={`border-2 ${isClockedIn ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isClockedIn ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {isClockedIn ? (
                  <Briefcase className="w-10 h-10 text-white" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1">Estado Actual</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                <span className={`text-2xl font-bold ${isClockedIn ? 'text-green-600' : 'text-gray-600'}`}>
                  {isClockedIn ? 'Trabajando' : 'Fuera de servicio'}
                </span>
              </div>
              {activeEntry && (
                <p className="text-sm text-gray-500 mt-2">
                  Entrada: {activeEntry.punchIn}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePunchIn}
                disabled={isClockedIn}
                className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center transition-all ${
                  !isClockedIn 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <LogIn className="w-6 h-6 mr-3" />
                Registrar Entrada
              </button>
              <button
                type="button"
                onClick={handlePunchOut}
                disabled={!isClockedIn}
                className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center transition-all ${
                  isClockedIn 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <LogOut className="w-6 h-6 mr-3" />
                Registrar Salida
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Horas */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Horas Hoy</p>
                  <p className="text-4xl font-bold text-blue-600">{getTodayHours().toFixed(2)}h</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Esta Semana</p>
                  <p className="text-4xl font-bold text-green-600">{getWeekHours().toFixed(2)}h</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Registros</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {currentEmployee.timeEntries?.length || 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historial Reciente */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial Reciente
          </h3>
          {currentEmployee.timeEntries && currentEmployee.timeEntries.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {currentEmployee.timeEntries.slice().reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.punchOut ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {entry.punchOut ? (
                        <LogOut className="w-5 h-5 text-blue-600" />
                      ) : (
                        <LogIn className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">
                        {entry.punchIn} {entry.punchOut && `- ${entry.punchOut}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.totalHours ? (
                      <p className="font-semibold text-lg">{entry.totalHours.toFixed(2)}h</p>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        En curso
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay registros de horas</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
