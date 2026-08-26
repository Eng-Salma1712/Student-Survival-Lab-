import React, { useState } from 'react';
import { Layers, RotateCcw, ChevronRight, ChevronLeft, CheckCircle, XCircle, Sparkles, Shuffle, X, Plus } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCards?: Flashcard[];
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subject: 'الفيزياء الحديثة',
    front: 'ما هو التأثير الكهروضوئي (Photoelectric Effect) وبماذا فسره أينشتاين؟',
    back: 'ظاهرة انبعاث إلكترونات من سطح معدن عند سقوط ضوء ذي تردد مناسب عليه (أكبر من أو يساوي التردد الحرج). فسره أينشتاين بافتراض أن الضوء يتكون من فوتونات طاقة كل منها E = h·ν.',
    category: 'مفاهيم جوهرية',
  },
  {
    id: 'fc-2',
    subject: 'الكيمياء العضوية',
    front: 'ما هي قاعدة ماركونيكوف (Markovnikov Rule)؟',
    back: 'عند إضافة متفاعل غير متماثل (مثل H-X) إلى ألكين غير متماثل، فإن الشق الموجب (H) يُضاف إلى ذرة الكربون غير المشبعة الحاملة لعدد أكبر من ذرات الهيدروجين، بينما يُضاف الشق السالب (X) إلى ذرة الكربون الحاملة لعدد أقل.',
    category: 'قواعد هامة',
  },
  {
    id: 'fc-3',
    subject: 'الأحياء / علم الوراثة',
    front: 'ما الفرق بين كودون البدء وكودون الوقف في تخليق البروتين؟',
    back: 'كودون البدء هو (AUG) ويشفر للحمض الأميني ميثيونين. بينما كودونات الوقف هي (UAA, UAG, UGA) ولا تشفر لأي حمض أميني بل يرتبط بها عامل الإطلاق لإنهاء تخليق سلسلة عديد الببتيد.',
    category: 'مقارنات',
  },
  {
    id: 'fc-4',
    subject: 'قواعد النحو العربي',
    front: 'متى يجب تقديم الخبر على المبتدأ وجوباً؟',
    back: '1. إذا كان الخبر من أسماء الصدارة (كأسماء الاستفهام: أين، متى).\n2. إذا كان الخبر شبه جملة والمبتدأ نكرة محضة.\n3. إذا اتصل بالمبتدأ ضمير يعود على بعض الخبر.\n4. إذا كان الخبر مقصوراً على المبتدأ (إنما في البيت عليٌّ).',
    category: 'نحو',
  },
  {
    id: 'fc-5',
    subject: 'تقنيات المذاكرة والإنقاذ',
    front: 'ما هو قانون باريتو (80/20) في مراجعة ليلة الامتحان؟',
    back: '80% من أسئلة الامتحانات تأتي من 20% من المفاهيم الأساسية الأكثر تكراراً ونماذج الوزارة السابقة. ركز أولاً على هذه الـ 20% لتضمن أعلى نسبة تحصيل في أقل وقت.',
    category: 'استراتيجيات إنقاذ',
  },
];

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  initialCards,
}) => {
  if (!isOpen) return null;

  const [cards, setCards] = useState<Flashcard[]>(() => {
    return (initialCards && initialCards.length > 0) ? initialCards : DEFAULT_FLASHCARDS;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [needsReviewIds, setNeedsReviewIds] = useState<string[]>([]);

  const currentCard = cards[currentIndex % cards.length];
  const isMastered = masteredIds.includes(currentCard?.id);
  const isNeedsReview = needsReviewIds.includes(currentCard?.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const toggleMastered = () => {
    if (!currentCard) return;
    if (isMastered) {
      setMasteredIds((prev) => prev.filter((id) => id !== currentCard.id));
    } else {
      setMasteredIds((prev) => [...prev, currentCard.id]);
      setNeedsReviewIds((prev) => prev.filter((id) => id !== currentCard.id));
    }
  };

  const toggleNeedsReview = () => {
    if (!currentCard) return;
    if (isNeedsReview) {
      setNeedsReviewIds((prev) => prev.filter((id) => id !== currentCard.id));
    } else {
      setNeedsReviewIds((prev) => [...prev, currentCard.id]);
      setMasteredIds((prev) => prev.filter((id) => id !== currentCard.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAFAFA]/75 backdrop-blur-sm animate-in fade-in duration-200 dir-rtl" dir="rtl">
      <div className="bg-white bg-white border border-slate-200 dark:border-[#E5E5E5] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-[#FAFAFA] border-b border-slate-200 dark:border-[#E5E5E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-[#2A2A2A]">
                بطاقات المراجعة السريعة (Flashcards)
              </h3>
              <p className="text-[11px] text-[#6B6B6B] dark:text-[#6B6B6B]">
                بطاقة {currentIndex + 1} من أصل {cards.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              className="p-2 rounded-xl bg-white bg-[#F5F5F5] text-slate-600 dark:text-[#6B6B6B] border border-slate-200 dark:border-[#E5E5E5] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="خلط عشوائي"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خلط</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#6B6B6B] hover:text-slate-700 dark:hover:text-[#2A2A2A] hover:bg-slate-200/50 dark:hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-5 bg-slate-50/50 dark:bg-[#FAFAFA]/40">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 bg-[#F5F5F5] h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* Interactive Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[220px] sm:min-h-[260px] bg-white bg-[#F5F5F5] border-2 border-purple-200 dark:border-purple-900/60 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between relative group select-none"
          >
            {/* Top Category Badge */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {currentCard?.subject || 'مراجعة عامة'} • {currentCard?.category || 'بطاقة ذكية'}
              </span>

              <span className="text-[11px] font-bold text-[#6B6B6B] group-hover:text-purple-600 transition-colors flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'عرض السؤال' : 'انقر لكشف الإجابة'}</span>
              </span>
            </div>

            {/* Content Front / Back */}
            <div className="py-4 text-center">
              {!isFlipped ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">❓ السؤال / المفهوم:</div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#2A2A2A] leading-relaxed">
                    {currentCard?.front}
                  </h4>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">💡 الإجابة والتوضيح:</div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 text-[#2A2A2A] leading-relaxed whitespace-pre-wrap">
                    {currentCard?.back}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status Indicator */}
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6B6B6B] pt-2 border-t border-slate-100 dark:border-[#E5E5E5]">
              <span>{isFlipped ? '✨ الوجه الخلفي' : '🔍 الوجه الأمامي'}</span>
              {isMastered && <span className="text-emerald-600 font-extrabold">✓ تم إتقانها</span>}
              {isNeedsReview && <span className="text-amber-600 font-extrabold">⚠️ بحاجة مراجعة</span>}
            </div>
          </div>

          {/* Action Buttons: Mastery & Navigation */}
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleNeedsReview}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isNeedsReview
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                    : 'bg-white bg-[#F5F5F5] text-slate-600 dark:text-[#6B6B6B] border-slate-200 dark:border-[#E5E5E5] hover:border-amber-400'
                }`}
              >
                <XCircle className="w-4 h-4 text-amber-500" />
                <span>أحتاج مراجعتها</span>
              </button>

              <button
                type="button"
                onClick={toggleMastered}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isMastered
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                    : 'bg-white bg-[#F5F5F5] text-slate-600 dark:text-[#6B6B6B] border-slate-200 dark:border-[#E5E5E5] hover:border-emerald-400'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>أتقنتها تماماً</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-white bg-[#F5F5F5] text-slate-700 dark:text-[#6B6B6B] border border-slate-200 dark:border-[#E5E5E5] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-2xs"
                title="التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
