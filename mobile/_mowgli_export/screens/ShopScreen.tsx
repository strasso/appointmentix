import React from "react";
import * as Icons from "lucide-react";

export interface ShopScreenProps {
  state: string;
}

/**
 * States:
 * - defaultTreatments: Treatments tab active.
 * - membershipsTab: Memberships tab active.
 * - vouchersTab: Vouchers tab active.
 * - filterOverlay: Filter modal open.
 * - cartOverlay: Cart modal open.
 */
const ShopScreen: React.FC<ShopScreenProps> = ({ state }) => {
  const renderProductCard = (title: string, price: string, category: string, image: string) => (
    <div className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
      <div className="h-[180px] w-full relative">
        <img 
          src={image} 
          alt={title} 
          data-context={`Shop Product: ${title}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#C8A97E] tracking-wider">{category}</span>
          <span className="font-['Manrope'] font-semibold text-[16px] text-[#F0F0EE]">{price}</span>
        </div>
        <h3 className="font-['Manrope'] font-medium text-[15px] text-[#F0F0EE] leading-snug mb-3">{title}</h3>
        <button className="w-full py-2 rounded-lg border border-[#C8A97E30] text-[#F0F0EE] text-[12px] font-medium hover:bg-[#C8A97E10] transition-colors">
          Ansehen
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] relative">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10]">
        <div className="flex justify-between items-center">
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[24px]">Shop</h1>
          <div className="flex gap-4">
            <button className="p-2 text-[#F0F0EE]">
              <Icons.Search className="w-6 h-6" />
            </button>
            <button className="relative p-2 text-[#F0F0EE]">
              <Icons.ShoppingBag className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C8A97E] rounded-full"></span>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-6 bg-[#18181B] p-1 rounded-full border border-[#C8A97E10]">
          {['Treatments', 'Memberships', 'Gutscheine'].map((tab) => {
            const isActive = (state === 'defaultTreatments' && tab === 'Treatments') ||
                             (state === 'membershipsTab' && tab === 'Memberships') ||
                             (state === 'vouchersTab' && tab === 'Gutscheine');
            return (
              <button 
                key={tab} 
                className={`flex-1 py-2 text-[13px] font-medium rounded-full transition-all ${isActive ? 'bg-[#0A0A0C] text-[#C8A97E] shadow-sm' : 'text-[#8A8A8D]'}`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-6 py-4 flex justify-between items-center">
        <button className="flex items-center gap-2 text-[#8A8A8D] text-[13px]">
          <Icons.SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 text-[#8A8A8D] text-[13px]">
          <Icons.ArrowUpDown className="w-4 h-4" />
          Sortieren
        </button>
      </div>

      {/* Grid Content */}
      <main className="px-6 pb-24">
        {state === 'defaultTreatments' && (
          <div className="grid grid-cols-2 gap-4">
            {renderProductCard("Hydra Glow Facial", "89€", "Gesicht", "./images/treatment-facial.jpg")}
            {renderProductCard("Gold Massage", "120€", "Körper", "./images/treatment-massage.jpg")}
            {renderProductCard("Laser Treatment", "150€", "High-Tech", "./images/treatment-laser-facial.jpg")}
            {renderProductCard("Maniküre Deluxe", "45€", "Pflege", "./images/treatment-manicure.jpg")}
          </div>
        )}
        
        {state === 'membershipsTab' && (
          <div className="space-y-4">
            {[
              { title: "Gold Membership", price: "199€/Monat", features: ["10% Rabatt auf alle Behandlungen", "Exklusive Mitglieder-Events", "Kostenlose Beratung"] },
              { title: "Platinum Membership", price: "349€/Monat", features: ["15% Rabatt auf alle Behandlungen", "Prioritätsbuchung", "1 gratis Behandlung/Monat", "VIP Lounge Zugang"] },
              { title: "Basic Membership", price: "99€/Monat", features: ["5% Rabatt auf alle Behandlungen", "Frühbucher-Vorteile"] }
            ].map((membership, idx) => (
              <div key={idx} className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-['Manrope'] font-semibold text-[18px] text-[#F0F0EE]">{membership.title}</h3>
                    <span className="font-['Manrope'] font-semibold text-[16px] text-[#C8A97E]">{membership.price}</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {membership.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Icons.Check className="w-4 h-4 text-[#C8A97E] mt-0.5 flex-shrink-0" />
                        <span className="font-['Manrope'] text-[13px] text-[#F0F0EE]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-lg bg-[#C8A97E] text-[#0A0A0C] text-[13px] font-bold uppercase tracking-wider">
                    Auswählen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {state === 'vouchersTab' && (
          <div className="space-y-4">
            {[
              { title: "50€ Geschenkgutschein", price: "50€", description: "Einlösbar für alle Behandlungen im Studio" },
              { title: "100€ Geschenkgutschein", price: "100€", description: "Perfekt für ein umfangreicheres Wellness-Erlebnis" },
              { title: "250€ Geschenkgutschein", price: "250€", description: "Das ultimative Geschenk für besondere Anlässe" }
            ].map((voucher, idx) => (
              <div key={idx} className="bg-[#18181B] rounded-[14px] border border-[#C8A97E20] p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#C8A97E] tracking-wider">Geschenkgutschein</span>
                      <h3 className="font-['Manrope'] font-semibold text-[18px] text-[#F0F0EE] mt-1">{voucher.title}</h3>
                    </div>
                    <span className="font-['Manrope'] font-semibold text-[20px] text-[#C8A97E]">{voucher.price}</span>
                  </div>
                  <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] mb-4">{voucher.description}</p>
                  <button className="w-full py-3 rounded-lg border border-[#C8A97E30] text-[#F0F0EE] text-[13px] font-medium hover:bg-[#C8A97E10] transition-colors">
                    In den Warenkorb
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Filter Overlay */}
      {state === 'filterOverlay' && (
        <div className="fixed inset-0 bg-[#0A0A0C] z-50 flex flex-col animate-in fade-in duration-300">
          <div className="flex flex-col p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 mt-16">
              <h2 className="font-['Cormorant_Garamond'] text-[24px]">Filter</h2>
              <button className="text-[#C8A97E] text-sm font-bold uppercase tracking-wider">Reset</button>
            </div>
            <div className="space-y-8 pb-8">
              <div>
                <h3 className="font-['Manrope'] text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">Kategorie</h3>
                <div className="space-y-3">
                  {['Gesicht', 'Körper', 'Massage', 'Laser'].map(cat => (
                    <label key={cat} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-[#C8A97E] flex items-center justify-center bg-[#C8A97E]">
                        <Icons.Check className="w-3 h-3 text-[#0A0A0C]" />
                      </div>
                      <span className="font-['Manrope'] text-[15px] text-[#F0F0EE]">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0A0A0C] border-t border-[#C8A97E10] p-6 pt-4">
             <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-bold py-4 rounded-full mb-3">
              Anzeigen (42)
            </button>
            <button className="w-full text-[#8A8A8D] font-medium py-3 hover:text-[#F0F0EE] transition-colors">Schließen</button>
          </div>
        </div>
      )}

      {/* Cart Overlay (Simplified representation) */}
      {state === 'cartOverlay' && (
        <div className="fixed inset-0 bg-[#0A0A0C]/80 z-50 flex items-end justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#18181B] rounded-t-[24px] p-6 pb-10 border-t border-[#C8A97E20] h-[80vh] flex flex-col">
            <div className="w-12 h-1 bg-[#C8A97E20] rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Cormorant_Garamond'] font-semibold text-[24px] text-[#F0F0EE]">Ihr Warenkorb</h3>
              <button className="text-[#8A8A8D]"><Icons.X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#8A8A8D]">Warenkorb items hier...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopScreen;