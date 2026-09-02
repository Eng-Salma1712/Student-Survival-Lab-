import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/PageContainer';
import { AICoachChat } from '../components/AICoachChat';
import { StudentGoal, UserIdentity } from '../types';

interface AICoachPageProps {
  userIdentity: UserIdentity | null;
  goal: StudentGoal | null;
}

export const AICoachPage: React.FC<AICoachPageProps> = ({ userIdentity, goal }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const content = <AICoachChat userIdentity={userIdentity} goal={goal} />;

  if (isDesktop) {
    return (
      <PageContainer title="الرفيق">
        <div className="h-[calc(100vh-13rem)] w-full flex flex-col">
          {content}
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col w-full h-[100dvh] overflow-hidden animate-in fade-in duration-300">
      {content}
    </div>
  );
};




