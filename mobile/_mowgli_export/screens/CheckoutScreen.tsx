import React from "react";
import * as Icons from "lucide-react";

export interface CheckoutScreenProps {
  state: string;
}

/**
 * States:
 * - default: Standard checkout view.
 * - pointsApplied: Points used for discount.
 * - processing: Payment in progress.
 * - error: Payment failed.
 */
const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ state }) => {
  const hasDiscount = state === 'pointsApplied';
  const isProcessing = state === 'processing';
  const isError = state === 'error';

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-12">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10]">
        <div className="flex items-center gap-4">
          <button className="text-[#F0F0EE]">
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[20px]">Zahlung</h1>
        </div>
      </header>

      <main className="flex-1 px-6 pt-6 space-y-6">
        {/* Order Summary */}
        <section className="p-5 bg-[#18181B] rounded-[14px] border border-[#C8A97E20]">
          <h2 className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">Zusammenfassung</h2>
          <div className="flex gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-[#0A0A0C] overflow-hidden">
              <img src="./images/treatment-facial.jpg" alt="Professional Hydra Glow facial treatment procedure" data-context="Treatment thumbnail image" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-['Manrope'] font-medium text-[15px] text-[#F0F0EE]">Hydra Glow Facial</h3>
              <p className="font-['Manrope'] text-[13px] text-[#8A8A8D]">Mi, 14. Okt • 14:30</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-[#F0F0EE] font-semibold text-[16px] leading-none">
            <span>Zwischensumme</span>
            <span>89€</span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between items-center text-[#C8A97E] text-[14px] mt-2 leading-none">
              <span>Punkte-Rabatt (500 Pkt)</span>
              <span>-10€</span>
            </div>
          )}
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">Zahlungsmethode</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#18181B] rounded-[14px] border border-[#C8A97E]">
              <div className="flex items-center gap-3">
                <div className="bg-[#F0F0EE] p-1.5 rounded">
                   <Icons.CreditCard className="w-5 h-5 text-[#0A0A0C]" />
                </div>
                <div>
                  <p className="font-['Manrope'] text-[14px] text-[#F0F0EE] font-medium">Mastercard</p>
                  <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">•••• 4242</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-[#C8A97E] flex items-center justify-center">
                <Icons.Check className="w-3 h-3 text-[#0A0A0C]" />
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[#C8A97E30] rounded-[14px] text-[#8A8A8D] text-[13px] hover:border-[#C8A97E] transition-colors">
              <Icons.Plus className="w-4 h-4" /> Neue Karte hinzufügen
            </button>
          </div>
        </section>

        {/* Points Toggle */}
        {!hasDiscount && (
          <section className="flex items-center justify-between p-4 bg-[#18181B] rounded-[14px] border border-[#C8A97E20]">
            <div className="flex items-center gap-3">
              <Icons.Coins className="w-5 h-5 text-[#C8A97E]" />
              <div>
                <p className="font-['Manrope'] text-[14px] text-[#F0F0EE]">500 Punkte einlösen</p>
                <p className="font-['Manrope'] text-[11px] text-[#8A8A8D]">Spart Ihnen 10€</p>
              </div>
            </div>
            <div className="w-10 h-6 bg-[#C8A97E10] rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-[#5A5A5E] rounded-full absolute top-1 left-1 shadow-sm"></div>
            </div>
          </section>
        )}

        {/* Error Message */}
        {isError && (
          <div className="p-4 bg-[#3a1a1a] border border-[#ff4d4d40] rounded-[14px] flex items-start gap-3">
            <Icons.AlertCircle className="w-5 h-5 text-[#ff4d4d] shrink-0" />
            <p className="font-['Manrope'] text-[13px] text-[#ffcccc]">
              Zahlung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten oder versuchen Sie eine andere Karte.
            </p>
          </div>
        )}
        
        {/* Terms */}
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded border border-[#C8A97E] flex items-center justify-center bg-[#C8A97E] mt-0.5 shrink-0">
            <Icons.Check className="w-3 h-3 text-[#0A0A0C]" />
          </div>
          <p className="font-['Manrope'] text-[11px] text-[#8A8A8D]">
            Ich bestätige die Buchung und akzeptiere die <span className="text-[#C8A97E] underline">AGB</span>.
          </p>
        </div>
      </main>

      {/* Footer Action */}
      <div className="px-6 pt-6 border-t border-[#C8A97E10]">
        <div className="flex justify-between items-center mb-4">
          <span className="font-['Manrope'] font-medium text-[18px] text-[#F0F0EE]">Gesamt</span>
          <span className="font-['Manrope'] font-bold text-[24px] text-[#C8A97E]">
            {hasDiscount ? '79€' : '89€'}
          </span>
        </div>
        <button 
          disabled={isProcessing}
          className={`w-full font-['Manrope'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 transition-all ${isError ? 'bg-[#ff4d4d] text-white' : 'bg-[#F0F0EE] text-[#0A0A0C] hover:bg-[#EADBC6]'}`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0A0A0C] border-t-transparent rounded-full animate-spin"></div>
              Verarbeitung...
            </>
          ) : (
            <>Jetzt bezahlen <Icons.ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;