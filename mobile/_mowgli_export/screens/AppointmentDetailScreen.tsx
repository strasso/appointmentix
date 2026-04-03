import React from "react";
import * as Icons from "lucide-react";

export interface AppointmentDetailScreenProps {
  state: string;
}

/**
 * States:
 * - default: Detail view visible.
 * - rescheduleOverlay: Modal for picking new time.
 * - cancelOverlay: Modal for cancellation confirmation.
 */
const AppointmentDetailScreen: React.FC<AppointmentDetailScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col relative">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10] flex justify-between items-center">
        <button className="text-[#F0F0EE]">
          <Icons.ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[20px]">Termin Details</h1>
        <button className="text-[#F0F0EE]">
          <Icons.MoreVertical className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 px-6 py-8 space-y-8">
        {/* Treatment Info */}
        <section className="flex gap-5">
          <img 
            src="./images/treatment-facial.jpg" 
            alt="Facial" 
            className="w-24 h-24 rounded-xl object-cover border border-[#C8A97E20]" 
          />
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-['Cormorant_Garamond'] font-semibold text-[24px] text-[#F0F0EE] mb-2">
              Hydra Glow Facial
            </h2>
            <div className="flex items-center gap-4 text-[#8A8A8D] text-[13px]">
              <span className="flex items-center gap-1"><Icons.Clock className="w-3 h-3" /> 60 Min</span>
              <span className="flex items-center gap-1"><Icons.User className="w-3 h-3" /> Dr. Müller</span>
            </div>
          </div>
        </section>

        {/* Date & Time Card */}
        <section className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-2">Zeitpunkt</p>
              <p className="font-['Manrope'] text-[20px] font-bold text-[#F0F0EE]">Mittwoch, 14. Okt</p>
              <p className="font-['Manrope'] text-[16px] text-[#C8A97E] mt-1">14:30 Uhr</p>
            </div>
            <button className="p-2 bg-[#C8A97E10] rounded-lg text-[#C8A97E]">
              <Icons.CalendarPlus className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Location */}
        <section>
          <p className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-3">Standort</p>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#18181B] border border-[#C8A97E20] flex items-center justify-center shrink-0">
              <Icons.MapPin className="w-5 h-5 text-[#C8A97E]" />
            </div>
            <div>
              <p className="font-['Manrope'] font-medium text-[15px] text-[#F0F0EE]">Aesthetik Studio Berlin</p>
              <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] mb-3">Kurfürstendamm 123, 10719 Berlin</p>
              <button className="px-4 py-2 bg-[#C8A97E15] rounded-lg text-[#C8A97E] text-[13px] font-medium flex items-center gap-2 hover:bg-[#C8A97E25] transition-colors">
                <Icons.MapPin className="w-4 h-4" />
                In Maps öffnen
              </button>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="p-4 bg-[#18181B] border-l-2 border-[#C8A97E] rounded-r-[12px]">
          <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">
            "Bitte kommen Sie 10 Minuten früher für den Check-in."
          </p>
        </section>
      </main>

      {/* Action Buttons */}
      <div className="p-6 pb-24 bg-[#0A0A0C] border-t border-[#C8A97E10]">
        <div className="flex gap-4">
          <button className="flex-1 py-4 rounded-full border-2 border-[#C8A97E] text-[#C8A97E] font-['Manrope'] font-medium hover:bg-[#C8A97E15] transition-colors">
            Verschieben
          </button>
          <button className="flex-1 py-4 rounded-full border-2 border-[#ff4d4d] text-[#ff4d4d] font-['Manrope'] font-medium hover:bg-[#ff4d4d15] transition-colors">
            Stornieren
          </button>
        </div>
      </div>

      {/* Reschedule Overlay Mock */}
      {state === 'rescheduleOverlay' && (
        <div className="fixed inset-0 bg-[#0A0A0C] z-50 flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center pt-12 pb-4 px-6 border-b border-[#C8A97E10]">
            <h2 className="font-['Cormorant_Garamond'] text-[24px]">Neuen Termin wählen</h2>
            <button className="text-[#8A8A8D]"><Icons.X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Month selector */}
            <div className="flex justify-between items-center">
              <button className="text-[#C8A97E]"><Icons.ChevronLeft className="w-5 h-5" /></button>
              <h3 className="font-['Manrope'] font-semibold text-[16px]">Oktober 2024</h3>
              <button className="text-[#C8A97E]"><Icons.ChevronRight className="w-5 h-5" /></button>
            </div>
            
            {/* Calendar days grid */}
            <div className="grid grid-cols-7 gap-2 text-center">
              <span className="text-[11px] text-[#8A8A8D] font-medium">Mo</span>
              <span className="text-[11px] text-[#8A8A8D] font-medium">Di</span>
              <span className="text-[11px] text-[#8A8A8D] font-medium">Mi</span>
              <span className="text-[11px] text-[#8A8A8D] font-medium">Do</span>
              <span className="text-[11px] text-[#8A8A8D] font-medium">Fr</span>
              <span className="text-[11px] text-[#8A8A8D] font-medium">Sa</span>
              <span className="text-[11px] text-[#8A8A8D] font-medium">So</span>
              
              <span className="text-[13px] text-[#4A4A4D] py-2">30</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">1</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">2</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">3</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">4</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">5</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">6</span>
              
              <span className="text-[13px] text-[#F0F0EE] py-2">7</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">8</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">9</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">10</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">11</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">12</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">13</span>
              
              <span className="text-[13px] text-[#F0F0EE] py-2">14</span>
              <span className="text-[13px] bg-[#C8A97E] text-[#0A0A0C] font-semibold py-2 rounded-full">15</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">16</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">17</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">18</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">19</span>
              <span className="text-[13px] text-[#F0F0EE] py-2">20</span>
            </div>

            {/* Time slots */}
            <div>
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] mb-3">Verfügbare Zeiten</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="py-3 rounded-lg border border-[#C8A97E40] text-[#F0F0EE] text-[13px] font-medium hover:bg-[#C8A97E20] transition-colors">09:00</button>
                <button className="py-3 rounded-lg border border-[#C8A97E40] text-[#F0F0EE] text-[13px] font-medium hover:bg-[#C8A97E20] transition-colors">10:30</button>
                <button className="py-3 rounded-lg bg-[#C8A97E] text-[#0A0A0C] text-[13px] font-semibold">14:30</button>
                <button className="py-3 rounded-lg border border-[#C8A97E40] text-[#F0F0EE] text-[13px] font-medium hover:bg-[#C8A97E20] transition-colors">15:00</button>
                <button className="py-3 rounded-lg border border-[#C8A97E40] text-[#F0F0EE] text-[13px] font-medium hover:bg-[#C8A97E20] transition-colors">16:30</button>
                <button className="py-3 rounded-lg border border-[#C8A97E40] text-[#4A4A4D] text-[13px] font-medium">17:00</button>
              </div>
            </div>
          </div>
          <div className="p-6 pb-8 border-t border-[#C8A97E10]">
            <button className="w-full bg-[#C8A97E] text-[#0A0A0C] font-['Manrope'] font-bold py-4 rounded-full">
              Termin bestätigen
            </button>
          </div>
        </div>
      )}

      {/* Cancel Overlay Mock */}
      {state === 'cancelOverlay' && (
        <div className="fixed inset-0 bg-[#0A0A0C]/90 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#18181B] rounded-[24px] p-8 max-w-sm w-full border border-[#C8A97E20]">
            <div className="w-12 h-12 rounded-full bg-[#ff4d4d10] flex items-center justify-center mx-auto mb-4">
              <Icons.AlertTriangle className="w-6 h-6 text-[#ff4d4d]" />
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[24px] text-center text-[#F0F0EE] mb-2">
              Stornieren?
            </h2>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] text-center mb-6">
              Stornierungen sind bis zu 24h vor dem Termin kostenlos. Danach fallen 100% der Kosten an.
            </p>
            <button className="w-full bg-[#ff4d4d] text-white font-['Manrope'] font-bold py-3 rounded-full mb-3">
              Ja, Termin stornieren
            </button>
            <button className="w-full text-[#8A8A8D] font-medium py-3">
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetailScreen;