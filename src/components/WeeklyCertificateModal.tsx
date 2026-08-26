import React, { useState, useEffect } from 'react';
import { Share2, Download, Trophy, Sparkles, X, Target, Calendar, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserIdentity, StudentGoal, WeeklyCertificateData } from '../types';
import { getTitleInfo } from './UserPersonalizationWidget';

interface WeeklyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIdentity: UserIdentity | null;
  goal: StudentGoal | null;
  certificateData: WeeklyCertificateData | null;
}

export const WeeklyCertificateModal: React.FC<WeeklyCertificateModalProps> = ({ isOpen, onClose, userIdentity, goal, certificateData }) => {
  const [copied, setCopied] = useState(false);
  const info = getTitleInfo(userIdentity);

  useEffect(() => {
    if (isOpen && certificateData) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D4AF6A', '#F59E0B'] });
    }
  }, [isOpen, certificateData]);

  if (!isOpen || !certificateData) return null;

  const handleShare = () => {
    const text = `
🏆 إنجاز أسبوعي في مختبر الطالب 🏆
أنا ${info.formalTitle} ${certificateData.studentName}، فخور بإنجازي هذا الأسبوع:
🔥 ${certificateData.streakDays} أيام متتالية
⏱️ ${certificateData.totalFocusedHours} ساعات تركيز
✅ ${certificateData.completedLessonsCount} دروس مكتملة

أقرب لحلمي في ${goal?.targetCollege || 'الجامعة'}! 🚀
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({ particleCount: 30, spread: 40, colors: ['#D4AF6A', '#F59E0B'] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200" dir="rtl">
      <div className="card-surface w-full max-w-lg rounded-2xl relative border-[#E5E5E5] shadow-2xl flex flex-col overflow-hidden">
        
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <button onClick={handleShare} className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-lg">
            <Share2 className="w-3.5 h-3.5" /> {copied ? 'تم النسخ!' : 'شارك الإنجاز'}
          </button>
          <button onClick={onClose} className="p-2 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 bg-white text-[#2A2A2A]">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-[#D15F70]/10 rounded-full flex items-center justify-center border border-[#D15F70]/30">
              <Trophy className="w-10 h-10 text-[#D15F70]" />
            </div>
            
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#D15F70] tracking-widest uppercase">
                شهادة إنجاز أسبوعية
              </div>
              <h2 className="text-2xl font-black text-[#2A2A2A] font-heading">
                كفو يا بطل! 🌟
              </h2>
            </div>

            <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-4 text-sm font-bold text-[#6B6B6B]">
              يُشهد "مختبر الطالب الذكي" أن
              <div className="text-xl font-black text-[#D15F70] my-2 font-heading border-b border-dashed border-[#E5E5E5] max-w-xs mx-auto pb-2">
                {info.formalTitle}
              </div>
              قد أظهر التزاماً وعزيمة استثنائية خلال هذا الأسبوع.
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 flex items-center gap-3">
                <Flame className="w-6 h-6 text-[#D15F70]" />
                <div className="text-right">
                  <div className="text-[10px] text-[#6B6B6B] font-bold">أيام مستمرة</div>
                  <div className="text-lg font-black text-[#2A2A2A]">{certificateData.streakDays}</div>
                </div>
              </div>
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 flex items-center gap-3">
                <Target className="w-6 h-6 text-[#D15F70]" />
                <div className="text-right">
                  <div className="text-[10px] text-[#6B6B6B] font-bold">دروس مكتملة</div>
                  <div className="text-lg font-black text-[#2A2A2A]">{certificateData.completedLessonsCount}</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-[#6B6B6B] font-bold mt-4">
              "{certificateData.inspirationalVerse}"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
