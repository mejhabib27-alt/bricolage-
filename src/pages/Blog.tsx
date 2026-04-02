import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight, Tag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = ['Tous', 'Bricolage', 'Ménage', 'Jardinage', 'Conseils', 'Actualités'];

const blogPosts = [
  {
    id: 1,
    title: "10 astuces pour un ménage de printemps efficace",
    excerpt: "Découvrez nos meilleurs conseils pour nettoyer votre maison de fond en comble sans stress.",
    category: "Ménage",
    author: "Marie Laurent",
    date: "15 Mars 2026",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800",
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Comment choisir le bon jobbeur pour vos travaux ?",
    excerpt: "Vérifications, avis, tarifs... tout ce qu'il faut savoir avant de confier vos clés à un prestataire.",
    category: "Conseils",
    author: "Jean Dupont",
    date: "12 Mars 2026",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min"
  },
  {
    id: 3,
    title: "Jardinage : que planter en ce mois de Mars ?",
    excerpt: "Le printemps arrive ! Voici la liste des fleurs et légumes à semer dès maintenant dans votre jardin.",
    category: "Jardinage",
    author: "Pierre Durand",
    date: "10 Mars 2026",
    image: "https://images.unsplash.com/photo-1416870230247-d065a7a1c8ae?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min"
  },
  {
    id: 4,
    title: "Déménagement : la checklist ultime pour ne rien oublier",
    excerpt: "De l'emballage des cartons au changement d'adresse, suivez notre guide étape par étape.",
    category: "Actualités",
    author: "Sophie Martin",
    date: "05 Mars 2026",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&q=80&w=800",
    readTime: "10 min"
  },
  {
    id: 5,
    title: "Réparer une fuite d'eau : les gestes de premier secours",
    excerpt: "En attendant le plombier, voici comment limiter les dégâts et couper l'eau en toute sécurité.",
    category: "Bricolage",
    author: "Antoine Bernard",
    date: "01 Mars 2026",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min"
  },
  {
    id: 6,
    title: "L'économie collaborative : pourquoi ça change nos vies ?",
    excerpt: "Analyse d'une tendance qui redéfinit notre rapport à la consommation et au travail.",
    category: "Actualités",
    author: "Admin Yoojo",
    date: "25 Février 2026",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800",
    readTime: "12 min"
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-8 leading-tight">
              Le Mag <span className="text-primary">Yoojo</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Conseils d'experts, guides pratiques et actualités de la communauté pour vous simplifier la vie au quotidien.
            </p>
            
            <div className="relative max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="Rechercher un article..." 
                className="w-full pl-16 pr-8 py-5 bg-white rounded-[24px] shadow-xl shadow-gray-200/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar flex items-center gap-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-[40px] overflow-hidden mb-8 aspect-[4/3] shadow-xl shadow-gray-200/50">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-xs font-bold text-primary uppercase tracking-widest">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{post.readTime} de lecture</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-500 leading-relaxed mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${post.author}`} alt={post.author} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{post.author}</span>
                    </div>
                    <span className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                      Lire la suite <ArrowRight size={16} />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-primary/10 backdrop-blur-xl rounded-[60px] p-12 lg:p-20 border border-white/5 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-grow text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6">Ne manquez aucun conseil</h2>
              <p className="text-xl text-blue-100/60 max-w-xl">
                Inscrivez-vous à notre newsletter et recevez chaque semaine les meilleures astuces pour votre maison.
              </p>
            </div>
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="px-8 py-5 bg-white/10 border border-white/10 rounded-[24px] text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 min-w-[300px] text-lg"
              />
              <button className="px-10 py-5 bg-white text-primary font-bold rounded-[24px] hover:bg-blue-50 transition-all text-lg shadow-2xl shadow-white/10">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
