import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { SpiritualHabitsWidget } from '../components/SpiritualHabitsWidget';
import { DailyAdhkarWidget } from '../components/DailyAdhkarWidget';
import { StudyDuaWidget } from '../components/StudyDuaWidget';
import { QuranReaderWidget } from '../components/QuranReaderWidget';
import { BookOpen, Sparkles, Moon, Sun, Clock, Brain, Compass, Layers } from 'lucide-react';

type TabKey = 'all' | 'habits' | 'adhkar' | 'study' | 'quran';

export const SpiritualPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'adhkar';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabKey;
    if (tabParam && ['all', 'habits', 'adhkar', 'study', 'quran'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams(tab === 'all' ? {} : { tab });
  };

  return (
    <PageContainer title="الجانب الديني والروحي">
      <div className="space-y-6">
        {/* Banner */}
        <div className="card-surface p-6 sm:p-8 bg-gradient-to-br from-[#E8F2E9] to-[#FBE8EE] border border-[#C9DEC9] relative overflow-hidden rounded-3xl shadow-xs">
          <div className="absolute top-0 right-0 w-56 h-56 bg-[#9EB39F]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#426B4B]/10 text-[#426B4B] text-xs font-bold border border-[#426B4B]/20">
                <Sparkles className="w-3.5 h-3.5" /> البركة والسكينة الدراسية
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#5B3C43] font-heading">
                حصن الطالب ومستودع الطمأنينة 🌙
              </h2>
              <p className="text-xs sm:text-sm text-[#7A5B64] max-w-xl leading-relaxed">
                تنظيم الأوقات بين المذاكرة والعبادة يضاعف البركة ويشرح الصدر. تابع أذكار الصباح والمساء، أدعية المذاكرة، وورد المصحف الشريف لتنطلق بنقاء ذهني وطاقة عالية.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#426B4B] text-white flex items-center justify-center shadow-md shadow-[#426B4B]/20">
                <Moon className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => handleTabChange('adhkar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              activeTab === 'adhkar'
                ? 'bg-[#426B4B] text-white border-[#426B4B] shadow-xs'
                : 'bg-white text-[#7A5B64] border-[#E5E5E5] hover:bg-[#E8F2E9] hover:text-[#426B4B]'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>أذكار الصباح والمساء</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('study')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              activeTab === 'study'
                ? 'bg-[#426B4B] text-white border-[#426B4B] shadow-xs'
                : 'bg-white text-[#7A5B64] border-[#E5E5E5] hover:bg-[#E8F2E9] hover:text-[#426B4B]'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>أدعية المذاكرة والامتحان</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('quran')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              activeTab === 'quran'
                ? 'bg-[#426B4B] text-white border-[#426B4B] shadow-xs'
                : 'bg-white text-[#7A5B64] border-[#E5E5E5] hover:bg-[#E8F2E9] hover:text-[#426B4B]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المصحف الإلكتروني</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('habits')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              activeTab === 'habits'
                ? 'bg-[#426B4B] text-white border-[#426B4B] shadow-xs'
                : 'bg-white text-[#7A5B64] border-[#E5E5E5] hover:bg-[#E8F2E9] hover:text-[#426B4B]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواقيت الصلاة والورد اليومي</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              activeTab === 'all'
                ? 'bg-[#5B3C43] text-white border-[#5B3C43] shadow-xs'
                : 'bg-white text-[#7A5B64] border-[#E5E5E5] hover:bg-[#F5F5F5]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>عرض شامل</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {(activeTab === 'all' || activeTab === 'adhkar') && (
            <DailyAdhkarWidget />
          )}

          {(activeTab === 'all' || activeTab === 'study') && (
            <StudyDuaWidget />
          )}

          {(activeTab === 'all' || activeTab === 'quran') && (
            <QuranReaderWidget />
          )}

          {(activeTab === 'all' || activeTab === 'habits') && (
            <SpiritualHabitsWidget />
          )}
        </div>
      </div>
    </PageContainer>
  );
};
