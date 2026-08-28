import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Circle, Sparkles, BookOpen, Sun, Moon, Clock, ArrowRight, Award } from 'lucide-react';
import {
  evaluateDailyConditions,
  DAILY_ACHIEVEMENT_EVENT,
  setPrayerStatus,
  setDailyQuranStatus,
  setDailyAdhkarStatus,
  createCertificateData,
  saveEarnedCertificate,
  isCertificateAwardedToday,
} from '../utils/dailyAchievementTracker';
import { DailyConditionsStatus, DiagnosisResult, UserIdentity, DailyCertificateData } from '../types';
import confetti from 'canvas-confetti';

interface DailyAchievementTrackerWidgetProps {
  currentResult?: DiagnosisResult | null;
  userIdentity?: UserIdentity | null;
  onOpenCertificate: (cert: DailyCertificateData) => void;
  compact?: boolean;
}

export const DailyAchievementTrackerWidget: React.FC<DailyAchievementTrackerWidgetProps> = ({
  currentResult,
  userIdentity,
  onOpenCertificate,
  compact = false,
}) => {
  const [conditions, setConditions] = useState<DailyConditionsStatus>(() =>
    evaluateDailyConditions(currentResult)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setConditions(evaluateDailyConditions(currentResult));
    };

    window.addEventListener(DAILY_ACHIEVEMENT_EVENT, handleUpdate);
    return () => window.removeEventListener(DAILY_ACHIEVEMENT_EVENT, handleUpdate);
  }, [currentResult]);

  // Check conditions whenever currentResult changes
  useEffect(() => {
    setConditions(evaluateDailyConditions(currentResult));
  }, [currentResult]);

  const handleTogglePrayer = (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const currentVal = conditions.prayersDetails[prayer];
    setPrayerStatus(prayer, !currentVal);
  };

  const handleToggleQuran = () => {
    setDailyQuranStatus(!conditions.quranCompleted);
  };

  const handleToggleAdhkar = (type: 'morning' | 'evening') => {
    const currentVal = conditions.adhkarDetails[type];
    setDailyAdhkarStatus(type, !currentVal);
  };

  const completedConditionsCount = [
    conditions.sessionsCompleted,
    conditions.prayersCompleted,
    conditions.quranCompleted,
    conditions.adhkarCompleted,
  ].filter(Boolean).length;

  const handleTriggerCertificate = () => {
    const cert = createCertificateData(userIdentity || null, conditions);
    saveEarnedCertificate(cert);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#E11D48'],
    });
    onOpenCertificate(cert);
  };

  if (compact) {
    return (
      <div className="card-surface p-4 border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/50 rounded-2xl shadow-xs dir-rtl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-base">
              🏆
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 font-heading">
                شروط شهادة التقدير اليومية (٤/٤)
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {completedConditionsCount} من ٤ شروط مكتملة اليوم
              </p>
            </div>
          </div>

          {conditions.allCompleted ? (
            <button
              type="button"
              onClick={handleTriggerCertificate}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 animate-pulse cursor-pointer transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>عرض الشهادة اليومية</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100/70 text-amber-900 border border-amber-200">
              المتبقي: {4 - completedConditionsCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full card-surface border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/30 space-y-4 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center text-2xl shadow-inner border border-amber-300 shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-amber-950 font-heading">
                متابعة شهادة الإنجاز اليومي 🎖️
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {completedConditionsCount} من ٤ شروط
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium pt-0.5">
              تُمنح الشهادة حصريًا عند إكمال الفروض الأربعة بالكامل دون استثناء:
            </p>
          </div>
        </div>

        {conditions.allCompleted && (
          <button
            type="button"
            onClick={handleTriggerCertificate}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 cursor-pointer transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>استلام شهادة اليوم الذهبية 🎉</span>
          </button>
        )}
      </div>

      {/* The 4 Strict Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Condition 1: جدول الجلسات */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            conditions.sessionsCompleted
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-white/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📚</span>
              <div>
                <h4 className="text-xs font-black">
                  ١. جميع جلسات جدول المذاكرة
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {conditions.totalSessionsCount > 0
                    ? `أُنجزت ${conditions.sessionsCount} من ${conditions.totalSessionsCount} جلسات`
                    : 'لم تُنشئ أو تُحدد جلسات لليوم بعد في "جدول الجلسات"'}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {conditions.sessionsCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                  {conditions.sessionsCount}/{conditions.totalSessionsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Condition 2: الصلوات الخمس */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            conditions.prayersCompleted
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-white/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🕌</span>
              <div>
                <h4 className="text-xs font-black">
                  ٢. الصلوات الخمس في أوقاتها
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  الفجر • الظهر • العصر • المغرب • العشاء
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {conditions.prayersCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  {Object.values(conditions.prayersDetails).filter(Boolean).length}/5
                </span>
              )}
            </div>
          </div>

          {/* Quick prayer check toggles */}
          <div className="grid grid-cols-5 gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60 text-center">
            {[
              { key: 'fajr', label: 'الفجر' },
              { key: 'dhuhr', label: 'الظهر' },
              { key: 'asr', label: 'العصر' },
              { key: 'maghrib', label: 'المغرب' },
              { key: 'isha', label: 'العشاء' },
            ].map((p) => {
              const isChecked = conditions.prayersDetails[p.key as keyof typeof conditions.prayersDetails];
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleTogglePrayer(p.key as any)}
                  className={`py-1 px-1 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title={`تبديل حالة صلاة ${p.label}`}
                >
                  {p.label} {isChecked ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition 3: الورد القرآني اليومي */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            conditions.quranCompleted
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-white/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📖</span>
              <div>
                <h4 className="text-xs font-black">
                  ٣. الورد القرآني اليومي
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  قراءة صفحتين أو جزء لنيل البركة والسكينة
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleQuran}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                conditions.quranCompleted
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-200'
              }`}
            >
              {conditions.quranCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              <span>{conditions.quranCompleted ? 'تمت القراءة' : 'تحديد كمنجز'}</span>
            </button>
          </div>
        </div>

        {/* Condition 4: أذكار الصباح والمساء */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            conditions.adhkarCompleted
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-white/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">☀️🌙</span>
              <div>
                <h4 className="text-xs font-black">
                  ٤. أذكار الصباح والمساء
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  حصن المسلم وتفريغ الشحنات الذهنية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleAdhkar('morning')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  conditions.adhkarDetails.morning
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 hover:bg-amber-50 text-slate-600 border-slate-200'
                }`}
                title="أذكار الصباح"
              >
                الصباح {conditions.adhkarDetails.morning ? '✓' : '⭕'}
              </button>

              <button
                type="button"
                onClick={() => handleToggleAdhkar('evening')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  conditions.adhkarDetails.evening
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 border-slate-200'
                }`}
                title="أذكار المساء"
              >
                المساء {conditions.adhkarDetails.evening ? '✓' : '⭕'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Feedback Banner at Bottom */}
      {!conditions.allCompleted ? (
        <div className="bg-amber-100/60 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-700">تذكير:</span>
            <span>أكمل كافة الشروط الأربعة لتفعيل ظهور شهادة تقديرك اليومية تلقائياً</span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Quick preview demo of template
              const cert = createCertificateData(userIdentity || null, conditions);
              onOpenCertificate(cert);
            }}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            معاينة نموذج الشهادة 👁️
          </button>
        </div>
      ) : (
        <div className="bg-emerald-100/80 border border-emerald-300 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span className="font-extrabold">ما شاء الله! حققت كافة الشروط المطلوبة لليوم بالكامل، شهادتك جاهزة!</span>
          </div>
          <button
            type="button"
            onClick={handleTriggerCertificate}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs"
          >
            عرض شهادة اليوم 🏆
          </button>
        </div>
      )}
    </div>
  );
};
