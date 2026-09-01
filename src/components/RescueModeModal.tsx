import React from 'react';
import { Zap, X, AlertTriangle, Clock, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RescueModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RescueModeModal: React.FC<RescueModeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200" dir="rtl">
      <div className="card-surface w-full max-w-md p-6 rounded-2xl relative border-[#E5E5E5] shadow-2xl">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] rounded-lg">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 border border-amber-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#2A2A2A] font-heading">
            وضع الإنقاذ ⚡
          </h2>
          <p className="text-xs text-[#6B6B6B] font-bold">
            خطة طوارئ عاجلة لإنقاذ المتراكم
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-4 border border-[#E5E5E5] rounded-xl bg-white hover:border-amber-500 transition-colors cursor-pointer" onClick={() => { onClose(); navigate('/coach'); }}>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-[#2A2A2A] text-sm">إنقاذ متراكم شهر</h3>
            </div>
            <p className="text-xs text-[#6B6B6B]">التركيز على الأساسيات والأولويات فقط.</p>
          </div>

          <div className="p-4 border border-[#E5E5E5] rounded-xl bg-white hover:border-amber-500 transition-colors cursor-pointer" onClick={() => { onClose(); navigate('/coach'); }}>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-[#2A2A2A] text-sm">امتحان بعد 48 ساعة</h3>
            </div>
            <p className="text-xs text-[#6B6B6B]">أسئلة متوقعة ومراجعة سريعة جداً.</p>
          </div>

          <div className="p-4 border border-[#E5E5E5] rounded-xl bg-white hover:border-amber-500 transition-colors cursor-pointer" onClick={() => { onClose(); navigate('/coach'); }}>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-[#2A2A2A] text-sm">طوارئ ساعتين</h3>
            </div>
            <p className="text-xs text-[#6B6B6B]">أهم النقاط الأكثر تكراراً في الامتحانات.</p>
          </div>
        </div>

        <button onClick={() => { onClose(); navigate('/coach'); }} className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white border-transparent">
          تحدث مع الرفيق لإنشاء الخطة <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
