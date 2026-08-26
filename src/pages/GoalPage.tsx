import React from 'react';
import { PageContainer } from '../components/PageContainer';
import { GoalWidget } from '../components/GoalWidget';
import { StudentGoal, UserIdentity } from '../types';

interface GoalPageProps {
  goal: StudentGoal | null;
  onSaveGoal: (goal: StudentGoal) => void;
  userIdentity: UserIdentity | null;
}

export const GoalPage: React.FC<GoalPageProps> = ({ goal, onSaveGoal, userIdentity }) => {
  return (
    <PageContainer title="الهدف والعداد التنازلي">
      <GoalWidget
        goal={goal}
        onSaveGoal={onSaveGoal}
        userIdentity={userIdentity}
      />
    </PageContainer>
  );
};
