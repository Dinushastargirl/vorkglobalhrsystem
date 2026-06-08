import React from 'react';
import { Coffee } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  return (
    <div className={`relative flex items-center justify-center bg-blue-50 text-blue-600 rounded-full shadow-sm border border-blue-100 ${containerSizes[size]} ${className}`}>
      <Coffee size={iconSizes[size]} strokeWidth={2.5} />
    </div>
  );
}
