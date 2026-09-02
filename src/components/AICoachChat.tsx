import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  MessageSquare,
  Plus,
  Menu,
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
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: ChatAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
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
  const navigate = useNavigate();
  const location = useLocation();
  const titleInfo = getTitleInfo(userIdentity);
  const studentName = userIdentity?.name || 'يا بطل';
  const collegeName = goal?.targetTitle || userIdentity?.collegeName || 'كلية الأحلام والقمة';

  const [selectedMode, setSelectedMode] = useState<AICapabilityMode>('all');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateWelcomeMessage = (): ChatMessage[] => {
    const hasRealGoal = goal?.targetTitle || userIdentity?.collegeName;
    const goalText = hasRealGoal ? `\n\n✨ هدفك بالوصول إلى (${collegeName}) يستحق كل سعي.` : '';
    return [
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `أهلاً بك يا ${titleInfo.formalTitle}! أنا **الرفيق** 🎓🤖\n\nأنا مساعدك الأكاديمي والروحي الموثوق لتحقيق التفوق.\n\nيمكنك سؤالي عن أي موضوع دراسي (رياضيات، برمجة، علوم، إلخ)، طلب شرح لمفهوم معين، المساعدة في الواجبات، أو حتى طلب نصيحة حول تنظيم وقتك.${goalText}\n\nكيف يمكنني مساعدتك الآن؟ 🚀`,
        timestamp: Date.now(),
      }
    ];
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_chat_sessions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_chat_sessions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_chat_sessions_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].messages;
      }
    } catch {}
    return generateWelcomeMessage();
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();

    const hasUserMsg = messages.some(m => m.role === 'user');
    if (!hasUserMsg) return;

    setSessions(prevSessions => {
      let updatedSessions = [...prevSessions];
      
      if (!currentSessionId) {
        const newId = `session-${Date.now()}`;
        const titleMatch = messages.find(m => m.role === 'user')?.text || '';
        const title = titleMatch.slice(0, 40) + (titleMatch.length > 40 ? '...' : '');
        
        const newSession: ChatSession = {
          id: newId,
          title: title || 'محادثة جديدة',
          updatedAt: Date.now(),
          messages: messages
        };
        updatedSessions.unshift(newSession);
        setCurrentSessionId(newId);
      } else {
        const idx = updatedSessions.findIndex(s => s.id === currentSessionId);
        if (idx !== -1) {
          updatedSessions[idx] = {
            ...updatedSessions[idx],
            updatedAt: Date.now(),
            messages: messages
          };
          const [updatedSession] = updatedSessions.splice(idx, 1);
          updatedSessions.unshift(updatedSession);
        } else {
          const titleMatch = messages.find(m => m.role === 'user')?.text || '';
          const title = titleMatch.slice(0, 40) + (titleMatch.length > 40 ? '...' : '');
          updatedSessions.unshift({
            id: currentSessionId,
            title: title || 'محادثة',
            updatedAt: Date.now(),
            messages: messages
          });
        }
      }

      if (updatedSessions.length > 25) {
        updatedSessions = updatedSessions.slice(0, 25);
      }

      try {
        localStorage.setItem('thanaweya_chat_sessions_v1', JSON.stringify(updatedSessions));
      } catch (e) {
        console.error('Failed to save chat sessions', e);
      }

      return updatedSessions;
    });
  }, [messages, currentSessionId]);

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
      console.log('Sending chat request to /api/chat...');
      
      let response;
      let retries = 2; // Maximum 2 retries (3 attempts total)
      
      while (retries >= 0) {
        response = await fetch('/api/chat', {
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
              stage: userIdentity?.stage || 'secondary',
              track: userIdentity?.track,
              grade: userIdentity?.grade,
              gradeLabel: userIdentity?.gradeLabel,
              goalTitle: goal?.targetTitle,
              collegeName: collegeName,
              currentMode: selectedMode,
            },
          }),
        });
        
        // Backend now returns 503 if Gemini throws 503, but just in case we also check 500 with text
        const isErrorStatus = response.status === 503 || response.status === 500 || response.status === 429;
        
        if (isErrorStatus && retries > 0) {
          const clone = response.clone();
          const errorText = await clone.text().catch(() => '');
          
          if (response.status === 503 || response.status === 429 || errorText.includes('503') || errorText.includes('UNAVAILABLE') || errorText.includes('high demand') || errorText.includes('quota')) {
            const delay = retries === 2 ? 2000 : 4000;
            console.log(`Received overloaded error, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
            continue;
          }
        }
        
        break;
      }

      if (!response) {
        throw new Error('NO_RESPONSE');
      }

      console.log('Chat API response status:', response.status);

      // Read response body as raw text first to avoid uncaught JSON parse crashes
      const rawText = await response.text();

      if (!response.ok) {
        console.error('Chat API Error - Status:', response.status, 'Body:', rawText);
        
        if (response.status === 503 || response.status === 429 || rawText.includes('503') || rawText.includes('UNAVAILABLE') || rawText.includes('high demand') || rawText.includes('quota')) {
          throw new Error('503_ERROR');
        }

        // Try extracting custom message from JSON response if present
        try {
          const parsedErr = JSON.parse(rawText);
          if (parsedErr.message) {
            throw new Error(`SERVER_MSG: ${parsedErr.message}`);
          }
        } catch (e: any) {
          if (e.message?.startsWith('SERVER_MSG:') || e.message === '503_ERROR') {
            throw e;
          }
        }

        throw new Error(`SERVER_STATUS_${response.status}`);
      }

      // Safely parse JSON from the 200 OK response
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse chat response as JSON. Raw body was:', rawText);
        throw new Error('INVALID_JSON_RESPONSE');
      }

      if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        const botReplyText: string = data.reply.trim();
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: botReplyText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error('Chat API returned 200 but no valid reply field:', data);
        throw new Error('EMPTY_REPLY');
      }
    } catch (err: any) {
      console.error('Backend API chat error:', err);
      
      let errorMessage = "عذراً، يبدو أن هناك تعثر مؤقت في استلام الرد. يرجى إعادة إرسال رسالتك، وسأكون معك فوراً! 🌟";
      
      if (err.message === '503_ERROR') {
        errorMessage = "الخادم يواجه ضغطاً كبيراً حالياً، يرجى المحاولة مرة أخرى بعد ثوانٍ معدودة 🙏";
      } else if (err.message === 'INVALID_JSON_RESPONSE' || err.message === 'EMPTY_REPLY') {
        errorMessage = "حدث تعثر غير متوقع أثناء معالجة الرد من الذكاء الاصطناعي. جرب إرسال الرسالة مرة أخرى وسيجيبك المساعد فوراً!";
      } else if (err.message?.startsWith('SERVER_MSG:')) {
        const customMsg = err.message.replace('SERVER_MSG:', '').trim();
        if (customMsg && !customMsg.includes('JSON') && !customMsg.includes('<') && !customMsg.includes('{')) {
          errorMessage = customMsg;
        }
      }
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: errorMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages(generateWelcomeMessage());
    setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const initialPromptRef = useRef(false);

  useEffect(() => {
    if (location.state?.initialPrompt && !initialPromptRef.current) {
      initialPromptRef.current = true;
      const prompt = location.state.initialPrompt;
      
      // Delay slightly to ensure component is fully mounted before triggering send
      setTimeout(() => {
        handleSendMessage(prompt);
      }, 100);
      
      // Clean the state right away to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


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
                الرفيق
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
            onClick={() => setShowHistory(!showHistory)}
            title="سجل المحادثات"
            className={`p-2 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-2 ${showHistory ? 'bg-[#D15F70] text-white' : 'hover:bg-[#F5F5F5] text-[#6B6B6B] hover:text-[#2A2A2A]'}`}
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={startNewChat}
            title="محادثة جديدة"
            className="p-2 hover:bg-[#F5F5F5] rounded-xl text-[#6B6B6B] hover:text-[#2A2A2A] transition-colors cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
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

      {showHistory ? (
        <div className="flex-1 overflow-y-auto px-2 py-4 sm:p-5 space-y-3 bg-slate-50/50 bg-white/40">
          <h4 className="text-sm font-bold text-[#2A2A2A] mb-4">سجل المحادثات</h4>
          {sessions.length === 0 ? (
            <div className="text-center text-xs text-[#6B6B6B] mt-10">
              لا توجد محادثات سابقة بعد
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => loadSession(session)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${currentSessionId === session.id ? 'border-[#D15F70] bg-pink-50' : 'border-[#E5E5E5] bg-white hover:bg-[#F5F5F5]'}`}
              >
                <div className="text-sm font-bold text-[#2A2A2A] truncate mb-1">
                  {session.title}
                </div>
                <div className="text-[10px] text-[#6B6B6B] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(session.updatedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
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
          // Clean display text from internal tags and fix LaTeX syntax errors (like double subscripts)
          let cleanText = msg.text
            .replace(/\[FLASHCARDS\][\s\S]*?\[\/FLASHCARDS\]/g, '')
            .replace(/\[WEEKLY_CERTIFICATE\][\s\S]*?\[\/WEEKLY_CERTIFICATE\]/g, '')
            .replace(/\[DAILY_ACHIEVEMENT\][\s\S]*?\[\/DAILY_ACHIEVEMENT\]/g, '')
            .trim();
          
          let prevText;
          do {
            prevText = cleanText;
            cleanText = cleanText.replace(/_([a-zA-Z0-9]|\{[^}]*\})_/g, '_$1{}_');
            cleanText = cleanText.replace(/\^([a-zA-Z0-9]|\{[^}]*\})\^/g, '^$1{}^');
          } while (cleanText !== prevText);

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
                className={`min-w-0 max-w-[calc(100%-2.25rem)] sm:max-w-[85%] px-3 py-2.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words [word-break:break-word] overflow-x-auto ${
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
                <div dir="auto" className="prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:p-2 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-a:text-pink-600 prose-a:underline">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[[rehypeKatex, { strict: false }]]}
                  >
                    {cleanText || msg.text}
                  </ReactMarkdown>
                </div>
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
            <span>الرفيق يحلل المحتوى ويعد الشرح والحل العملي… ✍️</span>
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
      </>
      )}

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
