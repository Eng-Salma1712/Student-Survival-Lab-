import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Bookmark, ArrowRight, Sparkles, Loader2, BookmarkCheck, Type, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { QURAN_SURAHS, SurahMeta } from '../data/quranSurahs';
import { useToast } from '../context/ToastContext';

interface AyahData {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: AyahData[];
}

interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  date: string;
}

export const QuranReaderWidget: React.FC = () => {
  const { toast } = useToast();
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [surahData, setSurahData] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Bookmark / Last Read
  const [lastRead, setLastRead] = useState<LastRead | null>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_quran_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveBookmark = (surahNumber: number, surahName: string, ayahNumber: number = 1) => {
    const bookmark: LastRead = {
      surahNumber,
      surahName,
      ayahNumber,
      date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
    };
    setLastRead(bookmark);
    try {
      localStorage.setItem('thanaweya_quran_last_read', JSON.stringify(bookmark));
    } catch (e) {
      console.error(e);
    }
    toast(`تم حفظ العلامة: سورة ${surahName} - الآية ${ayahNumber}`, 'success');
  };

  // Fetch Surah text dynamically from alquran.cloud with local cache
  const fetchSurah = async (surahNumber: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Check local cache first
    const cacheKey = `quran_cache_surah_${surahNumber}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSurahData(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      if (!res.ok) {
        throw new Error(`خطأ في جلب بيانات السورة (${res.status})`);
      }
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setSurahData(json.data);
        // Cache to localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json.data));
        } catch (e) {
          // ignore storage quota limit
        }
      } else {
        throw new Error('تعذر تحميل نص السورة الكريمة');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'تعذر الاتصال بخادم المصحف الشريف. يرجى التأكد من الاتصال بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSurah = (surah: SurahMeta, targetAyah?: number) => {
    setSelectedSurah(surah);
    fetchSurah(surah.number);
    if (!targetAyah) {
      saveBookmark(surah.number, surah.name, 1);
    }
  };

  const resumeLastRead = () => {
    if (!lastRead) return;
    const targetSurah = QURAN_SURAHS.find((s) => s.number === lastRead.surahNumber);
    if (targetSurah) {
      handleSelectSurah(targetSurah, lastRead.ayahNumber);
    }
  };

  const filteredSurahs = QURAN_SURAHS.filter((s) => {
    const matchesSearch =
      s.name.includes(searchQuery.trim()) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      String(s.number) === searchQuery.trim();
    const matchesType = typeFilter === 'all' || s.revelationType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getFontSizeClass = () => {
    if (fontSize === 'normal') return 'text-base sm:text-lg leading-loose';
    if (fontSize === 'large') return 'text-lg sm:text-2xl leading-[2.6]';
    return 'text-xl sm:text-3xl leading-[2.9]';
  };

  return (
    <div className="card-surface p-5 sm:p-7 rounded-3xl border border-[#C9DEC9] space-y-5 bg-white/95 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F2E9] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#426B4B] to-[#2B4B32] text-white flex items-center justify-center shadow-sm shadow-[#426B4B]/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#5B3C43] font-heading">
                المصحف الإلكتروني الميسّر 📖
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F2E9] text-[#426B4B] border border-[#C9DEC9]">
                ١١٤ سورة بالرسم العثماني
              </span>
            </div>
            <p className="text-xs text-[#7A5B64] font-medium pt-0.5">
              تلاوة وقراءة الورد اليومي مع ميزة حفظ علامة آخر موضع قراءة
            </p>
          </div>
        </div>

        {/* Last Read Quick Resume Bar */}
        {lastRead && !selectedSurah && (
          <button
            type="button"
            onClick={resumeLastRead}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-right">
              <span className="block text-[10px] text-amber-700">آخر قراءة:</span>
              <span className="font-black">سورة {lastRead.surahName} (آية {lastRead.ayahNumber})</span>
            </div>
          </button>
        )}
      </div>

      {/* Surah List View */}
      {!selectedSurah && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A5B64] absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها (مثال: الكهف، 18)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#FDFEFE] text-xs font-bold text-[#2A2A2A] focus:outline-hidden focus:border-[#426B4B] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#7A5B64] hover:text-[#2A2A2A]"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Type Filters */}
            <div className="flex bg-[#F5F5F5] p-1 rounded-xl border border-[#E5E5E5] text-xs font-bold gap-1 self-start">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-white text-[#426B4B] shadow-xs font-black'
                    : 'text-[#7A5B64] hover:text-[#5B3C43]'
                }`}
              >
                الكل (114)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('Meccan')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  typeFilter === 'Meccan'
                    ? 'bg-white text-[#426B4B] shadow-xs font-black'
                    : 'text-[#7A5B64] hover:text-[#5B3C43]'
                }`}
              >
                مكية
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('Medinan')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  typeFilter === 'Medinan'
                    ? 'bg-white text-[#426B4B] shadow-xs font-black'
                    : 'text-[#7A5B64] hover:text-[#5B3C43]'
                }`}
              >
                مدنية
              </button>
            </div>
          </div>

          {/* Quick recommendations */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#7A5B64] shrink-0">سور شائعة:</span>
            {[
              { num: 1, name: 'الفاتحة' },
              { num: 18, name: 'الكهف' },
              { num: 36, name: 'يس' },
              { num: 55, name: 'الرحمن' },
              { num: 56, name: 'الواقعة' },
              { num: 67, name: 'الملك' },
              { num: 94, name: 'الشرح' },
            ].map((fav) => (
              <button
                key={fav.num}
                onClick={() => {
                  const surah = QURAN_SURAHS.find((s) => s.number === fav.num);
                  if (surah) handleSelectSurah(surah);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#E8F2E9] hover:bg-[#C9DEC9] text-[#426B4B] font-bold shrink-0 transition-colors cursor-pointer border border-[#C9DEC9]"
              >
                سورة {fav.name}
              </button>
            ))}
          </div>

          {/* Surahs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredSurahs.map((surah) => {
              const isCurrentBookmark = lastRead?.surahNumber === surah.number;
              return (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => handleSelectSurah(surah)}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                    isCurrentBookmark
                      ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                      : 'bg-white border-[#E5E5E5] hover:border-[#426B4B] hover:bg-[#FDFEFE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-7 h-7 rounded-xl bg-[#E8F2E9] group-hover:bg-[#426B4B] group-hover:text-white text-[#426B4B] text-[11px] font-black flex items-center justify-center shrink-0 transition-colors">
                      {surah.number}
                    </span>
                    <div className="overflow-hidden">
                      <h4 className="text-xs sm:text-sm font-black text-[#5B3C43] truncate font-heading">
                        سورة {surah.name}
                      </h4>
                      <p className="text-[10px] text-[#7A5B64] font-medium">
                        {surah.numberOfAyahs} آية • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </p>
                    </div>
                  </div>

                  {isCurrentBookmark && (
                    <BookmarkCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Surah Reading View */}
      {selectedSurah && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Reading Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#E8F2E9]/60 border border-[#C9DEC9]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSurah(null);
                  setSurahData(null);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5F5F5] text-[#5B3C43] text-xs font-bold transition-all border border-[#C9DEC9] cursor-pointer shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>قائمة السور</span>
              </button>

              <div className="flex items-center gap-2 pr-2">
                <h4 className="text-base sm:text-lg font-black text-[#426B4B] font-heading">
                  سورة {selectedSurah.name}
                </h4>
                <span className="text-[11px] font-bold text-[#7A5B64] bg-white px-2 py-0.5 rounded-md border border-[#C9DEC9]">
                  {selectedSurah.numberOfAyahs} آية
                </span>
                <span className="text-[11px] font-bold text-[#7A5B64] bg-white px-2 py-0.5 rounded-md border border-[#C9DEC9]">
                  {selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </div>
            </div>

            {/* Font scaling and Bookmark Controls */}
            <div className="flex items-center gap-2">
              {/* Font Size Selector */}
              <div className="flex items-center bg-white rounded-xl border border-[#C9DEC9] p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    fontSize === 'normal' ? 'bg-[#426B4B] text-white' : 'text-[#7A5B64] hover:text-[#2A2A2A]'
                  }`}
                  title="خط عادي"
                >
                  صغير
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    fontSize === 'large' ? 'bg-[#426B4B] text-white' : 'text-[#7A5B64] hover:text-[#2A2A2A]'
                  }`}
                  title="خط متوسط"
                >
                  متوسط
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    fontSize === 'xlarge' ? 'bg-[#426B4B] text-white' : 'text-[#7A5B64] hover:text-[#2A2A2A]'
                  }`}
                  title="خط كبير"
                >
                  كبير
                </button>
              </div>

              {/* Bookmark Button */}
              <button
                type="button"
                onClick={() => saveBookmark(selectedSurah.number, selectedSurah.name, 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold transition-all border border-amber-300 shadow-xs cursor-pointer"
                title="حفظ علامة القراءة الحالية"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">حفظ علامة</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#426B4B] animate-spin" />
              <p className="text-xs font-bold text-[#7A5B64]">جاري تحميل آيات سورة {selectedSurah.name} بالرسم العثماني...</p>
            </div>
          )}

          {/* Error State */}
          {errorMessage && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-rose-700">{errorMessage}</p>
              <button
                type="button"
                onClick={() => fetchSurah(selectedSurah.number)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* Verses Quran Display */}
          {!isLoading && surahData && (
            <div className="bg-[#FAFDFB] border border-[#C9DEC9] rounded-3xl p-6 sm:p-10 space-y-6 shadow-xs">
              {/* Surah Header Ornamental Banner */}
              <div className="text-center border-b border-[#E8F2E9] pb-6 space-y-3">
                <div className="inline-block px-8 py-2 rounded-2xl bg-[#E8F2E9] border border-[#C9DEC9] shadow-xs">
                  <h2 className="text-xl sm:text-3xl font-black text-[#426B4B] font-heading">
                    ﴿ سُورَةُ {selectedSurah.name} ﴾
                  </h2>
                </div>
                
                {/* Basmalah (displayed for all surahs except Surah 9 At-Tawbah) */}
                {selectedSurah.number !== 9 && (
                  <p className="text-lg sm:text-2xl font-black text-[#5B3C43] pt-3 font-arabic select-none tracking-wide">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                )}
              </div>

              {/* Verses Flow Container */}
              <div className={`font-arabic text-[#2A2A2A] text-justify ${getFontSizeClass()} select-text`} dir="rtl">
                {surahData.ayahs.map((ayah) => {
                  // For Surah 1, if Basmalah is already the first ayah, or in other surahs where API prepends basmalah to Ayah 1:
                  let cleanText = ayah.text;
                  if (selectedSurah.number !== 1 && selectedSurah.number !== 9 && ayah.numberInSurah === 1) {
                    cleanText = cleanText.replace(/^(﻿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*|بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*)/, '');
                  }

                  const isBookmarkedAyah =
                    lastRead?.surahNumber === selectedSurah.number &&
                    lastRead?.ayahNumber === ayah.numberInSurah;

                  return (
                    <span
                      key={ayah.number}
                      className={`inline transition-colors hover:text-[#426B4B] cursor-pointer group ${
                        isBookmarkedAyah ? 'bg-amber-100/70 rounded-md px-1' : ''
                      }`}
                      onClick={() => saveBookmark(selectedSurah.number, selectedSurah.name, ayah.numberInSurah)}
                      title={`انقر لحفظ العلامة عند الآية ${ayah.numberInSurah}`}
                    >
                      <span>{cleanText} </span>
                      {/* Ayah End Ornamental Marker */}
                      <span className="inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-full bg-[#E8F2E9] text-[#426B4B] text-xs font-mono font-black border border-[#C9DEC9] select-none hover:bg-amber-100 hover:text-amber-800 transition-colors">
                        ﴿{ayah.numberInSurah}﴾
                      </span>{' '}
                    </span>
                  );
                })}
              </div>

              {/* Next / Prev Surah Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-[#E8F2E9] text-xs font-bold">
                {selectedSurah.number > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const prev = QURAN_SURAHS.find((s) => s.number === selectedSurah.number - 1);
                      if (prev) handleSelectSurah(prev);
                    }}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white hover:bg-[#E8F2E9] text-[#5B3C43] border border-[#C9DEC9] cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السورة السابقة</span>
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={() => saveBookmark(selectedSurah.number, selectedSurah.name, selectedSurah.numberOfAyahs)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#426B4B] text-white hover:bg-[#34553B] cursor-pointer shadow-xs transition-colors"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>أتممت قراءة السورة</span>
                </button>

                {selectedSurah.number < 114 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = QURAN_SURAHS.find((s) => s.number === selectedSurah.number + 1);
                      if (next) handleSelectSurah(next);
                    }}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white hover:bg-[#E8F2E9] text-[#5B3C43] border border-[#C9DEC9] cursor-pointer transition-colors"
                  >
                    <span>السورة التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : <div />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
