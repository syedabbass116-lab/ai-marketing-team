import React from "react";
import logo from "../../../logo.png";

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Cooking your first post...",
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fadeIn overflow-hidden pointer-events-none">
      <div className="relative w-28 h-28 mb-4 animate-logo-pulse">
        <img
          src={logo}
          alt="Ghostwrites Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="text-white/60 text-sm font-medium animate-pulse tracking-wide">
        {message}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .animate-logo-pulse {
          animation: logo-pulse 2s ease-in-out infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default LoadingOverlay;
