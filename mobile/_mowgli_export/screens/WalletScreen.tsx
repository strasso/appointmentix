import React from "react";
import * as Icons from "lucide-react";

export interface WalletScreenProps {
  state: string;
}

/**
 * States:
 * - vouchersTab: Active vouchers list.
 * - rewardsTab: Redeemed rewards list.
 */
const WalletScreen: React.FC<WalletScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-24">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30">
        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[28px] text-[#F0F0EE] mb-6">
          Wallet
        </h1>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#C8A97E20]">
          <button className={`pb-3 text-[15px] font-medium transition-colors ${state === 'vouchersTab' ? 'text-[#C8A97E] border-b-2 border-[#C8A97E]' : 'text-[#A1A1A6]'}`}>
            Gutscheine
          </button>
          <button className={`pb-3 text-[15px] font-medium transition-colors ${state === 'rewardsTab' ? 'text-[#C8A97E] border-b-2 border-[#C8A97E]' : 'text-[#A1A1A6]'}`}>
            Rewards
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-4">
        {state === 'vouchersTab' ? (
          <>
            {/* Voucher Card 1 */}
            <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E30] overflow-hidden relative">
              <div className="p-5 border-b border-dashed border-[#C8A97E20] flex justify-between items-start">
                <div>
                  <p className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-1">Wertgutschein</p>
                  <h3 className="font-['Cormorant_Garamond'] font-semibold text-[20px] text-[#F0F0EE]">100€</h3>
                  <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">Gültig bis: 31.12.2024</p>
                </div>
                <div className="bg-[#C8A97E] text-[#0A0A0C] text-[10px] font-bold px-2 py-1 rounded uppercase">
                  Aktiv
                </div>
              </div>
              <div className="p-6 bg-[#0A0A0C] flex flex-col items-center justify-center">
                {/* Mock QR with Finder Patterns */}
                <div className="w-32 h-32 bg-white p-2 rounded-lg mb-2 relative overflow-hidden">
                  <div className="w-full h-full relative">
                    {/* Top Left Finder */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-black"></div>
                    </div>
                    {/* Top Right Finder */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-black"></div>
                    </div>
                    {/* Bottom Left Finder */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-black"></div>
                    </div>
                    {/* Random Noise */}
                    <div className="flex flex-wrap content-center gap-[2px] p-8 opacity-50">
                      {[...Array(32)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-['Manrope'] text-[11px] text-[#8A8A8D]">Code: GOLD-100-XYZ</p>
              </div>
            </div>

            {/* Voucher Card 2 */}
            <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E30] overflow-hidden relative">
              <div className="p-5 border-b border-dashed border-[#C8A97E20] flex justify-between items-start">
                <div>
                  <p className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-1">Behandlung</p>
                  <h3 className="font-['Cormorant_Garamond'] font-semibold text-[20px] text-[#F0F0EE]">Hydra Glow</h3>
                  {/* Updated date to future to reflect "Active" status */}
                  <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">Gültig bis: 15.11.2025</p>
                </div>
                <div className="bg-[#C8A97E] text-[#0A0A0C] text-[10px] font-bold px-2 py-1 rounded uppercase">
                  Aktiv
                </div>
              </div>
              <div className="p-6 bg-[#0A0A0C] flex flex-col items-center justify-center">
                 <div className="w-32 h-32 bg-white p-2 rounded-lg mb-2 relative overflow-hidden">
                  <div className="w-full h-full relative">
                    {/* Top Left Finder */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-black"></div>
                    </div>
                    {/* Top Right Finder */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-black"></div>
                    </div>
                    {/* Bottom Left Finder */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-black"></div>
                    </div>
                    {/* Random Noise */}
                    <div className="flex flex-wrap content-center gap-[2px] p-8 opacity-50">
                      {[...Array(32)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-['Manrope'] text-[11px] text-[#8A8A8D]">Code: TRT-HYD-123</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Active Reward moved to top */}
            <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E30] p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#C8A97E10] rounded-full flex items-center justify-center">
                  <Icons.Percent className="w-6 h-6 text-[#C8A97E]" />
                </div>
                <div>
                  <h3 className="font-['Manrope'] font-medium text-[16px] text-[#F0F0EE]">10% Rabatt</h3>
                  <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">Gültig bis: 30. Nov</p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-center">
                <span className="block font-['Manrope'] text-[10px] uppercase font-bold text-[#C8A97E] mb-1 tracking-wide">Code</span>
                <span className="font-['Manrope'] font-mono text-[14px] text-[#F0F0EE] leading-none">SAVE10</span>
              </div>
            </div>

            {/* Used Reward moved to bottom */}
            <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E10] p-5 flex justify-between items-center opacity-60 grayscale">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0A0A0C] rounded-full flex items-center justify-center">
                  <Icons.Coffee className="w-6 h-6 text-[#8A8A8D]" />
                </div>
                <div>
                  <h3 className="font-['Manrope'] font-medium text-[16px] text-[#F0F0EE]">Kaffee & Snack</h3>
                  <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">Eingelöst am 12. Okt</p>
                </div>
              </div>
              <span className="font-['Manrope'] text-[11px] uppercase font-bold text-[#8A8A8D] border border-[#8A8A8D] px-2 py-1 rounded">
                Verbraucht
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WalletScreen;