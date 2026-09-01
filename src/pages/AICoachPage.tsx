import React from 'react';
import { PageContainer } from '../components/PageContainer';
import { AICoachChat } from '../components/AICoachChat';
import { StudentGoal, UserIdentity } from '../types';

interface AICoachPageProps {
  userIdentity: UserIdentity | null;
  goal: StudentGoal | null;
}

export const AICoachPage: React.FC<AICoachPageProps> = ({ userIdentity, goal }) => {
  const content = <AICoachChat userIdentity={userIdentity} goal={goal} />;

  return (
    <>
      {/* Mobile: Full Screen */}
      <div className="sm:hidden fixed inset-0 z-[100] bg-white flex flex-col w-full h-[100dvh] overflow-hidden animate-in fade-in duration-300">
        {content}
      </div>

      {/* Desktop: Card inside PageContainer */}
      <div className="hidden sm:block">
        <PageContainer title="الرفيق">
          <div className="h-[calc(100vh-13rem)] w-full flex flex-col">
            {content}
          </div>
        </PageContainer>
      </div>
    </>
  );
};
