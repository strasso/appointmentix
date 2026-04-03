import React from "react";
import * as Icons from "lucide-react";

export interface TimeSlotSelectionScreenProps {
  state: string;
}

/**
 * States:
 * - default: Date and time selection available.
 * - slotSelected: A specific time slot is selected, summary visible.
 */
const TimeSlotSelectionScreen: React.FC<TimeSlotSelectionScreenProps> = ({ state }) => {
  const isSelected = state === 'slotSelected';

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-32">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10]">
        <div className="flex items-center gap-4">
          <button className="text-[#F0F0EE] flex items-center">
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[20px] leading-none">Termin wählen</h1>
        </div>
        <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] ml-10 mt-1">Hydra Glow Facial</p>
      </header>

      <main className="flex-1 px-6 pt-6">
        {/* Date Selector */}
        <div className="mb-8">
          <h2 className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">Oktober 2023</h2>
          <div className="flex justify-between gap-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, idx) => (
              <button 
                key={day} 
                className={`flex flex-col items-center justify-center w-12 h-16 rounded-[12px] border transition-all ${idx === 2 ? 'bg-[#C8A97E] border-[#C8A97E] text-[#0A0A0C]' : 'bg-[#18181B] border-[#C8A97E20] text-[#F0F0EE]'}`}
              >
                <span className="text-[10px] uppercase font-bold mb-1">{day}</span>
                <span className="text-[16px] font-semibold">{12 + idx}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h2 className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">Verfügbare Zeiten</h2>
          <div className="grid grid-cols-3 gap-3">
            {['09:00', '10:30', '11:00', '13:00', '14:30', '15:00', '16:00'].map((time) => (
              <button 
                key={time}
                className={`py-3 rounded-[10px] border font-['Manrope'] text-[14px] font-medium transition-all ${time === '14:30' && isSelected ? 'bg-[#C8A97E] border-[#C8A97E] text-[#0A0A0C]' : 'bg-[#18181B] border-[#C8A97E20] text-[#F0F0EE] hover:border-[#C8A97E]'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-[#18181B] border border-[#C8A97E10] rounded-[12px] flex items-start gap-3">
          <Icons.Info className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
          <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] leading-relaxed">
            Der Behandler wird von der Klinik basierend auf der Verfügbarkeit zugewiesen.
          </p>
        </div>

        {/* Selection Prompt (shown when no slot selected) */}
        {!isSelected && (
          <div className="mt-8 text-center py-8">
            <p className="font-['Manrope'] text-[14px] text-[#C8A97E60]">
              Bitte wählen Sie einen Zeitfenster
            </p>
          </div>
        )}
      </main>

      {/* Sticky Bottom Summary */}
      {isSelected && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#18181B] border-t border-[#C8A97E20] p-6 pb-8 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] uppercase tracking-wider">Auswahl</p>
              <p className="font-['Manrope'] text-[16px] text-[#F0F0EE] font-semibold">Mi, 14. Okt • 14:30</p>
            </div>
            <div className="text-right">
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] uppercase tracking-wider">Preis</p>
              <p className="font-['Manrope'] text-[20px] text-[#C8A97E] font-semibold">89€</p>
            </div>
          </div>
          <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors flex items-center justify-center gap-2">
            Bestätigen <Icons.ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelectionScreen;