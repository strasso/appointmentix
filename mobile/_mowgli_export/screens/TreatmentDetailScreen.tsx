import React from "react";
import * as Icons from "lucide-react";

export interface TreatmentDetailScreenProps {
  state: string;
}

/**
 * States:
 * - default: Full details visible.
 */
const TreatmentDetailScreen: React.FC<TreatmentDetailScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] pb-52">
      {/* Image Header */}
      <div className="relative h-[350px] w-full">
        <img 
          src="./images/treatment-facial.jpg" 
          alt="Hydra Glow Facial Treatment close up" 
          data-context="Treatment Detail Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-black/50"></div>
        
        {/* Top Nav Overlay */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-6 flex justify-between items-center">
          <button className="w-10 h-10 rounded-full bg-[#18181B]/50 backdrop-blur-md flex items-center justify-center border border-[#C8A97E20] text-[#F0F0EE]">
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#18181B]/50 backdrop-blur-md flex items-center justify-center border border-[#C8A97E20] text-[#F0F0EE]">
            <Icons.Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[32px] text-[#F0F0EE] leading-tight max-w-[70%]">
            Hydra Glow Facial
          </h1>
          <div className="text-right">
            <span className="block font-['Manrope'] font-semibold text-[28px] text-[#C8A97E]">89€</span>
            <span className="font-['Manrope'] text-[12px] text-[#8A8A8D]">pro Sitzung</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-3 mb-8">
          <span className="px-3 py-1 rounded-full border border-[#C8A97E30] text-[#C8A97E] text-[11px] uppercase font-bold tracking-wider flex items-center gap-2">
            <Icons.Clock className="w-3 h-3 flex-shrink-0" /> 60 Min
          </span>
          <span className="px-3 py-1 rounded-full border border-[#C8A97E30] text-[#C8A97E] text-[11px] uppercase font-bold tracking-wider flex items-center gap-2">
            <Icons.Sparkles className="w-3 h-3 flex-shrink-0" /> Gesicht
          </span>
        </div>

        {/* Description */}
        <div className="space-y-6 mb-10">
          <section>
            <h2 className="font-['Manrope'] font-semibold text-[16px] text-[#F0F0EE] mb-3">Beschreibung</h2>
            <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] leading-relaxed">
              Erleben Sie die ultimative Hydratation mit unserem Signature Hydra Glow Facial. Diese Behandlung reinigt, exfoliert und extrahiert gleichzeitig, während sie die Haut mit intensiven Seren nährt.
            </p>
          </section>
          
          <section>
            <h2 className="font-['Manrope'] font-semibold text-[16px] text-[#F0F0EE] mb-3">Vorteile</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <Icons.Check className="w-5 h-5 text-[#C8A97E] shrink-0 mt-0.5" />
                <span className="font-['Manrope'] text-[14px] text-[#8A8A8D]">Sofortiger Glow-Effekt</span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.Check className="w-5 h-5 text-[#C8A97E] shrink-0 mt-0.5" />
                <span className="font-['Manrope'] text-[14px] text-[#8A8A8D]">Reduzierung feiner Linien</span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.Check className="w-5 h-5 text-[#C8A97E] shrink-0 mt-0.5" />
                <span className="font-['Manrope'] text-[14px] text-[#8A8A8D]">Tiefenreinigung der Poren</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/90 backdrop-blur-lg border-t border-[#C8A97E10] p-6 pb-8 z-40">
        <div className="flex gap-4">
          <button className="flex-1 bg-[#18181B]/90 border border-[#C8A97E50] text-[#F0F0EE] font-['Manrope'] font-semibold text-[15px] py-4 rounded-full hover:bg-[#C8A97E15] transition-colors flex items-center justify-center gap-2">
            <Icons.ShoppingBag className="w-4 h-4" />
            In den Warenkorb
          </button>
          <button className="flex-1 bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(240,240,238,0.15)]">
            Jetzt buchen
          </button>
        </div>
        <button className="w-full text-[#C8A97E] font-['Manrope'] text-[13px] font-medium mt-3 py-2 flex items-center justify-center gap-2">
          <Icons.Gift className="w-4 h-4" />
          Als Gutschein kaufen
        </button>
      </div>
    </div>
  );
};

export default TreatmentDetailScreen;