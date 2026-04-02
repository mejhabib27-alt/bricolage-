import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Star, MapPin, Clock, CheckCircle, ChevronDown, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants/services';
import { Provider } from '../types';

const mockProviders: Provider[] = [
  {
    uid: '1',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewsCount: 124,
    location: 'Paris, France',
    bio: 'Expert en bricolage et montage de meubles avec plus de 10 ans d\'expérience.',
    services: ['Bricolage', 'Montage de meubles'],
    hourlyRate: 25,
    completedJobs: 450,
    isVerified: true,
    languages: ['Français', 'Anglais'],
    skills: ['Plomberie', 'Électricité', 'Menuiserie'],
  },
  {
    uid: '2',
    name: 'Marie Laurent',
    email: 'marie@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviewsCount: 89,
    location: 'Lyon, France',
    bio: 'Spécialiste du ménage et de l\'organisation à domicile. Ponctuelle et rigoureuse.',
    services: ['Ménage', 'Repassage'],
    hourlyRate: 20,
    completedJobs: 320,
    isVerified: true,
    languages: ['Français'],
    skills: ['Nettoyage vapeur', 'Organisation'],
  },
  {
    uid: '3',
    name: 'Pierre Durand',
    email: 'pierre@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviewsCount: 56,
    location: 'Marseille, France',
    bio: 'Jardinier passionné. Je m\'occupe de votre jardin comme du mien.',
    services: ['Jardinage'],
    hourlyRate: 30,
    completedJobs: 180,
    isVerified: false,
    languages: ['Français', 'Espagnol'],
    skills: ['Taille de haies', 'Tonte de pelouse'],
  },
  {
    uid: '4',
    name: 'Sophie Martin',
    email: 'sophie@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    reviewsCount: 42,
    location: 'Bordeaux, France',
    bio: 'Aide au déménagement et transport de petits colis. Dynamique et soigneuse.',
    services: ['Déménagement'],
    hourlyRate: 35,
    completedJobs: 95,
    isVerified: true,
    languages: ['Français', 'Anglais'],
    skills: ['Port de charges lourdes', 'Emballage'],
  },
  {
    uid: '5',
    name: 'Lucas Petit',
    email: 'lucas@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    rating: 4.6,
    reviewsCount: 31,
    location: 'Lille, France',
    bio: 'Informaticien de formation, je vous aide pour tous vos problèmes tech.',
    services: ['Informatique'],
    hourlyRate: 40,
    completedJobs: 65,
    isVerified: true,
    languages: ['Français', 'Anglais'],
    skills: ['Dépannage PC', 'Installation réseau'],
  },
  {
    uid: '6',
    name: 'Emma Roux',
    email: 'emma@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewsCount: 156,
    location: 'Nantes, France',
    bio: 'Garde d\'enfants et aide aux devoirs. Patiente et créative.',
    services: ['Garde d\'enfants'],
    hourlyRate: 18,
    completedJobs: 280,
    isVerified: true,
    languages: ['Français', 'Allemand'],
    skills: ['Jeux éducatifs', 'Aide aux devoirs'],
  },
  {
    uid: '7',
    name: 'Thomas Morel',
    email: 'thomas@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviewsCount: 74,
    location: 'Strasbourg, France',
    bio: 'Peintre en bâtiment. Finitions soignées et respect des délais.',
    services: ['Peinture'],
    hourlyRate: 28,
    completedJobs: 110,
    isVerified: true,
    languages: ['Français'],
    skills: ['Peinture murale', 'Pose de papier peint'],
  },
  {
    uid: '8',
    name: 'Julie Simon',
    email: 'julie@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviewsCount: 48,
    location: 'Toulouse, France',
    bio: 'Cours de cuisine à domicile. Partageons ensemble ma passion pour la gastronomie.',
    services: ['Cuisine'],
    hourlyRate: 45,
    completedJobs: 52,
    isVerified: false,
    languages: ['Français', 'Italien'],
    skills: ['Cuisine italienne', 'Pâtisserie'],
  },
  {
    uid: '9',
    name: 'Antoine Bernard',
    email: 'antoine@example.com',
    role: 'jobber',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewsCount: 210,
    location: 'Nice, France',
    bio: 'Plombier certifié. Intervention rapide pour tous vos dépannages.',
    services: ['Plomberie'],
    hourlyRate: 50,
    completedJobs: 380,
    isVerified: true,
    languages: ['Français'],
    skills: ['Détection de fuite', 'Installation sanitaire'],
  },
];

const categoriesFilter = ['Tous', ...CATEGORIES.map(c => c.name)];

const Services: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('c') || 'Tous');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('q');
    const c = searchParams.get('c');
    if (q) setSearchQuery(q);
    if (c) setSelectedCategory(c);
  }, [searchParams]);

  const handleCategoryClick = (cat: string) => {
    if (cat === 'Tous') {
      setSelectedCategory('Tous');
    } else {
      // Find category ID from name
      const category = CATEGORIES.find(c => c.name === cat);
      if (category) {
        navigate(`/category/${category.id}`);
      } else {
        setSelectedCategory(cat);
      }
    }
  };

  const filteredProviders = useMemo(() => {
    return mockProviders
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.bio?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || p.services.includes(selectedCategory);
        const matchesPrice = p.hourlyRate <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'price-low') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'price-high') return b.hourlyRate - a.hourlyRate;
        if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
        return 0;
      });
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const paginatedProviders = filteredProviders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 pt-32 pb-12">
        <div className="container-max px-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Nos Prestataires</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Trouvez le professionnel idéal parmi nos {mockProviders.length} experts vérifiés et qualifiés.
          </p>
        </div>
      </section>

      <div className="container-max px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Search size={18} className="text-primary" /> Recherche
              </h3>
              <input 
                type="text" 
                placeholder="Nom, compétence..." 
                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Filter size={18} className="text-primary" /> Catégories
              </h3>
              <div className="space-y-2">
                {categoriesFilter.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-all ${selectedCategory === cat ? 'bg-primary text-white font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" /> Prix max : {priceRange}€/h
              </h3>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5"
                className="w-full accent-primary"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>10€/h</span>
                <span>100€/h</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Sorting & Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">
                <span className="text-gray-900 font-bold">{filteredProviders.length}</span> prestataires trouvés
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium">Trier par :</span>
                <select 
                  className="bg-gray-50 px-4 py-2 rounded-xl outline-none border-none text-sm font-bold text-gray-700 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Meilleures notes</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="jobs">Nombre de missions</option>
                </select>
              </div>
            </div>

            {/* Providers Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedProviders.map((provider, idx) => (
                  <motion.div
                    key={provider.uid}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <div className="flex gap-4 mb-6">
                      <div className="relative">
                        <img 
                          src={provider.photoUrl} 
                          alt={provider.name} 
                          className="w-20 h-20 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {provider.isVerified && (
                          <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-lg border-4 border-white">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{provider.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <MapPin size={14} className="text-secondary" />
                          {provider.location}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={16} className="text-accent fill-accent" />
                          <span className="font-bold text-gray-900">{provider.rating}</span>
                          <span className="text-gray-400 text-xs">({provider.reviewsCount} avis)</span>
                        </div>
                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {provider.skills?.slice(0, 3).map((skill, i) => {
                            const colors = [
                              'bg-blue-50 text-blue-600 border-blue-100',
                              'bg-purple-50 text-purple-600 border-purple-100',
                              'bg-amber-50 text-amber-600 border-amber-100',
                              'bg-emerald-50 text-emerald-600 border-emerald-100',
                              'bg-rose-50 text-rose-600 border-rose-100'
                            ];
                            const colorClass = colors[i % colors.length];
                            return (
                              <span 
                                key={skill} 
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-primary">{provider.hourlyRate}€</p>
                        <p className="text-xs text-gray-400 font-medium">/ heure</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {provider.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {provider.services.map(service => (
                        <span key={service} className="px-3 py-1 bg-teal-50 text-primary text-xs font-bold rounded-lg">
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <CheckCircle size={14} className="text-green-500" /> {provider.completedJobs} missions
                        </span>
                      </div>
                      <Link 
                        to={`/profile/${provider.uid}`}
                        className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                      >
                        Voir le profil <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-8">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all ${currentPage === idx + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Services;
