import React from "react";
import * as Icons from "lucide-react";

export interface ContactScreenProps {
  state: string;
}

/**
 * States:
 * - default: Contact details visible.
 */
const ContactScreen: React.FC<ContactScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-24">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10]">
        <div className="flex items-center gap-4">
          <button className="text-[#F0F0EE]">
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[20px]">Kontakt</h1>
        </div>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-8">
        {/* Clinic Identity */}
        <section className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#18181B] border border-[#C8A97E20] flex items-center justify-center mx-auto mb-4">
            <Icons.Building2 className="w-10 h-10 text-[#C8A97E]" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] font-semibold text-[24px] text-[#F0F0EE] mb-1">
            Aesthetik Studio Berlin
          </h2>
          <p className="font-['Manrope'] text-[13px] text-[#8A8A8D]">Ihr Premium Partner</p>
        </section>

        {/* Map Placeholder */}
        <section className="relative w-full h-48 rounded-[14px] overflow-hidden border border-[#C8A97E20]">
          <img 
            src="./images/map-placeholder.jpg" 
            alt="Map showing location of clinic in Berlin city center" 
            data-context="Static Map Image"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="px-4 py-2 bg-[#18181B]/90 backdrop-blur rounded-full border border-[#C8A97E] text-[#C8A97E] text-[12px] font-bold uppercase tracking-wider flex items-center gap-2">
              <Icons.MapPin className="w-4 h-4" />
              In Maps öffnen
            </button>
          </div>
        </section>

        {/* Address */}
        <section className="text-center space-y-2">
          <p className="font-['Manrope'] text-[15px] text-[#F0F0EE] font-medium">
            Musterstraße 12
          </p>
          <p className="font-['Manrope'] text-[13px] text-[#8A8A8D]">
            10115 Berlin
          </p>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[#18181B] border border-[#C8A97E20] rounded-[14px] text-[#F0F0EE] font-['Manrope'] font-medium hover:border-[#C8A97E] transition-colors">
            <Icons.Phone className="w-5 h-5 text-[#C8A97E]" />
            <span className="text-[11px]">Anrufen</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[#18181B] border border-[#C8A97E20] rounded-[14px] text-[#F0F0EE] font-['Manrope'] font-medium hover:border-[#C8A97E] transition-colors">
            <Icons.Mail className="w-5 h-5 text-[#C8A97E]" />
            <span className="text-[11px]">E-Mail</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[#18181B] border border-[#C8A97E20] rounded-[14px] text-[#F0F0EE] font-['Manrope'] font-medium hover:border-[#C8A97E] transition-colors">
            <Icons.MessageCircle className="w-5 h-5 text-[#C8A97E]" />
            <span className="text-[11px]">WhatsApp</span>
          </button>
        </section>

        {/* Opening Hours */}
        <section className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] p-5">
          <h3 className="font-['Manrope'] font-bold text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">
            Öffnungszeiten
          </h3>
          <div className="space-y-2">
            {[
              { day: 'Montag', time: '09:00 - 20:00' },
              { day: 'Dienstag', time: '09:00 - 20:00' },
              { day: 'Heute (Mi)', time: '09:00 - 20:00', active: true },
              { day: 'Donnerstag', time: '09:00 - 20:00' },
              { day: 'Freitag', time: '09:00 - 18:00' },
              { day: 'Samstag', time: '10:00 - 16:00' },
              { day: 'Sonntag', time: 'Geschlossen' },
            ].map((item, idx) => (
              <div key={idx} className={`flex justify-between text-[13px] ${item.active ? 'text-[#F0F0EE] font-medium' : 'text-[#8A8A8D]'}`}>
                <span>{item.day}</span>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactScreen;