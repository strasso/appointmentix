import React from "react";
import * as Icons from "lucide-react";

export interface ArticleDetailScreenProps {
  state: string;
}

/**
 * States:
 * - default: Article content visible.
 */
const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-12 px-6 flex justify-between items-center">
        <button className="w-10 h-10 rounded-full bg-[#18181B]/50 backdrop-blur-md flex items-center justify-center border border-[#C8A97E20] text-[#F0F0EE]">
          <Icons.ArrowLeft className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-full bg-[#18181B]/50 backdrop-blur-md flex items-center justify-center border border-[#C8A97E20] text-[#F0F0EE]">
          <Icons.Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[350px] w-full">
        <img 
          src="./images/skincare-woman-serum.jpg" 
          alt="Woman applying skincare serum" 
          data-context="Article Detail Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-black/50"></div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 -mt-12 relative z-10 pb-20">
        <div className="mb-6">
          <span className="px-3 py-1 bg-[#C8A97E] text-[#0A0A0C] text-[10px] uppercase font-bold rounded mb-3 inline-block">
            Hautpflege
          </span>
          <h1 className="font-['Cormorant_Garamond'] font-semibold text-[32px] leading-tight text-[#F0F0EE] mb-4">
            Die Wissenschaft der Hyaluron-Säure
          </h1>
          <div className="flex items-center gap-3 text-[#8A8A8D] text-[12px]">
            <span>Dr. Sarah Klein</span>
            <span>•</span>
            <span>5 Min Lesezeit</span>
          </div>
        </div>

        {/* Body Text */}
        <article className="prose prose-invert prose-p:text-[#F0F0EE] prose-headings:text-[#F0F0EE] font-['Manrope'] text-[15px] leading-relaxed text-[#D1D1D0] space-y-6">
          <p>
            Hyaluronsäure ist ein Buzzword, das in fast jeder Hautpflegeroutine auftaucht. Aber was macht sie so besonders? Es ist ein Zuckermolekül, das natürlich in unserem Körper vorkommt und dafür sorgt, dass unsere Gewebe geschmiert und feucht bleiben.
          </p>
          
          <div className="my-8 pl-4 border-l-2 border-[#C8A97E] italic text-[#C8A97E]">
            "Ein einziges Hyaluron-Molekül kann bis zu 1000mal seines eigenen Gewichts an Wasser binden."
          </div>

          <p>
            Mit dem Alter nimmt die natürliche Produktion ab. Die Haut wird trockener, feine Linien entstehen. Topische Hyaluronsäure kann dies nicht rückgängig machen, aber sie hilft, das Wasser in der Haut zu halten, was sie praller und glatter aussehen lässt.
          </p>

          <h3 className="font-['Cormorant_Garamond'] font-semibold text-[22px] text-[#F0F0EE] mt-8 mb-4">
            Welches Produkt wählen?
          </h3>
          <p>
            Achten Sie auf Molekülgröße. Niedermolekulare Hyaluronsäure dringt tiefer ein, während hochmolekulare auf der Oberfläche bleibt. Eine Kombination aus beiden ist oft am effektivsten.
          </p>
        </article>
      </main>
    </div>
  );
};

export default ArticleDetailScreen;