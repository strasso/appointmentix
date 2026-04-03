import React from "react";
import * as Icons from "lucide-react";

export interface ClinicSelectionScreenProps {
  state: string;
}

/**
 * States:
 * - default: Initial view with empty search bar and list of suggested/popular clinics.
 * - searchActive: User is typing, list is filtered.
 * - noResults: Search yielded no clinics.
 */
const ClinicSelectionScreen: React.FC<ClinicSelectionScreenProps> = ({ state }) => {
  const renderClinicCard = (name: string, city: string, active: boolean = false) => (
    <div className={`flex items-center gap-4 p-4 rounded-[14px] border transition-all duration-300 cursor-pointer ${active ? 'bg-[#18181B] border-[#C8A97E]' : 'bg-[#18181B] border-[#C8A97E20] hover:border-[#C8A97E40]'}`}>
      {/* Clinic Logo Placeholder */}
      <div className="w-12 h-12 rounded-full bg-[#0A0A0C] flex items-center justify-center border border-[#C8A97E20] shrink-0">
        <Icons.Building2 className="w-5 h-5 text-[#C8A97E]" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-['Cormorant_Garamond'] font-semibold text-[20px] text-[#F0F0EE]">{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Icons.MapPin className="w-3 h-3 text-[#8A8A8D]" />
          <span className="font-['Manrope'] text-[13px] text-[#8A8A8D]">{city}</span>
        </div>
      </div>

      <div className="text-[#C8A97E]">
        <Icons.ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 bg-[#0A0A0C] sticky top-0 z-30">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Icons.Sparkles className="w-5 h-5 text-[#C8A97E]" />
          <span className="font-['Manrope'] text-xs font-bold uppercase tracking-widest text-[#C8A97E]">
            Curabo
          </span>
        </div>
        
        <h1 className="font-['Cormorant_Garamond'] font-light text-[32px] text-[#F0F0EE] text-center mb-2">
          Willkommen
        </h1>
        <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] text-center max-w-xs mx-auto">
          Wählen Sie Ihre Klinik, um Ihre persönliche Reise zu beginnen.
        </p>
      </header>

      {/* Search Section */}
      <div className="px-6 mb-8">
        <div className="relative group w-full">
          <Icons.Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${state === 'searchActive' ? 'text-[#C8A97E]' : 'text-[#8A8A8D]'}`} />
          <input
            type="text"
            placeholder="Klinikname oder Stadt..."
            value={state === 'searchActive' ? 'Berl' : ''}
            className={`w-full bg-[#18181B] border rounded-full py-4 pl-12 pr-12 text-[#F0F0EE] placeholder-[#8A8A8D] transition-all ${state === 'searchActive' ? 'border-[#C8A97E]' : 'border-[#C8A97E20] focus:border-[#C8A97E]'}`}
          />
          {state === 'searchActive' && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8D] hover:text-[#F0F0EE] transition-colors">
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 px-6 pb-12 overflow-y-auto">
        {state === 'noResults' ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 rounded-full bg-[#18181B] border border-[#C8A97E20] mb-4 flex items-center justify-center">
              <Icons.SearchX className="w-8 h-8 text-[#8A8A8D] flex-shrink-0" />
            </div>
            <h3 className="font-['Manrope'] font-semibold text-[16px] text-[#F0F0EE] mb-2">
              Keine Ergebnisse
            </h3>
            <p className="font-['Manrope'] text-[13px] text-[#8A8A8D]">
              Versuchen Sie es mit einem anderen Suchbegriff.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-['Manrope'] font-bold text-[11px] uppercase tracking-widest text-[#C8A97E] mb-2">
              {state === 'searchActive' ? 'Ergebnisse' : 'Empfohlene Kliniken'}
            </h4>
            
            {renderClinicCard("Aesthetik Studio Berlin", "Berlin", state === 'searchActive')}
            {renderClinicCard("Praxis Dr. Müller", "München")}
            {renderClinicCard("Skin Lounge Zurich", "Zürich")}
            {renderClinicCard("Dermatologie am Dom", "Köln")}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClinicSelectionScreen;