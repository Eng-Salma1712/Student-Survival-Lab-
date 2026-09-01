import React, { useRef, useState } from 'react';
import { Trophy, Download, Share2, X, Award, Sparkles, Check, Flame, Heart, Calendar, Target, Clock, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { DailyCertificateData } from '../types';
import { useToast } from '../context/ToastContext';

interface DailyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: DailyCertificateData | null;
}

export const DailyCertificateModal: React.FC<DailyCertificateModalProps> = ({
  isOpen,
  onClose,
  certificateData,
}) => {
  const { toast } = useToast();
  const certNodeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificateData) return null;

  const handleDownloadPng = async () => {
    if (!certNodeRef.current) return;
    setIsDownloading(true);
    try {
      // Fire celebratory confetti
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D97706', '#F59E0B', '#10B981', '#E11D48'],
      });

      const dataUrl = await toPng(certNodeRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });

      const link = document.createElement('a');
      link.download = `شهادة_إنجاز_يومي_${certificateData.dateKey}.png`;
      link.href = dataUrl;
      link.click();

      toast('تم حفظ الشهادة بنجاح في جهازك كصورة PNG عالية الجودة 🏆', 'success');
    } catch (err) {
      console.error('Failed to export certificate image:', err);
      // Fallback notification
      toast('تعذر تنزيل الصورة تلقائياً، يمكنك أخذ لقطة شاشة للشهادة', 'warning');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareText = () => {
    const text = `
🏆 ${certificateData.title} 🏆
Student Survival Lab – Just Start

${certificateData.paragraphs.join('\n\n')}

${certificateData.duaText}

📅 اليوم: ${certificateData.formattedDate}
🎯 المهام المكتملة: ${certificateData.completedTasksCount}
⏱️ جلسات المذاكرة: ${certificateData.completedSessionsCount}

🎖️ فخورون بإنجازك اليوم — Student Survival Lab
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 35, spread: 60, colors: ['#F59E0B', '#10B981'] });
    toast('تم نسخ نص الشهادة بنجاح للمشاركة مع أحبابك 🤍', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto dir-rtl animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="w-full max-w-3xl my-auto flex flex-col space-y-4">
        {/* Top Actions Bar (Above the certificate) */}
        <div className="flex items-center justify-between bg-white/95 px-4 py-3 rounded-2xl border border-amber-200 shadow-lg text-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center text-lg shadow-2xs font-bold">
              🏆
            </span>
            <div>
              <h3 className="text-sm font-black text-amber-950 font-heading">
                شهادة تقدير يومية مستحقة!
              </h3>
              <p className="text-[11px] text-amber-800/80 font-medium">
                أتممت جميع الصلوات، الورد، الأذكار وجلسات المذاكرة بنجاح 🌟
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'جاري التنزيل...' : 'حفظ الشهادة (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareText}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="نسخ نص الشهادة"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'مشاركة'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable / Renderable Certificate Frame */}
        <div
          ref={certNodeRef}
          className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FFFDF5] to-[#FFF9EE] text-[#2C2416] rounded-3xl p-6 sm:p-10 border-4 border-amber-400 shadow-2xl overflow-hidden font-sans select-none"
          style={{ minHeight: '620px' }}
        >
          {/* Inner Ornate Border Frame */}
          <div className="absolute inset-2 sm:inset-3 border-2 border-dashed border-amber-300/80 rounded-2xl pointer-events-none" />
          <div className="absolute inset-4 sm:inset-5 border border-amber-200/60 rounded-xl pointer-events-none" />

          {/* Ornate Corner Accents */}
          <div className="absolute top-4 right-4 text-amber-500 font-serif text-2xl select-none">❖</div>
          <div className="absolute top-4 left-4 text-amber-500 font-serif text-2xl select-none">❖</div>
          <div className="absolute bottom-4 right-4 text-amber-500 font-serif text-2xl select-none">❖</div>
          <div className="absolute bottom-4 left-4 text-amber-500 font-serif text-2xl select-none">❖</div>

          {/* Background Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Trophy className="w-96 h-96 text-amber-900" />
          </div>

          {/* Certificate Content Container */}
          <div className="relative z-10 space-y-6 text-center max-w-2xl mx-auto py-2">
            
            {/* Top Emblem Seal & Trophy */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-amber-200/80 border-2 border-white">
                  <Trophy className="w-10 h-10 text-amber-50 fill-amber-100/30" />
                </div>
                <div className="absolute -bottom-2 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-sm border-2 border-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="pt-2 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{certificateData.subtitle}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-heading tracking-tight pt-1">
                  🏆 {certificateData.title}
                </h1>
              </div>
            </div>

            {/* Recipient Ribbon Card */}
            <div className="py-2">
              <div className="text-xs font-bold text-amber-800/90 mb-1">
                تَـشـهَـد Student Survival Lab بـأنّ
              </div>
              <div className="inline-block bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border-y-2 border-amber-400 px-6 sm:px-10 py-2.5 rounded-xl shadow-xs">
                <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-heading">
                  {certificateData.studentName}
                </h2>
              </div>
            </div>

            {/* Motivational Body Paragraphs */}
            <div className="space-y-3.5 text-right sm:text-justify text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white/70 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-amber-200/70 shadow-2xs">
              <p className="font-semibold text-slate-900 leading-relaxed">
                {certificateData.paragraphs[0]}
              </p>

              {certificateData.paragraphs[1] && (
                <p className="text-slate-700 leading-relaxed">
                  {certificateData.paragraphs[1]}
                </p>
              )}

              {certificateData.paragraphs[2] && (
                <p className="font-bold text-amber-950 leading-relaxed border-r-2 border-amber-500 pr-2.5">
                  {certificateData.paragraphs[2]}
                </p>
              )}

              {certificateData.paragraphs[3] && (
                <div className="p-3 bg-gradient-to-r from-amber-100/60 to-orange-50/60 border border-amber-300/80 rounded-xl text-amber-950 font-bold text-center">
                  {certificateData.paragraphs[3]}
                </div>
              )}

              <p className="text-emerald-800 font-bold text-center pt-1 text-xs">
                {certificateData.duaText}
              </p>
            </div>

            {/* Dynamic Real Data Statistics Pill Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-white/80 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-2xs">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-bold">اليوم والتاريخ</span>
                  <span className="font-black text-slate-900 text-[11px]">{certificateData.formattedDate}</span>
                </div>
              </div>

              <div className="bg-white/80 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-2xs">
                <Target className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-bold">المهام المكتملة</span>
                  <span className="font-black text-emerald-700 text-sm">{certificateData.completedTasksCount} مهام</span>
                </div>
              </div>

              <div className="bg-white/80 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-bold">جلسات المذاكرة</span>
                  <span className="font-black text-amber-800 text-sm">{certificateData.completedSessionsCount} جلسات</span>
                </div>
              </div>
            </div>

            {/* Certificate Footer Stamp & Sign */}
            <div className="pt-4 border-t border-amber-300/60 flex items-center justify-between text-xs text-amber-900 font-bold">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎖️</span>
                <span>فخورون بإنجازك اليوم</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-800">
                <span className="font-heading font-black">Student Survival Lab</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-950 font-black">Just Start</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="text-center text-xs text-white/80 font-medium pb-2">
          💡 يمكنك تحميل هذه الشهادة والاحتفاظ بها، أو الرجوع إليها دائماً من قسم <span className="font-bold underline">النقاط والمكافآت</span>.
        </div>
      </div>
    </div>
  );
};
