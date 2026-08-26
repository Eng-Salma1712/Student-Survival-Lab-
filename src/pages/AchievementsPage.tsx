import React from 'react';
import { PageContainer } from '../components/PageContainer';
import { GamificationWidget } from '../components/GamificationWidget';
import { AchievementsModal } from '../components/AchievementsModal';
import { UserPersonalizationWidget } from '../components/UserPersonalizationWidget';
import { GamificationState, UserIdentity } from '../types';

interface AchievementsPageProps {
  gamification: GamificationState;
  userIdentity: UserIdentity | null;
  onSaveIdentity: (identity: UserIdentity) => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ gamification, userIdentity, onSaveIdentity }) => {
  const [isAchievementsOpen, setIsAchievementsOpen] = React.useState(false);

  return (
    <PageContainer title="الملف الشخصي والنقاط">
      <div className="space-y-6">
        <UserPersonalizationWidget identity={userIdentity} onSaveIdentity={onSaveIdentity} />
        
        <GamificationWidget
          gamification={gamification}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
        />
        
        {/* We just show the button here or inline the modal logic for a dedicated page */}
        <div className="flex justify-center pt-4">
          <button 
            onClick={() => setIsAchievementsOpen(true)}
            className="btn-secondary px-8 py-3"
          >
            عرض سجل الإنجازات والأوسمة
          </button>
        </div>
        
        {isAchievementsOpen && (
          <AchievementsModal 
            gamification={gamification} 
            onClose={() => setIsAchievementsOpen(false)} 
          />
        )}
      </div>
    </PageContainer>
  );
};
