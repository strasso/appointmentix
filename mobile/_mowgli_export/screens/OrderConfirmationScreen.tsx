import React from "react";
import * as Icons from "lucide-react";

export interface OrderConfirmationScreenProps {
  state: string;
}

/**
 * States:
 * - appointmentSuccess: Booking confirmed.
 * - voucherSuccess: Voucher purchase confirmed.
 */
const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({ state }) => {
  const isVoucher = state === 'voucherSuccess';

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col px-6">
      <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#C8A97E] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(200,169,126,0.3)]">
          <Icons.Check className="w-10 h-10 text-[#0A0A0C]" />
        </div>

        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[32px] text-[#F0F0EE] mb-2">
          {isVoucher ? 'Gutschein erstellt' : 'Buchung bestätigt'}
        </h1>
        <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] mb-10 max-w-xs">
          {isVoucher 
            ? 'Ihr Gutschein ist bereit zum Verschenken oder Einlösen.' 
            : 'Wir freuen uns auf Ihren Besuch. Eine Bestätigung wurde gesendet.'}
        </p>

        {/* Voucher Specific Content */}
        {isVoucher && (
          <div className="w-full bg-[#18181B] border border-[#C8A97E40] rounded-[14px] p-6 mb-4 shadow-[inset_0_0_20px_rgba(200,169,126,0.05)]">
            <div className="w-32 h-32 bg-white mx-auto mb-4 rounded-lg p-3">
              {/* Mock QR Code - More realistic structure */}
              <div className="w-full h-full relative">
                {/* Finder patterns (corner squares) */}
                <div className="absolute top-0 left-0 w-5 h-5 border-2 border-black">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                </div>
                <div className="absolute top-0 right-0 w-5 h-5 border-2 border-black">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-5 h-5 border-2 border-black">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                </div>
                {/* Data modules - structured pattern */}
                <div className="absolute top-0 right-8 w-2 h-2 bg-black"></div>
                <div className="absolute top-2 right-6 w-1 h-1 bg-black"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-black"></div>
                <div className="absolute top-2 left-8 w-1 h-1 bg-black"></div>
                <div className="absolute top-4 left-10 w-2 h-1 bg-black"></div>
                <div className="absolute bottom-4 left-8 w-1 h-2 bg-black"></div>
                <div className="absolute bottom-2 right-8 w-2 h-1 bg-black"></div>
                <div className="absolute bottom-6 right-10 w-1 h-1 bg-black"></div>
                <div className="absolute top-8 left-2 w-1 h-1 bg-black"></div>
                <div className="absolute top-10 left-2 w-1 h-1 bg-black"></div>
                <div className="absolute top-8 right-2 w-1 h-1 bg-black"></div>
                <div className="absolute top-10 right-2 w-1 h-1 bg-black"></div>
                <div className="absolute bottom-8 left-2 w-1 h-1 bg-black"></div>
                <div className="absolute bottom-6 left-4 w-2 h-1 bg-black"></div>
                <div className="absolute top-12 left-6 w-3 h-1 bg-black"></div>
                <div className="absolute top-14 left-6 w-1 h-2 bg-black"></div>
                <div className="absolute top-12 right-6 w-2 h-1 bg-black"></div>
                <div className="absolute top-14 right-8 w-1 h-1 bg-black"></div>
                <div className="absolute bottom-6 right-4 w-1 h-2 bg-black"></div>
                <div className="absolute top-6 left-14 w-2 h-2 bg-black"></div>
                <div className="absolute top-9 right-14 w-1 h-3 bg-black"></div>
                <div className="absolute bottom-2 left-12 w-2 h-1 bg-black"></div>
                <div className="absolute bottom-4 right-12 w-1 h-1 bg-black"></div>
                <div className="absolute top-16 left-10 w-2 h-2 bg-black"></div>
                <div className="absolute top-16 right-10 w-2 h-2 bg-black"></div>
                <div className="absolute bottom-10 left-12 w-1 h-2 bg-black"></div>
                <div className="absolute bottom-10 right-12 w-2 h-1 bg-black"></div>
                <div className="absolute top-6 left-6 w-1 h-1 bg-black"></div>
                <div className="absolute top-10 right-10 w-1 h-1 bg-black"></div>
              </div>
            </div>
            <p className="font-['Manrope'] font-bold text-[18px] text-[#F0F0EE] tracking-widest mb-1">
              GOLD-2023
            </p>
            <p className="font-['Manrope'] text-[12px] text-[#8A8A8D]">
              Gültig bis: 31.12.2024
            </p>
          </div>
        )}

        {/* Voucher Share Button */}
        {isVoucher && (
          <button className="w-full flex items-center justify-center gap-3 p-4 bg-[#18181B] border border-[#C8A97E20] rounded-[14px] text-[#F0F0EE] hover:border-[#C8A97E] transition-colors mb-8">
            <Icons.Share2 className="w-5 h-5 text-[#C8A97E]" />
            <span className="font-['Manrope'] font-medium text-[15px]">Gutschein teilen</span>
          </button>
        )}

        {/* Appointment Specific Content */}
        {!isVoucher && (
          <div className="w-full space-y-4 mb-8">
            <button className="w-full flex items-center justify-center gap-3 p-4 bg-[#18181B] border border-[#C8A97E20] rounded-[14px] text-[#F0F0EE] hover:border-[#C8A97E] transition-colors">
              <Icons.CalendarPlus className="w-5 h-5 text-[#C8A97E]" />
              <span className="font-['Manrope'] font-medium text-[15px]">Zum Kalender hinzufügen</span>
            </button>
            
            <div className="text-center">
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] uppercase tracking-widest mb-2">Ihre Buchung</p>
              <p className="font-['Manrope'] text-[20px] text-[#F0F0EE]">Hydra Glow Facial</p>
              <p className="font-['Manrope'] text-[16px] text-[#C8A97E]">Mi, 14. Okt • 14:30</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action */}
      <div className="pb-12 w-full">
        <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors">
          {isVoucher ? 'Zurück zum Shop' : 'Zu Meine Termine'}
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationScreen;