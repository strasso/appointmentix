import React from "react";
import * as Icons from "lucide-react";

export interface RewardRedemptionScreenProps {
  state: string;
}

/**
 * States:
 * - default: Sufficient points, button active.
 * - insufficientPoints: Not enough points, button disabled.
 */
const RewardRedemptionScreen: React.FC<RewardRedemptionScreenProps> = ({ state }) => {
  const isInsufficient = state === 'insufficientPoints';
  const userBalance = isInsufficient ? 2450 : 7500;
  const cost = 5000;

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-24">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10]">
        <div className="flex items-center gap-4">
          <button className="text-[#F0F0EE]">
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[20px]">Prämie einlösen</h1>
        </div>
      </header>

      <main className="flex-1 px-6 pt-8 flex flex-col items-center">
        <div className="w-full max-w-sm">
          {/* Reward Visual */}
          <div className="w-full h-48 bg-[#18181B] rounded-[20px] border border-[#C8A97E20] flex flex-col items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent"></div>
            <Icons.Gift className="w-16 h-16 text-[#C8A97E] mb-3 relative z-10" />
            <h2 className="font-['Cormorant_Garamond'] font-semibold text-[24px] text-[#F0F0EE] relative z-10">
              Gratis Massage
            </h2>
          </div>

          {/* Cost vs Balance */}
          <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] p-6 mb-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#C8A97E10]">
              <span className="font-['Manrope'] text-[13px] text-[#8A8A8D]">Kosten</span>
              <span className="font-['Manrope'] font-bold text-[20px] text-[#C8A97E]">{cost} Pkt</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-['Manrope'] text-[13px] text-[#8A8A8D]">Ihr Guthaben</span>
              <span className={`font-['Manrope'] font-bold text-[20px] ${isInsufficient ? 'text-[#FF6B6B]' : 'text-[#F0F0EE]'}`}>{userBalance} Pkt</span>
            </div>
            
            {/* Progress Bar */}
            {isInsufficient && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['Manrope'] text-[12px] text-[#8A8A8D]">Fortschritt zum Ziel</span>
                  <span className="font-['Manrope'] text-[12px] text-[#C8A97E]">{Math.round((userBalance / cost) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-[#0A0A0C] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C8A97E40] to-[#C8A97E] rounded-full transition-all"
                    style={{ width: `${(userBalance / cost) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <h3 className="font-['Manrope'] font-semibold text-[16px] text-[#F0F0EE] mb-2">
              {isInsufficient ? 'Nicht genug Punkte' : 'Bereit zum Einlösen'}
            </h3>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] leading-relaxed">
              {isInsufficient 
                ? `Sie benötigen noch ${cost - userBalance} Punkte, um diese Prämie freizuschalten.`
                : 'Nach dem Einlösen erhalten Sie einen Gutscheincode, den Sie an der Rezeption vorzeigen können.'}
            </p>
          </div>

          {/* Action Button */}
          <button 
            disabled={isInsufficient}
            className={`w-full font-['Manrope'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 transition-all ${isInsufficient ? 'bg-[#18181B] text-[#A0A0A0] cursor-not-allowed border border-[#C8A97E10]' : 'bg-[#F0F0EE] text-[#0A0A0C] hover:bg-[#EADBC6] shadow-[0_0_20px_rgba(240,240,238,0.1)]'}`}
          >
            {isInsufficient ? (
              <>Nicht genug Punkte</>
            ) : (
              <>Jetzt einlösen <Icons.ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default RewardRedemptionScreen;