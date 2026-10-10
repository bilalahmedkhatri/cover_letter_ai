import React, { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  leftPane: ReactNode;
  rightPane: ReactNode;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ leftPane, rightPane }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto items-start">
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        {leftPane}
      </div>
      <div className="w-full lg:w-1/2 lg:sticky lg:top-24 flex flex-col gap-6">
        {rightPane}
      </div>
    </div>
  );
};

export default WorkspaceLayout;
