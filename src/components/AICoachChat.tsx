import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIdentity, StudentGoal, ChatAttachment } from '../types';
import {
  Send,
  Bot,
  ArrowRight,
  User,
  Sparkles,
  RefreshCw,
  X,
  Zap,
  Flame,
  BookOpen,
  HelpCircle,
  Heart,
  Brain,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Layers,
  Award,
  Trash2,
  UploadCloud,
  FileUp,
} from 'lucide-react';
import { getTitleInfo } from './UserPersonalizationWidget';
import { useToast } from '../context/ToastContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: ChatAttachment[];
}

interface AICoachChatProps {
  userIdentity?: UserIdentity | null;
  goal?: StudentGoal | null;
  isOpen?: boolean;
  onClose?: () => void;
  isFloatingDrawer?: boolean;
}

type AICapabilityMode = 'all' | 'files' | 'support';

const CAPABILITY_MODES: { id: AICapabilityMode; label: string; icon: any; color: string; desc: string }[] = [
  {
    id: 'files',
    label: 'تحليل ملف / صورة 📎',
    icon: FileText,
    color: 'bg-[#D15F70] text-white',
    desc: 'تحليل مذكرات PDF وصور المسائل واستخراج الملاحظات والحلول',
  },
  {
    id: 'support',
    label: 'دعم نفسي وروحي 💖',
    icon: Heart,
    color: 'bg-pink-500 text-white',
    desc: 'توجيه نفسي، أذكار، وتحفيز للتعامل مع التوتر والقلق',
  },
];

const MODE_PROMPTS: Record<AICapabilityMode, { text: string; label: string }[]> = {
  all: [
    { text: 'حاسس بإرهاق وفقدان شغف ومش قادر أكمل مذاكرة.. ساعدني وفكرني بهدفي', label: '💖 دعم نفسي وروحي' },
  ],
  files: [
    { text: 'أرفقت لك ملف/صورة.. يرجى تلخيص النقاط الأساسية وحل الأسئلة الموجودة خطوة بخطوة', label: '📄 تلخيص وحل' },
    { text: 'استخرج من هذه الصورة أهم القوانين والملاحظات في شكل جدول ونقاط', label: '📑 استخراج الملاحظات' },
    { text: 'اشرح لي المفهوم الموجود في هذه الصورة بأسلوب مبسط جداً وأمثلة من الحياة', label: '💡 تبسيط المفهوم' },
  ],
  support: [
    { text: 'خايف جداً ومتوتر من النتيجة وفقدت الثقة في نفسي.. طمني بآيات وأحاديث مهدئة', label: '😟 خوف وتوتر' },
    { text: 'مش قادر أركز وكل ما أفتح الكتاب بمسك الموبايل.. أعمل إيه لاستعادة صفاء ذهني؟', label: '📱 التشتت بالموبايل' },
    { text: 'فكرني بهدفي وليه بتعب، الكلية تستاهل كل التضحية دي؟', label: '🎯 تذكير بحلم الكلية' },
  ],
};


export const AICoachChat: React.FC<AICoachChatProps> = ({
  userIdentity,
  goal,
  isOpen = true,
  onClose,
  isFloatingDrawer = false,
}) => {
  const titleInfo = getTitleInfo(userIdentity);
  const studentName = userIdentity?.name || 'يا بطل';
  const collegeName = goal?.targetTitle || userIdentity?.collegeName || 'كلية الأحلام والقمة';

  const [selectedMode, setSelectedMode] = useState<AICapabilityMode>('all');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_ai_coach_chat_history_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: `أهلاً بك يا ${titleInfo.formalTitle}! أنا **Student Survival AI** 🎓🤖\n\nأنا مساعدك الأكاديمي والروحي الموثوق لتحقيق التفوق.\n\nيمكنك سؤالي عن أي موضوع دراسي (رياضيات، برمجة، علوم، إلخ)، طلب شرح لمفهوم معين، المساعدة في الواجبات، أو حتى طلب نصيحة حول تنظيم وقتك.\n\n✨ هدفك بالوصول إلى (${collegeName}) يستحق كل سعي.\n\nكيف يمكنني مساعدتك الآن؟ 🚀`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('thanaweya_ai_coach_chat_history_v2', JSON.stringify(messages));
    } catch {
      // ignore
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle File Selection
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Check file size (limit 15MB for preview)
      if (file.size > 15 * 1024 * 1024) {
        toast(`الملف "${file.name}" حجمه كبير جداً. الحد الأقصى المسموح 15 ميجابايت.`, 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newAttachment: ChatAttachment = {
          name: file.name,
          mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          data: base64Data,
          size: file.size,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if ((!textToSend && attachments.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend || (attachments.length > 0 ? 'يرجى تحليل هذه الملفات/الصور المرفقة واستخراج الشرح والحلول والملاحظات المنظمة.' : ''),
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customText) setInputText('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
            attachments: m.attachments,
          })),
          studentContext: {
            name: studentName,
            gender: userIdentity?.gender || 'female',
            goalTitle: goal?.targetTitle,
            collegeName: collegeName,
            currentMode: selectedMode,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      if (data.reply) {
        const botReplyText: string = data.reply;
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: botReplyText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('No reply in response');
      }
    } catch (err) {
      console.warn('Backend API chat error:', err);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: 'عذراً، يبدو أن هناك مشكلة مؤقتة في الاتصال. يرجى المحاولة مرة أخرى.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      text: `أهلاً بك يا ${titleInfo.formalTitle} من جديد! أنا **Student Survival AI** مساعدك الأكاديمي والروحي الشامل.\n\nأنا هنا للإجابة على أي سؤال دراسي، أو شرح المفاهيم المعقدة، أو المساعدة في التخطيط. كيف يمكنني مساعدتك الآن؟ 🚀`,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);
  };


  if (!isOpen) return null;

  const currentPromptSuggestions = MODE_PROMPTS[selectedMode] || MODE_PROMPTS.all;

  const content = (
    <div
      className="flex flex-col h-[100dvh] sm:h-full w-full bg-white sm:border border-slate-200 dark:border-[#E5E5E5] rounded-none sm:rounded-3xl shadow-sm overflow-hidden text-slate-800 text-[#2A2A2A] font-sans dir-rtl"
      dir="rtl"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(e.dataTransfer.files);
      }}
    >
      {/* Header */}
      <div className="bg-white text-[#2A2A2A] px-3 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shrink-0 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="sm:hidden p-2 -mr-2 rounded-xl text-[#6B6B6B] hover:bg-[#F5F5F5] transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-[#D15F70] flex items-center justify-center font-bold text-[#2A2A2A] shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight font-heading">
                Student Survival AI
              </h3>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#9E4D68] border border-[#E5E5E5] truncate max-w-[150px]">
                المساعد الأكاديمي والروحي الشامل
              </span>
            </div>
            <p className="text-[#6B6B6B] text-[11px] font-medium">
              مساعد ذكي لشرح الدروس والتحفيز وتخطيط المذاكرة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Tools Action Shortcuts */}
          <button
            type="button"
            onClick={handleClearChat}
            title="مسح المحادثة وبدء حوار جديد"
            className="p-2 hover:bg-[#F5F5F5] rounded-xl text-[#6B6B6B] hover:text-[#2A2A2A] transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F5] rounded-xl text-[#6B6B6B] hover:text-[#2A2A2A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Capability Mode Filter Bar */}
      <div className="bg-slate-50 dark:bg-[#FAFAFA]/80 border-b border-slate-200 dark:border-[#E5E5E5] px-2 sm:px-3 py-2 flex items-center gap-1.5 flex-wrap shrink-0">
        <button
          type="button"
          onClick={() => setSelectedMode('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedMode === 'all'
              ? 'bg-[#FFFFFF] text-[#2A2A2A] border border-[#E5E5E5] shadow-2xs'
              : 'bg-white bg-white text-slate-600 dark:text-[#6B6B6B] border border-slate-200 dark:border-[#E5E5E5] hover:border-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>الكل</span>
        </button>

        {CAPABILITY_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSelectedMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#D15F70] text-white shadow-2xs'
                  : 'bg-white bg-white text-slate-600 dark:text-[#6B6B6B] border border-slate-200 dark:border-[#E5E5E5] hover:border-pink-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="p-4 bg-pink-50 dark:bg-pink-950/80 border-2 border-dashed border-pink-500 rounded-2xl mx-4 my-2 text-center text-xs font-black text-pink-600 dark:text-pink-300 flex items-center justify-center gap-2">
          <UploadCloud className="w-5 h-5 animate-bounce" />
          <span>أفلت ملف الـ PDF أو صورة المسألة هنا لتحليلها فوراً!</span>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto px-2 py-4 sm:p-5 space-y-4 bg-slate-50/50 bg-white/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          // Clean display text from internal tags
          const cleanText = msg.text
            .replace(/\[FLASHCARDS\][\s\S]*?\[\/FLASHCARDS\]/g, '')
            .replace(/\[WEEKLY_CERTIFICATE\][\s\S]*?\[\/WEEKLY_CERTIFICATE\]/g, '')
            .replace(/\[DAILY_ACHIEVEMENT\][\s\S]*?\[\/DAILY_ACHIEVEMENT\]/g, '')
            .trim();

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
            >
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 text-[#2A2A2A] font-bold shadow-2xs ${
                  isUser ? 'bg-[#F5F5F5] dark:bg-slate-700' : 'bg-[#D15F70]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>

              <div
                className={`min-w-0 max-w-[calc(100%-2.25rem)] sm:max-w-[85%] px-3 py-2.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap break-words [word-break:break-word] overflow-x-auto ${
                  isUser
                    ? 'bg-[#D15F70] text-white rounded-tl-none font-sans shadow-2xs'
                    : 'bg-white bg-[#F5F5F5] text-slate-800 text-[#2A2A2A] border border-slate-200 dark:border-[#E5E5E5] rounded-tr-none shadow-2xs'
                }`}
              >
                {/* User Attachment Previews */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-pink-400/40 dark:border-[#E5E5E5]">
                    {msg.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-xl bg-pink-700/60 text-[#2A2A2A] text-[11px] font-bold flex items-center gap-1.5"
                      >
                        {att.mimeType.includes('pdf') ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5" />
                        )}
                        <span className="truncate max-w-[140px]">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Body */}
                <div>{cleanText || msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 font-bold ${
                    isUser ? 'text-pink-100 text-left' : 'text-[#6B6B6B] text-right'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs font-extrabold text-pink-600 dark:text-pink-400 animate-pulse">
            <div className="w-8 h-8 rounded-2xl bg-[#D15F70] text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>Student Survival AI يحلل المحتوى ويعد الشرح والحل العملي… ✍️</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Current Pending Attachments Previews */}
      {attachments.length > 0 && (
        <div className="px-2 sm:px-4 py-2.5 bg-pink-50/70 dark:bg-[#FAFAFA] border-t border-pink-200 dark:border-[#E5E5E5] flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-[11px] font-black text-pink-700 dark:text-pink-300 shrink-0">
            الملفات المرفقة ({attachments.length}):
          </span>
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-white bg-[#F5F5F5] border border-pink-200 dark:border-[#E5E5E5] text-xs font-bold text-slate-800 dark:text-[#2A2A2A] flex items-center gap-2 shadow-2xs shrink-0"
            >
              {att.mimeType.includes('pdf') ? (
                <FileText className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
              )}
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-[#6B6B6B] hover:text-rose-500 transition-colors p-0.5"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div className="px-2 sm:px-4 py-2 bg-slate-50 dark:bg-[#FAFAFA] border-t border-slate-200 dark:border-[#E5E5E5] flex items-center gap-1.5 flex-wrap shrink-0">
        <span className="text-[11px] font-black text-[#6B6B6B] dark:text-[#6B6B6B] shrink-0">اقتراحات:</span>
        {currentPromptSuggestions.map((sugg) => (
          <button
            key={sugg.label}
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage(sugg.text)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white bg-[#F5F5F5] text-slate-700 dark:text-[#6B6B6B] border border-slate-200 dark:border-[#E5E5E5] hover:border-pink-300 hover:text-pink-600 dark:hover:text-pink-300 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
          >
            {sugg.label}
          </button>
        ))}
      </div>

      {/* Input Form with Attachment Buttons */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 sm:p-4 bg-white border-t border-slate-200 dark:border-[#E5E5E5] flex items-center gap-2 shrink-0"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Upload File / PDF / Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="إرفاق صورة مسألة أو مذكرة PDF"
          className="p-2.5 rounded-xl bg-slate-100 bg-[#F5F5F5] hover:bg-pink-50 dark:hover:bg-slate-700 text-slate-600 dark:text-[#6B6B6B] hover:text-pink-600 transition-all cursor-pointer border border-slate-200 dark:border-[#E5E5E5] shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب استفسارك، موضوع متراكم للإنقاذ، اطلب فلاش كاردز أو كويز، أو اسأل عن ملفك المرفق..."
          disabled={isLoading}
          className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 bg-[#F5F5F5] border border-slate-200 dark:border-[#E5E5E5] rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-[#2A2A2A] placeholder:text-[#6B6B6B] focus:outline-hidden focus:ring-2 focus:ring-pink-500"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
          className="px-5 py-2.5 bg-[#D15F70] hover:bg-[#B94C5C] text-[#2A2A2A] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer shrink-0"
        >
          <span>إرسال</span>
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>

      {/* Modals */}
    </div>
  );

  if (isFloatingDrawer) {
    return (
      <div className="fixed bottom-4 left-4 sm:left-6 z-50 w-[94vw] sm:w-[480px] h-[600px] max-h-[88vh] animate-in slide-in-from-bottom-5 duration-300">
        {content}
      </div>
    );
  }

  return content;
};
