import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassPanel = ({ children, className = "" }: GlassPanelProps) => {
    return (
        <div className={`glass-panel overflow-hidden ${className}`}>
            {children}
        </div>
    );
};
