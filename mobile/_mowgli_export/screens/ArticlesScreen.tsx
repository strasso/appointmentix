import React from "react";
import * as Icons from "lucide-react";

export interface ArticlesScreenProps {
  state: string;
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  imageContext: string;
  readingTime: string;
  featured?: boolean;
}

/**
 * States:
 * - default: All articles visible.
 * - categoryFilter: Specific category selected (Hautpflege).
 */
const ArticlesScreen: React.FC<ArticlesScreenProps> = ({ state }) => {
  // Define article data with categories and metadata
  const articles: Article[] = [
    {
      id: 1,
      title: "Die Wissenschaft der Hyaluron-Säure",
      excerpt: "Erfahren Sie, wie Hyaluron-Säure wirkt, warum sie so effektiv ist und welche Arten von Produkten Sie in Ihre Routine aufnehmen sollten.",
      category: "Hautpflege",
      image: "./images/article-skincare.jpg",
      imageContext: "Featured Article Image",
      readingTime: "5 Min. Lesezeit",
      featured: true,
    },
    {
      id: 2,
      title: "Warum Wasser allein nicht reicht",
      excerpt: "Die Bedeutung von Feuchtigkeitsbindern für einen echten Glow.",
      category: "Wellness",
      image: "./images/article-hydration.jpg",
      imageContext: "Article about hydration and skincare",
      readingTime: "3 Min. Lesezeit",
    },
    {
      id: 3,
      title: "Yoga für strahlende Haut",
      excerpt: "Wie Stressreduktion Ihre Hautgesundheit beeinflusst.",
      category: "Trends",
      image: "./images/article-relaxation.jpg",
      imageContext: "Person practicing yoga in calm environment",
      readingTime: "4 Min. Lesezeit",
    },
    {
      id: 4,
      title: "Superfoods für Ihre Haut",
      excerpt: "Entdecken Sie, welche Nährstoffe Ihre Haut von innen heraus stärken.",
      category: "Ernährung",
      image: "./images/article-food.jpg",
      imageContext: "Fresh healthy foods and ingredients",
      readingTime: "6 Min. Lesezeit",
    },
  ];

  // Determine active category based on state
  const activeCategory = state === 'categoryFilter' ? 'Hautpflege' : 'Alle';

  // Filter articles based on active category
  const filteredArticles = activeCategory === 'Alle' 
    ? articles 
    : articles.filter(article => article.category === activeCategory);

  // Split into featured and secondary articles
  const featuredArticle = filteredArticles.find(a => a.featured);
  const secondaryArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-['Manrope'] text-[#F0F0EE] flex flex-col pb-24">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 bg-[#0A0A0C] sticky top-0 z-30 border-b border-[#C8A97E10]">
        <h1 className="font-['Cormorant_Garamond'] font-semibold text-[28px] text-[#F0F0EE] mb-6">
          Wissen & Tipps
        </h1>
        
        {/* Categories with gradient fade indicator */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Alle', 'Hautpflege', 'Ernährung', 'Wellness', 'Trends'].map((cat) => {
              const isActive = activeCategory === cat;
              
              return (
                <button 
                  key={cat}
                  className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${isActive ? 'bg-[#C8A97E] text-[#0A0A0C]' : 'bg-[#18181B] text-[#8A8A8D] border border-[#C8A97E20]'}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {/* Gradient fade on right edge */}
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0A0A0C] to-transparent pointer-events-none"></div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">
        {/* Featured Article */}
        {featuredArticle && (
          <article className="group cursor-pointer">
            <div className="w-full h-64 rounded-[14px] overflow-hidden mb-4 relative">
              <img 
                src={featuredArticle.image} 
                alt={featuredArticle.title} 
                data-context={featuredArticle.imageContext}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2 py-1 bg-[#C8A97E] text-[#0A0A0C] text-[10px] uppercase font-bold rounded mb-2 inline-block">
                  {featuredArticle.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Icons.Clock className="w-3 h-3 text-[#C8A97E]" />
              <span className="text-[12px] text-[#C8A97E]">{featuredArticle.readingTime}</span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] font-semibold text-[24px] text-[#F0F0EE] mb-2 leading-tight tracking-wide">
              {featuredArticle.title}
            </h2>
            <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] line-clamp-2">
              {featuredArticle.excerpt}
            </p>
          </article>
        )}

        {/* Secondary Articles */}
        {secondaryArticles.length > 0 ? (
          <div className="space-y-6">
            {secondaryArticles.map((article) => (
              <article key={article.id} className="flex gap-4 group cursor-pointer">
                <div className="w-28 h-28 rounded-[12px] overflow-hidden shrink-0 relative">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    data-context={article.imageContext}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center border-l-2 border-[#C8A97E20] pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#C8A97E] tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-[#8A8A8D]">•</span>
                    <Icons.Clock className="w-3 h-3 text-[#8A8A8D]" />
                    <span className="text-[10px] text-[#8A8A8D]">{article.readingTime}</span>
                  </div>
                  <h3 className="font-['Manrope'] font-semibold text-[16px] text-[#F0F0EE] mb-1 leading-snug">
                    {article.title}
                  </h3>
                  <p className="font-['Manrope'] text-[12px] text-[#8A8A8D] line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#18181B] flex items-center justify-center mb-4">
              <Icons.FileText className="w-6 h-6 text-[#C8A97E]" />
            </div>
            <h3 className="font-['Cormorant_Garamond'] font-semibold text-[20px] text-[#F0F0EE] mb-2">
              Keine Artikel gefunden
            </h3>
            <p className="font-['Manrope'] text-[14px] text-[#8A8A8D] max-w-[280px]">
              Es gibt noch keine Artikel in dieser Kategorie. Schauen Sie später noch einmal vorbei.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticlesScreen;