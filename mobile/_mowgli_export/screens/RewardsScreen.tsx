import React from "react";
import * as Icons from "lucide-react";

export interface RewardsScreenProps {
  state: string;
}

/**
 * States:
 * - default: Balance, Catalog, and History visible.
 */
const RewardsScreen: React.FC<RewardsScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-32">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 bg-[#0A0A0C]">
        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[28px] text-[#F0F0EE] mb-1">
          Rewards
        </h1>
        <p className="font-['Manrope'] text-[13px] text-[#8A8A8D]">
          Verdienen & Einlösen
        </p>
      </header>

      <main className="flex-1 px-6 space-y-6 overflow-y-auto">
        {/* Balance Card */}
        <section className="relative bg-[#18181B] rounded-[20px] border border-[#C8A97E40] p-8 overflow-hidden shadow-[inset_0_0_30px_rgba(200,169,126,0.06)]">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#C8A97E] blur-[80px] opacity-10"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#C8A97E] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(200,169,126,0.4)]">
              <Icons.Crown className="w-6 h-6 text-[#0A0A0C]" />
            </div>
            <p className="font-['Manrope'] text-[12px] uppercase tracking-widest text-[#C8A97E] mb-2">Ihr Punktestand</p>
            <h2 className="font-['Manrope'] font-bold text-[48px] text-[#F0F0EE] tracking-tight">
              2,450
            </h2>
            <div className="mt-4 px-4 py-1.5 bg-[#C8A97E10] rounded-full border border-[#C8A97E20]">
              <span className="font-['Manrope'] text-[11px] text-[#C8A97E]">1€ = 1 Punkt</span>
            </div>
          </div>
        </section>

        {/* Available Rewards */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-['Cormorant_Garamond'] font-light text-[24px] text-[#F0F0EE]">
              Verfügbar
            </h3>
            <button className="text-[#C8A97E] text-xs font-['Manrope'] font-medium">Alle</button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pr-4 scrollbar-hide">
            {/* Reward Card 1 */}
            <div className="shrink-0 w-36 bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden">
              <div className="h-28 bg-[#0A0A0C] flex items-center justify-center">
                <Icons.Coffee className="w-10 h-10 text-[#C8A97E]" />
              </div>
              <div className="p-3">
                <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE] mb-2">Kaffee & Snack</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['Manrope'] font-bold text-[16px] text-[#C8A97E]">500</span>
                  <span className="font-['Manrope'] text-[10px] text-[#8A8A8D]">Pkt</span>
                </div>
                <div className="w-full h-1.5 bg-[#0A0A0C] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C8A97E] rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="font-['Manrope'] text-[10px] text-[#C8A97E] mt-1.5">Einlösbar</p>
              </div>
            </div>

            {/* Reward Card 2 */}
            <div className="shrink-0 w-36 bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden">
              <div className="h-28 bg-[#0A0A0C] flex items-center justify-center">
                <Icons.Percent className="w-10 h-10 text-[#C8A97E]" />
              </div>
              <div className="p-3">
                <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE] mb-2">10% Gutschein</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['Manrope'] font-bold text-[16px] text-[#C8A97E]">1000</span>
                  <span className="font-['Manrope'] text-[10px] text-[#8A8A8D]">Pkt</span>
                </div>
                <div className="w-full h-1.5 bg-[#0A0A0C] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C8A97E] rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="font-['Manrope'] text-[10px] text-[#C8A97E] mt-1.5">Einlösbar</p>
              </div>
            </div>
            
            {/* Reward Card 3 */}
            <div className="shrink-0 w-36 bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden">
              <div className="h-28 bg-[#0A0A0C] flex items-center justify-center">
                <Icons.Lamp className="w-10 h-10 text-[#C8A97E]" />
              </div>
              <div className="p-3">
                <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE] mb-2">Gratis Massage</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['Manrope'] font-bold text-[16px] text-[#C8A97E]">5000</span>
                  <span className="font-['Manrope'] text-[10px] text-[#8A8A8D]">Pkt</span>
                </div>
                <div className="w-full h-1.5 bg-[#0A0A0C] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C8A97E] rounded-full" style={{ width: '49%' }}></div>
                </div>
                <p className="font-['Manrope'] text-[10px] text-[#8A8A8D] mt-1.5">2,450 / 5,000</p>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="relative">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-['Cormorant_Garamond'] font-light text-[24px] text-[#F0F0EE]">
              Historie
            </h3>
            <button className="flex items-center gap-1 text-[#C8A97E] text-xs font-['Manrope'] font-medium">
              Alle
              <Icons.ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#18181B] rounded-[12px] border border-[#C8A97E10]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C8A97E10] flex items-center justify-center text-[#C8A97E]">
                  <Icons.Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-['Manrope'] text-[14px] text-[#F0F0EE]">Kauf: Hydra Glow</p>
                  <p className="font-['Manrope'] text-[11px] text-[#8A8A8D]">Heute, 14:30</p>
                </div>
              </div>
              <span className="font-['Manrope'] font-bold text-[14px] text-[#C8A97E]">+89</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#18181B] rounded-[12px] border border-[#C8A97E10]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ff4d4d10] flex items-center justify-center text-[#ff4d4d]">
                  <Icons.Minus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-['Manrope'] text-[14px] text-[#F0F0EE]">Einlösung: Kaffee</p>
                  <p className="font-['Manrope'] text-[11px] text-[#8A8A8D]">Gestern, 10:00</p>
                </div>
              </div>
              <span className="font-['Manrope'] font-bold text-[14px] text-[#ff4d4d]">-500</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[#C8A97E10] z-40 pb-8 pt-3">
        <div className="flex justify-around items-center px-2">
          <button className="text-[#8A8A8D]"><Icons.Home className="w-6 h-6" /></button>
          <button className="text-[#8A8A8D]"><Icons.ShoppingBag className="w-6 h-6" /></button>
          <button className="relative -top-4 p-4 bg-[#C8A97E15] rounded-full border border-[#C8A97E20] text-[#C8A97E]"><Icons.ScanLine className="w-7 h-7" /></button>
          <button className="text-[#C8A97E]"><Icons.Award className="w-6 h-6" /></button>
          <button className="text-[#8A8A8D]"><Icons.User className="w-6 h-6" /></button>
        </div>
      </nav>
    </div>
  );
};

export default RewardsScreen;