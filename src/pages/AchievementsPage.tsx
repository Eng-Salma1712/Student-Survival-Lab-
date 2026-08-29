import React, { useState } from 'react';
import { PageContainer } from '../components/PageContainer';
import { GamificationWidget } from '../components/GamificationWidget';
import { AchievementsModal } from '../components/AchievementsModal';
import { DailyCertificateModal } from '../components/DailyCertificateModal';
import { DailyRolloverSimulator } from '../components/DailyRolloverSimulator';
import { GamificationState, DailyCertificateData } from '../types';
import { ALL_BADGES } from '../utils/gamification';
import { getEarnedCertificates } from '../utils/dailyAchievementTracker';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Target,
  Gift,
  HelpCircle,
  Calendar,
  Eye,
  Clock,
  BookOpen,
} from 'lucide-react';

interface AchievementsPageProps {
  gamification: GamificationState;
}

// Calculate rank title and next level requirement
const getRankInfo = (points: number) => {
  if (points >= 1000) {
    return { title: 'الأسطورة الذهبي 💎', nextPoints: 1000, progress: 100, currentRankFloor: 1000 };
  } else if (points >= 500) {
    return { title: 'صقر القمة 👑', nextPoints: 1000, progress: Math.min(100, Math.round(((points - 500) / 500) * 100)), currentRankFloor: 500 };
  } else if (points >= 250) {
    return { title: 'محارب الالتزام ⚔️', nextPoints: 500, progress: Math.min(100, Math.round(((points - 250) / 250) * 100)), currentRankFloor: 250 };
  } else if (points >= 100) {
    return { title: 'بطل الانطلاق 🚀', nextPoints: 250, progress: Math.min(100, Math.round(((points - 100) / 150) * 100)), currentRankFloor: 100 };
  } else {
    return { title: 'المبتدئ الطموح 🌟', nextPoints: 100, progress: Math.min(100, Math.round((points / 100) * 100)), currentRankFloor: 0 };
  }
};

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ gamification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DailyCertificateData | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [earnedCertificates] = useState<DailyCertificateData[]>(() => getEarnedCertificates());

  const unlockedSet = new Set(gamification.unlockedBadgeIds || []);
  const rankInfo = getRankInfo(gamification.points || 0);

  const handleOpenCert = (cert: DailyCertificateData) => {
    setSelectedCertificate(cert);
    setIsCertModalOpen(true);
  };

  // Week days for streak visualization
  const weekDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const activeDaysInWeek = Math.min(7, gamification.currentStreak || 0);

  return (
    <PageContainer title="النقاط والمكافآت">
      <div className="space-y-6 dir-rtl" dir="rtl">
        
        {/* Top Hero Points Banner */}
        <div className="card-surface p-6 border border-amber-500/30 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 border border-amber-500/40 flex items-center justify-center text-3xl shrink-0 shadow-sm">
                <Trophy className="w-9 h-9 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    {rankInfo.title}
                  </span>
                  <span className="text-xs text-[#6B6B6B]">
                    سجل التحفيز والمكافآت
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-black text-[#2A2A2A] font-heading">
                    {gamification.points || 0}
                  </h2>
                  <span className="text-sm font-bold text-amber-600">نقطة تميز</span>
                </div>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  أكمل جلسات المذاكرة والتقييم اليومي لتحصيل المزيد من النقاط
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 self-stretch sm:self-auto justify-center"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>عرض نافذة الأوسمة الكاملة</span>
            </button>
          </div>

          {/* Rank Progress Bar */}
          <div className="mt-5 pt-4 border-t border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#2A2A2A]">التقدم نحو الترقية القادمة ({rankInfo.nextPoints} نقطة)</span>
              <span className="text-amber-600 font-extrabold">{rankInfo.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-amber-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${rankInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gamification Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card-surface p-4 border border-amber-500/30 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-bold">
              <Zap className="w-4 h-4 fill-current" />
              <span>مجموع النقاط</span>
            </div>
            <p className="text-2xl font-black text-[#2A2A2A] font-heading">
              {gamification.points}
            </p>
            <span className="text-[10px] text-[#6B6B6B] block">+10 لكل جلسة</span>
          </div>

          <div className="card-surface p-4 border border-rose-500/30 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-rose-500 text-xs font-bold">
              <Flame className="w-4 h-4 fill-current" />
              <span>سلسلة الالتزام</span>
            </div>
            <p className="text-2xl font-black text-[#2A2A2A] font-heading">
              {gamification.currentStreak} <span className="text-xs font-semibold text-[#6B6B6B]">أيام</span>
            </p>
            <span className="text-[10px] text-[#6B6B6B] block">أفضل سلسلة: {gamification.bestStreak}</span>
          </div>

          <div className="card-surface p-4 border border-sky-500/30 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-sky-600 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>جلسات مكتملة</span>
            </div>
            <p className="text-2xl font-black text-[#2A2A2A] font-heading">
              {gamification.totalCompletedSessions || 0}
            </p>
            <span className="text-[10px] text-[#6B6B6B] block">جلسة مذاكرة فعلية</span>
          </div>

          <div className="card-surface p-4 border border-emerald-500/30 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>الأوسمة المحققة</span>
            </div>
            <p className="text-2xl font-black text-[#2A2A2A] font-heading">
              {unlockedSet.size} / {ALL_BADGES.length}
            </p>
            <span className="text-[10px] text-[#6B6B6B] block">وسام في خزانة الإنجاز</span>
          </div>
        </div>

        {/* Weekly Streak Tracker */}
        <div className="card-surface p-5 border border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="text-sm font-extrabold text-[#2A2A2A] font-heading">
                سلسلة الانضباط الأسبوعية (Streak)
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {gamification.currentStreak} أيام متتالية 🔥
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            حافظ على المذاكرة يومياً لتفعيل مضاعف النقاط وتجنب انقطاع السلسلة.
          </p>

          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {weekDays.map((day, idx) => {
              const isFilled = idx < activeDaysInWeek;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    isFilled
                      ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-2xs font-extrabold'
                      : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#6B6B6B]'
                  }`}
                >
                  <span className="text-[11px] block">{day}</span>
                  <span className="text-base block mt-0.5">{isFilled ? '🔥' : '⚪'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Day System & Streak Testing Simulator */}
        <DailyRolloverSimulator gamification={gamification} />

        {/* In-Place Badges Showcase */}
        <div className="card-surface p-5 sm:p-6 border border-[#E5E5E5] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-extrabold text-[#2A2A2A] font-heading">
                  خزانة الأوسمة والمكافآت التقديرية 🏅
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  الأوسمة المفتوحة والمتبقية في رحلتك نحو القمة
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              {unlockedSet.size} من {ALL_BADGES.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = unlockedSet.has(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-white border-amber-400 text-[#2A2A2A] shadow-xs ring-1 ring-amber-400/30'
                      : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#6B6B6B] opacity-75'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold ${
                      isUnlocked
                        ? 'bg-amber-100 text-amber-700 border border-amber-300 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isUnlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-400" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-black ${isUnlocked ? 'text-amber-800' : 'text-slate-700'}`}>
                        {badge.title}
                      </h4>
                      {isUnlocked ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> تم الفتح
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          مغلق
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Achievement Certificates History Section */}
        <div className="card-surface p-6 border-2 border-amber-300/70 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center text-xl shrink-0 border border-amber-300">
                📜
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950 font-heading">
                  سجل شهادات الإنجاز اليومي 🏆
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  الشهادات التي استحققتها عند إتمام كافة الشروط الأربعة اليومية بنجاح
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
              {earnedCertificates.length} شهادات مكتسبة
            </span>
          </div>

          {earnedCertificates.length === 0 ? (
            <div className="text-center py-8 px-4 bg-white/70 rounded-2xl border border-dashed border-amber-300 space-y-2">
              <div className="text-3xl">🏅</div>
              <h4 className="text-sm font-bold text-amber-950">
                لم تكسب شهادة إنجاز يومي بعد
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                أكمل شروط اليوم الأربعة (جميع جلسات جدول المذاكرة، الصلوات الخمس في أوقاتها، الورد القرآني، وأذكار الصباح والمساء) وستُمنح شهادتك التقديرية فوراً هنا وتُحفظ في سجلك!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {earnedCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white p-4 rounded-2xl border border-amber-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-950 font-heading">
                          {cert.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold mt-0.5">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>{cert.formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                    {cert.paragraphs[0]}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <span>🎯 {cert.completedTasksCount} مهام</span>
                      <span>•</span>
                      <span>⏱️ {cert.completedSessionsCount} جلسات</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCert(cert)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض وحفظ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to Earn Points Guide */}
        <div className="card-surface p-5 border border-sky-200 bg-sky-50/50 space-y-3">
          <div className="flex items-center gap-2 text-sky-800">
            <Gift className="w-5 h-5 text-sky-600" />
            <h4 className="text-sm font-extrabold font-heading">
              كيف تكسب المزيد من النقاط وترفع مستواك؟ 🎯
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-sky-900 font-medium">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-sky-200">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center shrink-0">1</span>
              <span><strong>إتمام جلسة مذاكرة:</strong> +10 نقاط لكل جلسة تنجزها بتركيز</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-sky-200">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center shrink-0">2</span>
              <span><strong>المواد الصعبة والمكثفة:</strong> +20 نقطة بونص إضافي</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-sky-200">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center shrink-0">3</span>
              <span><strong>التقييم اليومي:</strong> +5 نقاط عند تسجيل حالتك اليومية</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-sky-200">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center shrink-0">4</span>
              <span><strong>سلسلة الالتزام (3+ أيام):</strong> مضاعف x1.5 للنقاط المكتسبة</span>
            </div>
          </div>
        </div>

        {/* Modal if triggered */}
        {isModalOpen && (
          <AchievementsModal
            gamification={gamification}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {/* Daily Certificate Modal */}
        <DailyCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          certificateData={selectedCertificate}
        />

      </div>
    </PageContainer>
  );
};
