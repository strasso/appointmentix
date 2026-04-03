import React from "react";
import * as Icons from "lucide-react";

export interface ScanScreenProps {
  state: string;
}

/**
 * States:
 * - default: QR Code visible.
 * - manualId: Manual alphanumeric ID visible.
 */
const ScanScreen: React.FC<ScanScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col items-center justify-center px-6">
      
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 bg-[#C8A97E15] rounded-full flex items-center justify-center mb-8">
          <Icons.QrCode className="w-10 h-10 text-[#C8A97E]" />
        </div>

        <h1 className="font-['Cormorant_Garamond'] font-light text-[28px] text-[#F0F0EE] mb-3">
          Check-in Code
        </h1>
        <p className="font-['Manrope'] font-medium text-[14px] text-[#A8A8AB] text-center mb-10 max-w-[250px]">
          Zeigen Sie diesen Code an der Rezeption für Check-in oder Bezahlung.
        </p>

        {/* QR Container */}
        <div className={`relative p-6 bg-white rounded-2xl mb-8 shadow-[0_0_50px_rgba(200,169,126,0.15)] transition-all duration-500 ${state === 'manualId' ? 'opacity-0 scale-90 absolute' : 'opacity-100 scale-100'}`}>
          {/* Mock QR Pattern with Finder Patterns */}
          <div className="w-48 h-48 bg-black relative">
            {/* Finder Pattern - Top Left */}
            <div className="absolute top-3 left-3 w-10 h-10 border-4 border-white rounded-sm">
              <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-sm">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-sm"></div>
              </div>
            </div>
            {/* Finder Pattern - Top Right */}
            <div className="absolute top-3 right-3 w-10 h-10 border-4 border-white rounded-sm">
              <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-sm">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-sm"></div>
              </div>
            </div>
            {/* Finder Pattern - Bottom Left */}
            <div className="absolute bottom-3 left-3 w-10 h-10 border-4 border-white rounded-sm">
              <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-sm">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-sm"></div>
              </div>
            </div>
            {/* Random data pattern */}
            <div className="w-full h-full flex flex-wrap p-1 gap-0.5">
              {[...Array(180)].map((_, i) => (
                <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>
              ))}
            </div>
          </div>
          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <Icons.Sparkles className="w-full h-full text-[#0A0A0C]" />
            </div>
          </div>
        </div>

        {/* Manual ID Container */}
        <div className={`w-full relative transition-all duration-500 mb-8 ${state === 'manualId' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-[#18181B] border border-[#C8A97E20] rounded-xl p-6 text-center">
            <p className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-3">Manuelle ID</p>
            <p className="font-['Manrope'] font-mono text-[24px] text-[#F0F0EE] tracking-widest mb-2 select-all">
              8392-1024-ABCD
            </p>
            <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">Für den Fall, dass der Scanner nicht funktioniert.</p>
          </div>
        </div>

        {/* Toggle Button */}
        <button className="mt-4 mb-4 flex items-center gap-2 text-[#C8A97E] font-['Manrope'] text-[13px] font-medium hover:underline transition-opacity duration-300">
          {state === 'default' ? (
            <>ID anzeigen statt Code <Icons.Keyboard className="w-4 h-4" /></>
          ) : (
            <>Code anzeigen statt ID <Icons.QrCode className="w-4 h-4" /></>
          )}
        </button>
      </div>
      
      {/* Bottom spacer to prevent overlap with fixed nav */}
      <div className="h-24"></div>
      
      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[#C8A97E10] z-40 pb-8 pt-3">
        <div className="flex justify-around items-center px-2">
          <button className="text-[#8A8A8D]"><Icons.Home className="w-6 h-6" /></button>
          <button className="text-[#8A8A8D]"><Icons.ShoppingBag className="w-6 h-6" /></button>
          <button className="relative -top-4 p-4 bg-[#C8A97E] rounded-full text-[#0A0A0C] shadow-[0_0_20px_rgba(200,169,126,0.3)]"><Icons.ScanLine className="w-7 h-7" /></button>
          <button className="text-[#8A8A8D]"><Icons.Award className="w-6 h-6" /></button>
          <button className="text-[#8A8A8D]"><Icons.User className="w-6 h-6" /></button>
        </div>
      </nav>
    </div>
  );
};

export default ScanScreen;