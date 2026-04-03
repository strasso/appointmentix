import React from "react";
import * as Icons from "lucide-react";

export interface AuthScreenProps {
  state: string;
}

/**
 * States:
 * - phoneInput: Initial state, asks for phone number.
 * - otpInput: Asks for 6-digit code.
 * - profileDetails: Asks for name, email, and agreements.
 */
const AuthScreen: React.FC<AuthScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#18181B] border border-[#C8A97E20] flex items-center justify-center mx-auto mb-4 shadow-[inset_0_0_20px_rgba(200,169,126,0.05)]">
          <Icons.Building2 className="w-8 h-8 text-[#C8A97E]" />
        </div>
        <div className="relative">
          {(state === 'otpInput' || state === 'profileDetails') && (
            <button className="absolute -left-14 top-1/2 -translate-y-1/2 p-2 -ml-2">
              <Icons.ArrowLeft className="w-5 h-5 text-[#F0F0EE]" />
            </button>
          )}
          <h1 className="font-['Cormorant_Garamond'] font-light text-[24px] text-[#F0F0EE] mb-1">
            Aesthetik Studio Berlin
          </h1>
          <p className="font-['Manrope'] text-[13px] text-[#8A8A8D]">
            {state === 'phoneInput' && 'Geben Sie Ihre Nummer ein'}
            {state === 'otpInput' && 'Verifizieren Sie Ihre Nummer'}
            {state === 'profileDetails' && 'Vervollständigen Sie Ihr Profil'}
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 flex flex-col justify-center max-w-sm mx-auto w-full">
        {state === 'phoneInput' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <label className="block font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-2">Mobilfunknummer</label>
              <div className="flex gap-0">
                <select className="bg-[#18181B] border border-[#C8A97E20] border-r-0 text-[#F0F0EE] rounded-l-[12px] px-4 py-4 appearance-none focus:outline-none focus:border-[#C8A97E] focus:z-10">
                  <option>+49</option>
                  <option>+43</option>
                  <option>+41</option>
                </select>
                <input 
                  type="tel" 
                  placeholder="170 12345678" 
                  className="flex-1 bg-[#18181B] border border-[#C8A97E20] text-[#F0F0EE] rounded-r-[12px] px-4 py-4 placeholder-[#8A8A8D] focus:outline-none focus:border-[#C8A97E]" 
                />
              </div>
            </div>
            <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors">
              Code senden
            </button>
          </div>
        )}

        {state === 'otpInput' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4 text-center">
                Code eingeben
              </label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-12 h-14 bg-[#222225] border border-[#C8A97E40] text-[#F0F0EE] text-center text-xl rounded-[12px] focus:outline-none focus:border-[#C8A97E] focus:shadow-[0_0_15px_rgba(200,169,126,0.2)] transition-all"
                  />
                ))}
              </div>
              <p className="text-center text-[#12px] text-[#8A8A8D] mt-4">
                Code an +49 170 123**** gesendet
              </p>
            </div>
            <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors">
              Verifizieren
            </button>
            <button className="w-full text-[#C8A97E] font-['Manrope'] text-[13px] py-2">
              Neu senden
            </button>
          </div>
        )}

        {state === 'profileDetails' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div>
                <label className="block font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-2">Vorname</label>
                <input type="text" placeholder="Hannah" className="w-full bg-[#18181B] border border-[#C8A97E20] text-[#F0F0EE] rounded-[12px] px-4 py-4 placeholder-[#8A8A8D] focus:outline-none focus:border-[#C8A97E]" />
              </div>
              <div>
                <label className="block font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-2">Nachname</label>
                <input type="text" placeholder="Müller" className="w-full bg-[#18181B] border border-[#C8A97E20] text-[#F0F0EE] rounded-[12px] px-4 py-4 placeholder-[#8A8A8D] focus:outline-none focus:border-[#C8A97E]" />
              </div>
              <div>
                <label className="block font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-2">E-Mail (Optional)</label>
                <input type="email" placeholder="hannah@beispiel.de" className="w-full bg-[#18181B] border border-[#C8A97E20] text-[#F0F0EE] rounded-[12px] px-4 py-4 placeholder-[#8A8A8D] focus:outline-none focus:border-[#C8A97E]" />
              </div>
            </div>
            
            <button className="flex items-start gap-3 pt-2 w-full text-left cursor-pointer active:opacity-70">
              <div className="w-5 h-5 rounded border border-[#C8A97E] flex items-center justify-center shrink-0 mt-0.5 bg-transparent">
              </div>
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] leading-relaxed">
                Ich stimme den <span className="text-[#C8A97E] underline">AGB</span> und der <span className="text-[#C8A97E] underline">Datenschutzerklärung</span> der Aesthetik Studio Berlin zu.
              </p>
            </button>

            <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors mt-4">
              Account erstellen
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthScreen;