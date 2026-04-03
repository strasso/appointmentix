import React from "react";
import * as Icons from "lucide-react";

export interface ProfileScreenProps {
  state: string;
}

/**
 * States:
 * - default: Profile info and menu visible.
 * - clinicChangeWarning: Warning modal for changing clinic.
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-24">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 bg-[#0A0A0C]">
        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[28px] text-[#F0F0EE]">
          Profil
        </h1>
      </header>

      <main className="flex-1 px-6 space-y-8">
        {/* User Info */}
        <section className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#18181B] border-2 border-[#C8A97E] p-1">
             <img 
               src="./images/avatar-female.jpg" 
               alt="User Avatar" 
               data-context="User Profile Avatar"
               className="w-full h-full rounded-full object-cover"
             />
          </div>
          <div>
            <h2 className="font-['Cormorant_Garamond'] font-semibold text-[26px] text-[#F0F0EE]">Hannah Müller</h2>
            <p className="font-['Manrope'] text-[14px] text-[#8A8A8D]">hannah.m@example.com</p>
            <div className="flex items-center gap-2 mt-2">
              <Icons.Crown className="w-4 h-4 text-[#C8A97E]" />
              <span className="font-['Manrope'] text-[12px] text-[#C8A97E] uppercase tracking-wider font-bold">Gold Member</span>
            </div>
          </div>
        </section>

        {/* Membership Teaser */}
        <section className="p-5 bg-[#18181B] rounded-[14px] border border-[#C8A97E40] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Icons.Diamond className="w-16 h-16 text-[#C8A97E]" />
          </div>
          <div className="relative z-10">
            <h3 className="font-['Manrope'] font-bold text-[16px] text-[#F0F0EE] mb-1">Gold Lounge</h3>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] mb-3">Nächste Abrechnung: 01. Nov</p>
            <button className="text-[#C8A97E] text-[13px] font-medium flex items-center gap-1">
              Verwalten <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Menu List */}
        <section className="space-y-1">
          {[
            { icon: Icons.Clock, label: 'Buchungsverlauf', color: 'text-[#8A8A8D]' },
            { icon: Icons.CreditCard, label: 'Zahlungsmethoden', color: 'text-[#8A8A8D]' },
            { icon: Icons.Bell, label: 'Benachrichtigungen', color: 'text-[#8A8A8D]' },
            { icon: Icons.MapPin, label: 'Kontakt & Standort', color: 'text-[#8A8A8D]' },
          ].map((item, idx) => (
            <button key={idx} className="w-full flex items-center justify-between p-4 bg-[#18181B] hover:bg-[#18181B]/80 border-b border-[#C8A97E10] first:rounded-t-xl last:rounded-b-xl transition-colors">
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-['Manrope'] text-[15px] text-[#F0F0EE]">{item.label}</span>
              </div>
              <Icons.ChevronRight className="w-5 h-5 text-[#8A8A8D]" />
            </button>
          ))}
        </section>

        {/* Clinic Change (Destructive) */}
        <section>
          <button className="w-full flex items-center justify-center gap-2 p-4 text-[#8A6E4B] font-['Manrope'] text-[13px] font-medium hover:text-[#C8A97E] transition-colors">
            <Icons.RefreshCw className="w-4 h-4" />
            Klinik wechseln
          </button>
        </section>
      </main>

      {/* Clinic Change Warning Modal */}
      {state === 'clinicChangeWarning' && (
        <div className="fixed inset-0 bg-[#0A0A0C]/90 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#18181B] rounded-[24px] p-8 max-w-sm w-full border border-[#C8A97E20] text-center">
            <div className="w-16 h-16 rounded-full bg-[#C8A97E10] flex items-center justify-center mx-auto mb-4 border border-[#C8A97E30]">
              <Icons.RefreshCw className="w-8 h-8 text-[#C8A97E]" />
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[24px] text-[#F0F0EE] mb-2">
              Klinik wirklich wechseln?
            </h2>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] mb-6 leading-relaxed">
              Dies wird Ihre aktuelle Sitzung beenden. Punkte und Mitgliedschaften sind an die aktuelle Klinik gebunden und können nicht übertragen werden.
            </p>
            <button className="w-full bg-[#C8A97E] text-[#0A0A0C] font-['Manrope'] font-bold py-4 rounded-full mb-3">
              Ja, wechseln
            </button>
            <button className="w-full text-[#8A8A8D] font-medium py-4">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[#C8A97E10] z-40 pb-8 pt-3">
        <div className="flex justify-around items-center px-2">
          <button className="text-[#8A8A8D]"><Icons.Home className="w-6 h-6" /></button>
          <button className="text-[#8A8A8D]"><Icons.ShoppingBag className="w-6 h-6" /></button>
          <button className="relative -top-2 p-4 bg-[#C8A97E15] rounded-full border border-[#C8A97E20] text-[#C8A97E]"><Icons.ScanLine className="w-7 h-7" /></button>
          <button className="text-[#8A8A8D]"><Icons.Award className="w-6 h-6" /></button>
          <button className="text-[#C8A97E]"><Icons.User className="w-6 h-6" /></button>
        </div>
      </nav>
    </div>
  );
};

export default ProfileScreen;