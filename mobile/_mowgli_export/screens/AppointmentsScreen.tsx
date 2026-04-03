import React from "react";
import * as Icons from "lucide-react";

export interface AppointmentsScreenProps {
  state: string;
}

/**
 * States:
 * - upcoming: List of future appointments.
 * - past: List of past appointments.
 */
const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({ state }) => {
  const renderAppointmentCard = (date: string, time: string, treatment: string, status: string, isPast: boolean) => {
    const parts = date.split('.');
    const day = parts[0] || '';
    const month = parts[1] ? parts[1].trim() : '';

    return (
      <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] p-5 flex gap-4 items-start relative overflow-hidden group hover:border-[#C8A97E40] transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.05)] to-transparent pointer-events-none"></div>
        
        {/* Date Box */}
        <div className="flex flex-col items-center justify-center w-14 h-16 bg-[#0A0A0C] rounded-xl border border-[#C8A97E20] shrink-0 z-10 pt-1">
          <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#8A8A8D] leading-none">{month}</span>
          <span className="font-['Manrope'] text-[20px] font-bold text-[#F0F0EE] leading-none mt-1">{day}</span>
        </div>

        {/* Details */}
        <div className="flex-1 z-10 min-w-0">
          <h3 className="font-['Manrope'] font-medium text-[16px] text-[#F0F0EE] mb-1 truncate">{treatment}</h3>
          <div className="flex items-center gap-2 text-[#8A8A8D] text-[13px]">
            <Icons.Clock className="w-3 h-3 shrink-0" />
            <span>{time}</span>
          </div>
        </div>

        {/* Status */}
        <div className="z-10 shrink-0 ml-2">
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${isPast ? 'bg-[#18181B] border border-[#A0A0A3] text-[#A0A0A3]' : 'bg-[#C8A97E] text-[#0A0A0C]'}`}>
            {status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30">
        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[28px] text-[#F0F0EE] mb-6">
          Meine Termine
        </h1>
        
        {/* Segments */}
        <div className="flex gap-6 border-b border-[#C8A97E20]">
          <button className={`pb-3 text-[15px] font-medium transition-colors ${state === 'upcoming' ? 'text-[#C8A97E] border-b-2 border-[#C8A97E]' : 'text-[#8A8A8D]'}`}>
            Kommende
          </button>
          <button className={`pb-3 text-[15px] font-medium transition-colors ${state === 'past' ? 'text-[#C8A97E] border-b-2 border-[#C8A97E]' : 'text-[#8A8A8D]'}`}>
            Vergangene
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-4 pb-24">
        {state === 'upcoming' ? (
          <>
            {renderAppointmentCard("14. Okt", "14:30", "Hydra Glow Facial", "Bestätigt", false)}
            {renderAppointmentCard("02. Nov", "10:00", "Aroma Massage", "Bestätigt", false)}
          </>
        ) : (
          <>
            {renderAppointmentCard("12. Sep", "16:00", "Maniküre Deluxe", "Abgeschlossen", true)}
            {renderAppointmentCard("28. Aug", "09:30", "Gesichtsbehandlung", "Abgeschlossen", true)}
          </>
        )}
        
        {/* Empty States (hidden for demo) */}
        {false && state === 'upcoming' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#C8A97E10] rounded-full flex items-center justify-center mb-4">
              <Icons.CalendarX className="w-8 h-8 text-[#C8A97E]" />
            </div>
            <h3 className="font-['Manrope'] text-[18px] font-medium text-[#F0F0EE] mb-2">Keine kommenden Termine</h3>
            <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] mb-6 max-w-[250px]">Sie haben derzeit keine geplanten Termine.</p>
            <button className="px-6 py-3 bg-[#C8A97E] text-[#0A0A0C] rounded-full font-['Manrope'] text-[14px] font-semibold">
              Termin buchen
            </button>
          </div>
        )}
        
        {false && state === 'past' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#C8A97E10] rounded-full flex items-center justify-center mb-4">
              <Icons.History className="w-8 h-8 text-[#C8A97E]" />
            </div>
            <h3 className="font-['Manrope'] text-[18px] font-medium text-[#F0F0EE] mb-2">Keine vergangenen Termine</h3>
            <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] max-w-[250px]">Ihre Terminhistorie wird hier angezeigt.</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation Placeholder (Simplified) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[#C8A97E10] z-40 pb-8 pt-3">
        <div className="flex justify-around items-center px-2">
          <button className="text-[#8A8A8D]"><Icons.Home className="w-6 h-6" /></button>
          <button className="text-[#8A8A8D]"><Icons.ShoppingBag className="w-6 h-6" /></button>
          <button className="relative -top-4 p-4 bg-[#C8A97E15] rounded-full border border-[#C8A97E20] text-[#C8A97E]"><Icons.ScanLine className="w-7 h-7" /></button>
          <button className="text-[#8A8A8D]"><Icons.Award className="w-6 h-6" /></button>
          <button className="text-[#C8A97E]"><Icons.User className="w-6 h-6" /></button>
        </div>
      </nav>
    </div>
  );
};

export default AppointmentsScreen;