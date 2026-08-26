import React from 'react';
import { PageContainer } from '../components/PageContainer';
import { SpiritualHabitsWidget } from '../components/SpiritualHabitsWidget';
import { BookOpen, Sparkles, Moon, Sun, Heart } from 'lucide-react';

export const SpiritualPage: React.FC = () => {
  return (
    <PageContainer title="الركن الروحي والإيماني">
      <div className="space-y-6">
        <div className="card-surface p-6 sm:p-8 bg-gradient-to-br from-[#E8F2E9] to-[#FBE8EE] border border-[#C9DEC9] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#9EB39F]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#426B4B]/10 text-[#426B4B] text-xs font-bold border border-[#426B4B]/20">
                <Sparkles className="w-3.5 h-3.5" /> البركة والسكينة الدراسية
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#5B3C43] font-heading">
                حصن الطالب ومستودع الطمأنينة 🌙
              </h2>
              <p className="text-xs sm:text-sm text-[#7A5B64] max-w-xl leading-relaxed">
                تنظيم الأوقات بين المذاكرة والعبادة يضاعف البركة ويشرح الصدر. تابع أذكارك وورد القرآن الكريم لتنطلق في دراستك بنقاء ذهني وطاقة إيجابية عالية.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#426B4B] text-white flex items-center justify-center shadow-md">
                <Moon className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        <SpiritualHabitsWidget />
      </div>
    </PageContainer>
  );
};
