import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full font-sans dir-rtl" dir="rtl">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${
              t.type === 'success' 
                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-emerald-400' 
                : t.type === 'warning'
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-amber-400'
                : 'bg-white/90 border-[#E5E5E5] text-[#2A2A2A] backdrop-blur-md'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-[#10B981]" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />}
              {t.type === 'info' && <Bell className="w-5 h-5 text-[#D15F70]" />}
            </div>
            <div className="flex-1 text-sm font-bold leading-snug">
              {t.message}
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
