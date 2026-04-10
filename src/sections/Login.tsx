import { useState, useEffect } from 'react';
import { Coffee, Delete, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';

interface LoginProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
}

export function Login({ users, onLogin }: LoginProps) {
  const [pin, setPin] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const activeUsers = users.filter(u => u.isActive);

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleLogin = () => {
    if (!selectedUser) {
      setError('Selecciona un usuario');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (pin.length !== 4) {
      setError('Ingresa tu PIN de 4 dígitos');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (selectedUser.pin === pin) {
      onLogin(selectedUser);
    } else {
      setError('PIN incorrecto');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  // Auto-login when PIN is complete
  useEffect(() => {
    if (pin.length === 4 && selectedUser) {
      handleLogin();
    }
  }, [pin]);

  const keypadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl mb-4">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Café Aroma</h1>
          <p className="text-gray-500">Sistema de Punto de Venta</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Selección de Usuario */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              Selecciona tu usuario
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {activeUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setPin('');
                    setError('');
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    selectedUser?.id === user.id
                      ? "border-amber-500 bg-amber-50 shadow-md"
                      : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                      selectedUser?.id === user.id
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Teclado PIN */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Ingresa tu PIN
            </h2>

            {/* Display PIN */}
            <div className={cn(
              "mb-6 p-4 bg-gray-100 rounded-xl text-center transition-all",
              shake && "animate-shake bg-red-100"
            )}>
              <div className="flex justify-center gap-3 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full transition-all",
                      pin.length > i
                        ? "bg-amber-500 scale-110"
                        : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 h-5">
                {error && <span className="text-red-500">{error}</span>}
                {!error && selectedUser && `Hola, ${selectedUser.name}`}
                {!error && !selectedUser && 'Selecciona un usuario'}
              </p>
            </div>

            {/* Teclado Numérico */}
            <div className="grid grid-cols-3 gap-3">
              {keypadNumbers.map((key) => {
                const isClear = key === 'C';
                const isDelete = key === '←';
                
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (isClear) handleClear();
                      else if (isDelete) handleDelete();
                      else handleNumberPress(key);
                    }}
                    className={cn(
                      "h-14 rounded-xl font-semibold text-xl transition-all duration-150 active:scale-95",
                      isClear
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : isDelete
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    )}
                  >
                    {isDelete ? <Delete className="w-6 h-6 mx-auto" /> : key}
                  </button>
                );
              })}
            </div>

            {/* Botón Entrar */}
            <button
              onClick={handleLogin}
              disabled={!selectedUser || pin.length !== 4}
              className={cn(
                "w-full mt-4 py-4 rounded-xl font-semibold text-lg transition-all",
                selectedUser && pin.length === 4
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Entrar
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-8 text-sm">
          CaféPOS v1.0 • Sistema de Punto de Venta
        </p>
      </div>

      {/* Animación shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
