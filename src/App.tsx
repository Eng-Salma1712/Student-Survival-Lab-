import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentGoal, GamificationState, Badge, StudySession, UserIdentity, DiagnosisResult } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { DailyAssessmentPage } from './pages/DailyAssessmentPage';
import { SubjectsLessonsPage } from './pages/SubjectsLessonsPage';
import { StudySchedulePage } from './pages/StudySchedulePage';
import { GoalPage } from './pages/GoalPage';
import { AICoachPage } from './pages/AICoachPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SpiritualPage } from './pages/SpiritualPage';
import { StudyPlanProvider } from './context/StudyPlanContext';
import { ToastProvider } from './context/ToastContext';
import { LayoutModeProvider, useLayoutMode } from './context/LayoutModeContext';
import {
  INITIAL_GAMIFICATION_STATE,
  checkStreakOnLoad,
  processCompletedSession,
} from './utils/gamification';

export default function App() {
  const [currentResult, setCurrentResult] = useState<DiagnosisResult | null>(null);

  const [identity, setIdentity] = useState<UserIdentity | null>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_user_identity');
      return saved
        ? JSON.parse(saved)
        : {
            name: 'سلمى',
            gender: 'female',
            category: 'medicine',
            collegeName: 'كلية الطب البشري',
            stage: 'secondary',
            track: 'scientific',
            grade: 'sec_3',
            gradeLabel: 'الصف الثالث الثانوي (الثانوية العامة)',
          };
    } catch {
      return {
        name: 'سلمى',
        gender: 'female',
        category: 'medicine',
        collegeName: 'كلية الطب البشري',
        stage: 'secondary',
        track: 'scientific',
        grade: 'sec_3',
        gradeLabel: 'الصف الثالث الثانوي (الثانوية العامة)',
      };
    }
  });

  const [unlockedEvent, setUnlockedEvent] = useState<{ badges: Badge[]; pointsEarned: number; bonusPoints: number; } | null>(null);

  const [gamification, setGamification] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_gamification_state');
      if (saved) return checkStreakOnLoad(JSON.parse(saved));
      return INITIAL_GAMIFICATION_STATE;
    } catch {
      return INITIAL_GAMIFICATION_STATE;
    }
  });

  const [goal, setGoal] = useState<StudentGoal | null>(() => {
    try {
      const saved = localStorage.getItem('thanaweya_student_goal');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [history, setHistory] = useState<DiagnosisResult[]>(() => {
    try {
      const saved = localStorage.getItem('study_engine_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => { if (identity) localStorage.setItem('thanaweya_user_identity', JSON.stringify(identity)); }, [identity]);
  useEffect(() => { localStorage.setItem('study_engine_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { if (goal) localStorage.setItem('thanaweya_student_goal', JSON.stringify(goal)); }, [goal]);
  useEffect(() => { localStorage.setItem('thanaweya_gamification_state', JSON.stringify(gamification)); }, [gamification]);

  const handleSaveGoal = (newGoal: StudentGoal) => setGoal(newGoal);

  const handleSessionCompleted = (session: StudySession) => {
    const isDifficult = currentResult?.inputsSummary?.difficultSubjects?.includes(session.subject) || false;
    const { updatedState, pointsEarned, bonusPoints, newlyUnlockedBadges } = processCompletedSession(gamification, session, isDifficult);
    setGamification(updatedState);
    
    fetch('/api/notifications/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'session_completed', metadata: { subject: session.subject, duration: session.durationMinutes } })
    }).catch(console.error);

    setUnlockedEvent({ badges: newlyUnlockedBadges, pointsEarned, bonusPoints });
  };

  
const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { layoutMode } = useLayoutMode();
  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-[#5B3C43] font-sans antialiased selection:bg-[#DE5D83] selection:text-[#FFFFFF] flex flex-col dir-rtl relative overflow-x-hidden transition-all duration-300 mx-auto ${layoutMode === 'mobile' ? 'max-w-[414px] shadow-2xl border-x border-slate-200 bg-white' : layoutMode === 'desktop' ? 'min-w-[1024px] w-full bg-white' : 'w-full'}`} dir="rtl">
      {children}
    </div>
  );
};

  return (
    <ToastProvider>
      <LayoutModeProvider>
        <StudyPlanProvider>
          <AppContent>
          
          <Header userIdentity={identity} gamification={gamification} />

          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20 relative z-10">
            <Routes>
              <Route path="/" element={<Dashboard gamification={gamification} goal={goal} onSaveGoal={handleSaveGoal} history={history} currentResult={currentResult} userIdentity={identity} />} />
              <Route path="/assessment" element={<DailyAssessmentPage userIdentity={identity} history={history} currentResult={currentResult} />} />
              <Route path="/subjects" element={<SubjectsLessonsPage userIdentity={identity} />} />
              <Route path="/schedule" element={
                <StudySchedulePage 
                  currentResult={currentResult} 
                  setCurrentResult={setCurrentResult}
                  goal={goal}
                  userIdentity={identity}
                  onSessionCompleted={handleSessionCompleted}
                />
              } />
              <Route path="/goal" element={<GoalPage goal={goal} onSaveGoal={handleSaveGoal} userIdentity={identity} />} />
              <Route path="/coach" element={<AICoachPage userIdentity={identity} goal={goal} />} />
              <Route path="/spiritual" element={<SpiritualPage />} />
              <Route path="/achievements" element={<AchievementsPage gamification={gamification} />} />
              <Route path="/profile" element={
                <ProfilePage 
                  userIdentity={identity} 
                  onSaveIdentity={setIdentity}
                  goal={goal}
                  onSaveGoal={handleSaveGoal}
                />
              } />
            </Routes>
          </main>

          <BottomNav />
          </AppContent>
        </StudyPlanProvider>
      </LayoutModeProvider>
    </ToastProvider>
  );
}
