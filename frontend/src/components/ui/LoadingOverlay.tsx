import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Cooking your first post...", 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl animate-fadeIn overflow-hidden">
      <div className="relative w-32 h-32 mb-6">
        <img 
          src="/ChefDoodle.png" 
          alt="Chef Doodle" 
          className="w-full h-full object-contain animate-bounce-slow"
        />
      </div>

      <div className="text-white/60 text-sm font-medium animate-pulse tracking-wide">
        {message}
      </div>

      <div className="mt-4 flex gap-1.5">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default LoadingOverlay;
