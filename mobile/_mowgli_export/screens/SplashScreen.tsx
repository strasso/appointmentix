import React from "react";
import * as Icons from "lucide-react";

export interface SplashScreenProps {
  state: string;
}

/**
 * States:
 * - default: Logo display with subtle loading animation while session check happens.
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(200,169,126,0.08)_0%,_rgba(10,10,12,1)_70%)] pointer-events-none"></div>
      
      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Stylized Logo Icon */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-[#C8A97E] blur-[60px] opacity-20 rounded-full animate-pulse"></div>
          <Icons.Sparkles className="w-20 h-20 text-[#C8A97E] relative z-10" />
        </div>
        
        {/* Brand Name */}
        <h1 className="font-['Cormorant_Garamond'] font-light text-[42px] text-[#F0F0EE] tracking-wide mb-2">
          Curabo
        </h1>
        
        {/* Tagline */}
        <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] tracking-[0.2em] uppercase">
          Experience Luxury
        </p>
      </div>

      {/* Elegant Loading Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="w-32 h-[2px] bg-[#18181B] rounded-full overflow-hidden">
          <div className="h-full bg-[#C8A97E] w-1/3 rounded-full animate-[shimmer_2s_infinite_linear]"></div>
        </div>
        <span className="font-['Manrope'] text-[11px] text-[#8A8A8D]">Loading Experience...</span>
      </div>
    </div>
  );
};

export default SplashScreen;