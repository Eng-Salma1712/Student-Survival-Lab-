import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 font-sans dir-rtl animate-in fade-in duration-300">
      <div className="flex items-center gap-4 border-b border-[#E5E5E5] pb-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#6B6B6B] transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-[#2A2A2A] font-heading">{title}</h1>
      </div>
      
      {children}
    </div>
  );
};
