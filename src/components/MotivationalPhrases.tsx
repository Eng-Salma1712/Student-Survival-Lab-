import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, HeartHandshake } from 'lucide-react';

const THANAWEYA_MOTIVATIONAL_PHRASES = [
  '💪 أنا فخورة بيك.. كمل واعمل اللي عليك، والنتيجة هتكون أجمل مما تتوقع!',
  '✨ كل يوم بتذاكر فيه بتقرب خطوة حقيقية من حلمك والكلية اللي بتتمناها.',
  '🏆 الدرجة العالية مستنياك، العزيمة والإصرار أقوى بكثير من أي تعب مؤقت.',
  '🎓 كل مسألة بتحلها أو درس بتراجعه النهارده هو حجر أساس لنجاحك في امتحانات الثانوية العامة.',
  '🌟 افتكر دايماً فرحة يوم النتيجة وسعادة أهلك بيك.. استعن بالله ولا تعجز!',
  '🚀 متقلقش من كبر المنهج، خذ خطوة واحدة هادئة ودقيقة بدقيقة وهتخلص الباب بنجاح.',
  '💡 ثق بقدراتك، ذهنك أقوى مما تتخيل والحل بين يديك الآن. Just Start!',
];

export const MotivationalPhrases: React.FC = () => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % THANAWEYA_MOTIVATIONAL_PHRASES.length);
    }, 9000); // rotates every 9 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % THANAWEYA_MOTIVATIONAL_PHRASES.length);
  };

  return (
    <div className="w-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-amber-500/10 border border-sky-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sky-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>مستشار الثانوية العامة - تشجيع اليوم:</span>
          </div>
          <p className="text-slate-800 text-xs sm:text-sm font-bold leading-relaxed transition-all duration-300">
            {THANAWEYA_MOTIVATIONAL_PHRASES[index]}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleNext}
        title="عبارة جديدة"
        className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};

