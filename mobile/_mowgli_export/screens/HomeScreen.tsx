import React from "react";
import * as Icons from "lucide-react";

export interface HomeScreenProps {
  state: string;
}

/**
 * States:
 * - default: Standard view showing Hero, Treatments, Membership, Actions, and Tips.
 * - searchOverlay: Search overlay is open, covering the screen with focus on search input.
 * - cartOverlay: Cart overlay is open, showing items and checkout summary.
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ state }) => {
  // Header with Logo, Greeting, and Action Icons
  const renderHeader = () => (
    <div className="pt-12 pb-4 px-6 flex justify-between items-center bg-[#0A0A0C] sticky top-0 z-30">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Icons.Sparkles className="w-5 h-5 text-[#C8A97E]" />
          <span className="font-['Manrope'] text-xs font-bold uppercase tracking-widest text-[#C8A97E]">
            Curabo
          </span>
        </div>
        <h1 className="font-['Cormorant_Garamond'] font-light text-[24px] text-[#F0F0EE] leading-none">
          Guten Abend, Hannah
        </h1>
      </div>
      <div className="flex gap-4">
        <button className="relative p-2 rounded-full hover:bg-[#18181B] transition-colors">
          <Icons.Search className="w-6 h-6 text-[#F0F0EE]" />
        </button>
        <button className="relative p-2 rounded-full hover:bg-[#18181B] transition-colors">
          <Icons.ShoppingBag className="w-6 h-6 text-[#F0F0EE]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#C8A97E] rounded-full"></span>
        </button>
      </div>
    </div>
  );

  // Hero Section: Featured Treatment
  const renderHero = () => (
    <div className="px-6 mb-8">
      <div className="relative w-full h-[220px] rounded-[14px] overflow-hidden group">
        <img
          src="./images/hero-spa-treatment.jpg"
          alt="A serene spa environment with soft candlelight and a luxurious massage table draped in white linen, evoking a sense of deep relaxation and premium care."
          data-context="Featured Treatment Hero Image"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-black/30"></div>
        {/* Gold Shimmer Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8A97E] to-transparent opacity-60"></div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <span className="font-['Manrope'] font-bold text-[10px] uppercase tracking-[1.5px] text-[#C8A97E] mb-2 block">
            Featured
          </span>
          <h2 className="font-['Cormorant_Garamond'] font-semibold text-[28px] text-[#F0F0EE] leading-tight mb-2">
            Signature Gold Facial
          </h2>
          <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] line-clamp-1">
            Erleben Sie tiefe Regeneration mit 24k Gold-Flakes.
          </p>
        </div>
      </div>
    </div>
  );

  // Horizontal Slider: Popular Treatments
  const renderPopularTreatments = () => (
    <div className="mb-10 pl-6">
      <div className="flex justify-between items-end pr-6 mb-4">
        <h3 className="font-['Cormorant_Garamond'] font-light text-[26px] text-[#F0F0EE]">
          Beliebte Treatments
        </h3>
        <button className="text-[#C8A97E] text-xs font-['Manrope'] font-medium">Alle</button>
      </div>
      
      <div className="flex overflow-x-auto gap-3 pb-4 pr-6 snap-x scrollbar-hide">
        {/* Card 1 */}
        <div className="snap-start shrink-0 w-[160px] relative bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
          <div className="h-[100px] w-full relative">
             <img
              src="./images/treatment-facial.jpg"
              alt="Close up of a woman receiving a professional facial treatment with soft towels and calming lighting."
              data-context="Treatment Card Image: Facial"
              className="w-full h-full object-cover rounded-t-[12px]"
            />
          </div>
          <div className="p-3 relative z-10">
            <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE] mb-1 truncate">
              Hydra Glow
            </h4>
            <div className="flex items-center justify-between">
              <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#C8A97E] border border-[#C8A97E40] px-1.5 py-0.5 rounded">
                60 min
              </span>
              <span className="font-['Manrope'] font-semibold text-[14px] text-[#F0F0EE]">
                89€
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="snap-start shrink-0 w-[160px] relative bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
          <div className="h-[100px] w-full relative">
             <img
              src="./images/treatment-massage.jpg"
              alt="Hands performing a relaxing back massage in a dimly lit room with aromatic oils."
              data-context="Treatment Card Image: Massage"
              className="w-full h-full object-cover rounded-t-[12px]"
            />
          </div>
          <div className="p-3 relative z-10">
            <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE] mb-1 truncate">
              Aroma Massage
            </h4>
            <div className="flex items-center justify-between">
              <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#C8A97E] border border-[#C8A97E40] px-1.5 py-0.5 rounded">
                45 min
              </span>
              <span className="font-['Manrope'] font-semibold text-[14px] text-[#F0F0EE]">
                65€
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 (Scroll hint) */}
        <div className="snap-start shrink-0 w-[160px] relative bg-[#18181B] rounded-[14px] border border-[#C8A97E20] overflow-hidden opacity-80">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent pointer-events-none"></div>
          <div className="h-[100px] w-full relative">
             <img
              src="./images/treatment-laser.jpg"
              alt="Advanced laser skincare device being used by a professional."
              data-context="Treatment Card Image: Laser"
              className="w-full h-full object-cover rounded-t-[12px]"
            />
          </div>
          <div className="p-3 relative z-10">
            <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE] mb-1 truncate">
              Laser Resurfacing
            </h4>
            <div className="flex items-center justify-between">
              <span className="font-['Manrope'] text-[10px] uppercase font-bold text-[#C8A97E] border border-[#C8A97E40] px-1.5 py-0.5 rounded">
                30 min
              </span>
              <span className="font-['Manrope'] font-semibold text-[14px] text-[#F0F0EE]">
                120€
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Membership Card (VIP Style)
  const renderMembershipCard = () => (
    <div className="px-6 mb-12">
      <div className="w-full rounded-[14px] bg-[#18181B] border border-[#C8A97E40] relative overflow-hidden p-6 shadow-[inset_0_0_30px_rgba(200,169,126,0.06)]">
        {/* Background Texture simulation via gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.05)] to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icons.Crown className="w-4 h-4 text-[#C8A97E]" />
              <span className="font-['Manrope'] text-[10px] uppercase font-bold tracking-widest text-[#C8A97E]">
                Active Membership
              </span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] font-semibold text-[20px] text-[#F0F0EE] mb-3">
              Gold Lounge
            </h3>
            <ul className="space-y-1 mb-4">
              <li className="font-['Manrope'] text-[13px] text-[#8A8A8D] flex items-center gap-2">
                <Icons.Check className="w-3 h-3 text-[#C8A97E]" />
                <span>10% Rabatt auf alle Behandlungen</span>
              </li>
              <li className="font-['Manrope'] text-[13px] text-[#8A8A8D] flex items-center gap-2">
                <Icons.Check className="w-3 h-3 text-[#C8A97E]" />
                <span>Priorisierte Buchung</span>
              </li>
            </ul>
            <button className="text-[#C8A97E] font-['Manrope'] text-[12px] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Mehr erfahren <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {/* Decorative Element */}
          <div className="opacity-20">
            <Icons.Diamond className="w-16 h-16 text-[#C8A97E]" />
          </div>
        </div>
      </div>
    </div>
  );

  // Quick Actions
  const renderQuickActions = () => (
    <div className="px-6 mb-10">
      <div className="flex justify-between gap-3">
        {/* Action 1 */}
        <button className="flex-1 aspect-square rounded-[14px] bg-[#18181B] border border-[#C8A97E20] flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-[#C8A97E40] transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 bg-[#C8A97E15] p-3 rounded-full mb-1">
            <Icons.Calendar className="w-5 h-5 text-[#C8A97E]" />
          </div>
          <span className="relative z-10 font-['Manrope'] text-[12px] font-medium text-[#F0F0EE] text-center">
            Termin buchen
          </span>
        </button>

        {/* Action 2 */}
        <button className="flex-1 aspect-square rounded-[14px] bg-[#18181B] border border-[#C8A97E20] flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-[#C8A97E40] transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 bg-[#C8A97E15] p-3 rounded-full mb-1">
            <Icons.Star className="w-5 h-5 text-[#C8A97E]" />
          </div>
          <span className="relative z-10 font-['Manrope'] text-[12px] font-medium text-[#F0F0EE] text-center">
            Mitglied werden
          </span>
        </button>

        {/* Action 3 */}
        <button className="flex-1 aspect-square rounded-[14px] bg-[#18181B] border border-[#C8A97E20] flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-[#C8A97E40] transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,169,126,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 bg-[#C8A97E15] p-3 rounded-full mb-1">
            <Icons.Gift className="w-5 h-5 text-[#C8A97E]" />
          </div>
          <span className="relative z-10 font-['Manrope'] text-[12px] font-medium text-[#F0F0EE] text-center">
            Gutschein kaufen
          </span>
        </button>
      </div>
    </div>
  );

  // Knowledge & Tips Section
  const renderKnowledgeTips = () => (
    <div className="px-6 mb-24">
      <h3 className="font-['Cormorant_Garamond'] font-light text-[26px] text-[#F0F0EE] mb-4">
        Wissen & Tipps
      </h3>
      
      <div className="space-y-4">
        {/* Article 1 */}
        <div className="flex gap-4 group cursor-pointer">
          <div className="w-[100px] h-[100px] shrink-0 rounded-[12px] overflow-hidden relative">
            <img
              src="./images/article-skincare.jpg"
              alt="Flat lay of expensive skincare products including serums and creams on a dark marble surface."
              data-context="Article Thumbnail: Skincare Routine"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center pl-2 border-l-2 border-[#C8A97E20]">
            <h4 className="font-['Manrope'] font-semibold text-[15px] text-[#F0F0EE] mb-1 leading-tight">
              Die ideale Abend-Routine
            </h4>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] line-clamp-2 leading-relaxed">
              Entdecken Sie, wie Sie Ihre Haut mit der richtigen Sequenz auf die Nacht vorbereiten.
            </p>
          </div>
        </div>

        {/* Article 2 */}
        <div className="flex gap-4 group cursor-pointer">
          <div className="w-[100px] h-[100px] shrink-0 rounded-[12px] overflow-hidden relative">
            <img
              src="./images/article-hydration.jpg"
              alt="A glass of fresh water with lemon slices and green leaves, symbolizing hydration and health."
              data-context="Article Thumbnail: Hydration"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center pl-2 border-l-2 border-[#C8A97E20]">
            <h4 className="font-['Manrope'] font-semibold text-[15px] text-[#F0F0EE] mb-1 leading-tight">
              Hydration: Der Schlüssel
            </h4>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D] line-clamp-2 leading-relaxed">
              Warum Wasser allein nicht reicht und wie Feuchtigkeitsbindende wirken.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Bottom Navigation
  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[#C8A97E10] z-40 pb-8 pt-3">
      <div className="flex justify-around items-center px-2">
        {/* Home - Active */}
        <button className="flex flex-col items-center gap-1 p-2 text-[#C8A97E]">
          <Icons.Home className="w-6 h-6" />
          <span className="w-1 h-1 rounded-full bg-[#C8A97E]"></span>
        </button>

        {/* Shop */}
        <button className="flex flex-col items-center gap-1 p-2 text-[#8A8A8D] hover:text-[#F0F0EE] transition-colors">
          <Icons.ShoppingBag className="w-6 h-6" />
        </button>

        {/* Scan - Highlighted */}
        <button className="relative -top-4 p-4 bg-[#C8A97E15] rounded-full border border-[#C8A97E20] text-[#C8A97E] shadow-[0_0_20px_rgba(200,169,126,0.15)]">
          <Icons.ScanLine className="w-7 h-7" />
        </button>

        {/* Rewards */}
        <button className="flex flex-col items-center gap-1 p-2 text-[#8A8A8D] hover:text-[#F0F0EE] transition-colors">
          <Icons.Award className="w-6 h-6" />
        </button>

        {/* Profile */}
        <button className="flex flex-col items-center gap-1 p-2 text-[#8A8A8D] hover:text-[#F0F0EE] transition-colors">
          <Icons.User className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );

  // Search Overlay
  const renderSearchOverlay = () => (
    <div className="fixed inset-0 bg-[#0A0A0C]/95 z-50 flex flex-col p-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8 mt-16">
        <button className="p-2 text-[#F0F0EE]">
          <Icons.X className="w-6 h-6" />
        </button>
        <div className="flex-1 relative">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8D]" />
          <input
            type="text"
            placeholder="Suche nach Treatments, Tipps..."
            autoFocus
            className="w-full bg-[#18181B] border border-[#C8A97E20] rounded-full py-4 pl-12 pr-4 text-[#F0F0EE] placeholder-[#8A8A8D] font-['Manrope'] focus:outline-none focus:border-[#C8A97E] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-['Manrope'] font-bold text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">
            Kürzlich gesucht
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-[#18181B] rounded-full text-[#F0F0EE] text-[13px] font-['Manrope'] border border-[#C8A97E20]">HydraFacial</span>
            <span className="px-4 py-2 bg-[#18181B] rounded-full text-[#F0F0EE] text-[13px] font-['Manrope'] border border-[#C8A97E20]">Massage</span>
            <span className="px-4 py-2 bg-[#18181B] rounded-full text-[#F0F0EE] text-[13px] font-['Manrope'] border border-[#C8A97E20]">Gutscheine</span>
          </div>
        </div>

        <div>
          <h4 className="font-['Manrope'] font-bold text-[11px] uppercase tracking-widest text-[#C8A97E] mb-4">
            Beliebte Kategorien
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#18181B] rounded-[14px] border border-[#C8A97E20]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C8A97E10] rounded-lg text-[#C8A97E]">
                  <Icons.Sparkles className="w-5 h-5" />
                </div>
                <span className="font-['Manrope'] text-[15px] text-[#F0F0EE]">Gesicht</span>
              </div>
              <Icons.ChevronRight className="w-5 h-5 text-[#8A8A8D]" />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#18181B] rounded-[14px] border border-[#C8A97E20]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C8A97E10] rounded-lg text-[#C8A97E]">
                  <Icons.HeartPulse className="w-5 h-5" />
                </div>
                <span className="font-['Manrope'] text-[15px] text-[#F0F0EE]">Körper & Wellness</span>
              </div>
              <Icons.ChevronRight className="w-5 h-5 text-[#8A8A8D]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Cart Overlay
  const renderCartOverlay = () => (
    <div className="fixed inset-0 bg-[#0A0A0C]/80 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#18181B] rounded-t-[24px] p-6 pb-10 border-t border-[#C8A97E20] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative">
        <div className="w-12 h-1 bg-[#C8A97E20] rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-['Cormorant_Garamond'] font-semibold text-[24px] text-[#F0F0EE]">
            Ihr Warenkorb
          </h3>
          <button className="text-[#8A8A8D] hover:text-[#F0F0EE]">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {/* Item 1 */}
          <div className="flex items-center gap-4 p-3 bg-[#0A0A0C] rounded-[12px] border border-[#C8A97E10]">
            <img
              src="./images/treatment-facial.jpg"
              alt="Facial treatment product"
              data-context="Cart Item Image"
              className="w-16 h-16 rounded-lg object-cover bg-[#18181B]"
            />
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE]">Hydra Glow</h4>
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] mb-2">60 Min</p>
              <div className="flex justify-between items-center">
                <span className="font-['Manrope'] font-semibold text-[14px] text-[#C8A97E]">89€</span>
                <div className="flex items-center gap-3 bg-[#18181B] rounded-md px-2 py-1">
                  <button className="text-[#8A8A8D]"><Icons.Minus className="w-3 h-3" /></button>
                  <span className="font-['Manrope'] text-[12px] text-[#F0F0EE]">1</span>
                  <button className="text-[#C8A97E]"><Icons.Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-4 p-3 bg-[#0A0A0C] rounded-[12px] border border-[#C8A97E10]">
            <img
              src="./images/product-serum.jpg"
              alt="Golden serum bottle"
              data-context="Cart Item Image: Product"
              className="w-16 h-16 rounded-lg object-cover bg-[#18181B]"
            />
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-['Manrope'] font-medium text-[14px] text-[#F0F0EE]">Gold Repair Serum</h4>
              <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] mb-2">30ml</p>
              <div className="flex justify-between items-center">
                <span className="font-['Manrope'] font-semibold text-[14px] text-[#C8A97E]">120€</span>
                <div className="flex items-center gap-3 bg-[#18181B] rounded-md px-2 py-1">
                  <button className="text-[#8A8A8D]"><Icons.Minus className="w-3 h-3" /></button>
                  <span className="font-['Manrope'] text-[12px] text-[#F0F0EE]">1</span>
                  <button className="text-[#C8A97E]"><Icons.Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C8A97E20] pt-4 space-y-2 mb-6">
          <div className="flex justify-between text-[#8A8A8D] font-['Manrope'] text-[13px]">
            <span>Zwischensumme</span>
            <span>209€</span>
          </div>
          <div className="flex justify-between text-[#F0F0EE] font-['Manrope'] font-semibold text-[18px]">
            <span>Gesamt</span>
            <span>209€</span>
          </div>
        </div>

        <button className="w-full bg-[#F0F0EE] text-[#0A0A0C] font-['Manrope'] font-bold text-[15px] py-4 rounded-full hover:bg-[#EADBC6] transition-colors flex justify-center items-center gap-2">
          Zur Kasse <Icons.ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] relative overflow-hidden">
      {renderHeader()}
      
      <main className="pb-24">
        {renderHero()}
        {renderPopularTreatments()}
        {renderMembershipCard()}
        {renderQuickActions()}
        {renderKnowledgeTips()}
      </main>

      {renderBottomNav()}

      {state === 'searchOverlay' && renderSearchOverlay()}
      {state === 'cartOverlay' && renderCartOverlay()}
    </div>
  );
};

export default HomeScreen;