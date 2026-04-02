import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Calendar, Clock, ChevronRight, Star, 
  Shield, Heart, Zap, CheckCircle, ArrowRight, MessageSquare,
  Hammer, Sparkles, Truck, Sprout, Paintbrush, Laptop, 
  Baby, ChefHat, Quote, Users, TrendingUp, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Testimonial } from '../types';

import { CATEGORIES } from '../constants/services';

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    role: 'Cliente régulière',
    content: 'YoojoClone a changé ma façon de gérer mon temps. J\'ai trouvé une aide ménagère incroyable en moins de 24h. Le système de paiement est ultra sécurisé, je recommande !',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    rating: 5,
  },
  {
    id: '2',
    name: 'Jean Dupont',
    role: 'Bricoleur passionné',
    content: 'En tant que prestataire, cette plateforme me permet de trouver des missions proches de chez moi très facilement. L\'interface est intuitive et le support est réactif.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    rating: 5,
  },
  {
    id: '3',
    name: 'Marie Laurent',
    role: 'Maman active',
    content: 'J\'utilise le service de garde d\'enfants ponctuellement. Les profils sont vérifiés, ce qui me rassure énormément en tant que parent. Un vrai gain de sérénité.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    rating: 4,
  },
  {
    id: '4',
    name: 'Lucas Bernard',
    role: 'Étudiant',
    content: 'J\'ai pu arrondir mes fins de mois en proposant mes services de jardinage. C\'est flexible et gratifiant. Une super opportunité pour les jeunes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 5,
  },
  {
    id: '5',
    name: 'Emma Roux',
    role: 'Nouvelle arrivante',
    content: 'Je viens d\'emménager et j\'avais besoin de bras pour mon déménagement. J\'ai trouvé 3 personnes formidables qui m\'ont aidée avec soin et efficacité.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    rating: 5,
  },
  {
    id: '6',
    name: 'Pierre Durand',
    role: 'Retraité',
    content: 'J\'avais un problème informatique complexe. Un jeune homme très patient est venu m\'aider. Le service est humain et de grande qualité.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    rating: 5,
  },
];

const featuredProviders = [
  {
    uid: '1',
    name: 'Alexandre G.',
    role: 'Expert Bricolage',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    tags: ['Plomberie', 'Électricité'],
  },
  {
    uid: '2',
    name: 'Mélanie R.',
    role: 'Spécialiste Ménage',
    rating: 4.8,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    tags: ['Nettoyage', 'Repassage'],
  },
  {
    uid: '3',
    name: 'Thomas L.',
    role: 'Jardinier Pro',
    rating: 5.0,
    reviews: 48,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    tags: ['Taille', 'Entretien'],
  },
  {
    uid: '4',
    name: 'Julie D.',
    role: 'Aide Déménagement',
    rating: 4.7,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    tags: ['Transport', 'Emballage'],
  },
];

const popularServices = [
  { name: 'Montage de meubles IKEA', price: 'À partir de 25€', icon: Hammer, categoryId: 'bricolage', serviceId: 'montage-meubles' },
  { name: 'Ménage de printemps', price: 'À partir de 20€/h', icon: Sparkles, categoryId: 'menage', serviceId: 'nettoyage-domicile' },
  { name: 'Tonte de pelouse', price: 'À partir de 30€', icon: Sprout, categoryId: 'jardinage', serviceId: 'tonte-pelouse' },
  { name: 'Installation luminaire', price: 'À partir de 40€', icon: Zap, categoryId: 'bricolage', serviceId: 'electricite' },
  { name: 'Aide au déménagement', price: 'À partir de 35€/h', icon: Truck, categoryId: 'demenagement', serviceId: 'aide-transport' },
  { name: 'Réparation fuite d\'eau', price: 'À partir de 50€', icon: Shield, categoryId: 'bricolage', serviceId: 'petite-plomberie' },
];

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSuggestions = useMemo(() => {
    const serviceNames = [
      'Montage de meubles', 'Ménage de printemps', 'Tonte de pelouse', 
      'Installation luminaire', 'Aide au déménagement', 'Réparation fuite d\'eau',
      'Peinture murale', 'Garde d\'enfants', 'Cours de cuisine', 'Dépannage informatique',
      'Nettoyage vitres', 'Taille de haies', 'Pose de parquet', 'Plomberie urgence'
    ];
    const categoryNames = CATEGORIES.map(c => c.name);
    return [...categoryNames, ...serviceNames];
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allSuggestions.filter(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, allSuggestions]);

  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (location) params.append('l', location);
    if (availabilityDate) params.append('d', availabilityDate);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />
        </div>

        <div className="relative z-10 container-max px-6 grid lg:grid-cols-2 gap-16 items-center pt-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-md rounded-full text-primary font-bold text-sm mb-6 border border-primary/20">
              <TrendingUp size={16} /> Leader du service à domicile
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-[1.1]">
              Le bon professionnel <br />
              <span className="text-secondary">pour chaque besoin</span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-xl leading-relaxed">
              Réservez un jobber qualifié près de chez vous en quelques clics. Simple, rapide et 100% sécurisé.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <CheckCircle className="text-primary" size={24} />
                </div>
                <div className="text-white">
                  <p className="font-bold">Vérifiés</p>
                  <p className="text-xs opacity-60">Profils contrôlés</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Shield className="text-secondary" size={24} />
                </div>
                <div className="text-white">
                  <p className="font-bold">Assurés</p>
                  <p className="text-xs opacity-60">Prestations garanties</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-8 text-gray-900">Trouvez votre jobbeur</h2>
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Quel service ?</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                  <input 
                    type="text" 
                    placeholder="Ex : Montage de meuble, Ménage..." 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  
                  <AnimatePresence>
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                      >
                        {filteredSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchQuery(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-none"
                          >
                            <Search size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-700">{suggestion}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Où ?</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                    <input 
                      type="text" 
                      placeholder="Ville..." 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Quand ?</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                    <input 
                      type="date" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={availabilityDate}
                      onChange={(e) => setAvailabilityDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSearch}
                className="w-full btn-primary flex items-center justify-center gap-3 py-5 text-lg"
              >
                <Search size={24} /> Rechercher un prestataire
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">Nos catégories de services</h2>
              <p className="text-gray-500 max-w-xl">Explorez nos domaines d'expertise et trouvez le spécialiste qu'il vous faut.</p>
            </div>
            <Link to="/services" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Voir tout <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {CATEGORIES.slice(0, 12).map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/category/${cat.id}`)}
              >
                <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all border border-gray-100 text-center">
                  <div className={`${cat.color} w-20 h-20 rounded-[24px] flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <cat.icon size={36} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Explorez</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding overflow-hidden">
        <div className="container-max">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Comment ça marche ?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Réservez votre prestation en moins de 2 minutes chrono.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 w-full h-0.5 bg-gray-100 hidden md:block" />
            
            {[
              { title: 'Décrivez votre besoin', desc: 'Précisez le service, le lieu et la date souhaitée.', icon: MessageSquare, color: 'bg-teal-50 text-primary' },
              { title: 'Choisissez votre jobber', desc: 'Comparez les profils, les avis et les prix.', icon: Users, color: 'bg-orange-50 text-secondary' },
              { title: 'Validez & Payez', desc: 'Payez en toute sécurité une fois le travail fini.', icon: Shield, color: 'bg-blue-50 text-blue-600' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 text-center"
              >
                <div className={`${step.color} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border-8 border-white`}>
                  <step.icon size={40} />
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-900 font-bold border border-gray-100">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers Carousel (Grid for simplicity) */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-max">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">Prestataires vedettes</h2>
              <p className="text-white/60 max-w-xl">Les profils les plus plébiscités par notre communauté ce mois-ci.</p>
            </div>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
            {featuredProviders.map((provider, idx) => (
              <motion.div
                key={provider.uid}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="min-w-[300px] md:min-w-[350px] snap-start bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 group hover:bg-white/10 transition-all"
              >
                <div className="relative mb-6">
                  <img 
                    src={provider.image} 
                    alt={provider.name} 
                    className="w-full aspect-square object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="text-accent fill-accent" /> {provider.rating}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{provider.name}</h3>
                <p className="text-primary text-sm font-bold mb-4 uppercase tracking-wider">{provider.role}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {provider.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-md uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to={`/profile/${provider.uid}`} className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                  Voir le profil <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Grid */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Services populaires</h2>
            <p className="text-gray-500">Les prestations les plus demandées en ce moment.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {popularServices.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-6 p-6 bg-white rounded-[32px] border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => navigate(`/category/${service.categoryId}/${service.serviceId}`)}
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <service.icon size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                  <p className="text-primary font-bold text-sm">{service.price}</p>
                </div>
                <button className="ml-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-secondary group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Double CTA */}
      <section className="section-padding bg-gray-50">
        <div className="container-max grid md:grid-cols-2 gap-8">
          {/* Client CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-primary p-12 rounded-[48px] text-white group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">Besoin d'un coup de main ?</h3>
              <p className="text-white/80 mb-8 text-lg leading-relaxed">
                Trouvez le prestataire idéal pour tous vos besoins du quotidien. Simple, rapide et sécurisé.
              </p>
              <Link to="/services" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl">
                Trouver un service <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Provider CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-secondary p-12 rounded-[48px] text-white group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">Devenez Jobbeur !</h3>
              <p className="text-white/80 mb-8 text-lg leading-relaxed">
                Complétez vos revenus en proposant vos services. Gérez votre emploi du temps en toute liberté.
              </p>
              <Link to="/become-provider" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-secondary font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl">
                S'inscrire comme jobbeur <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ils nous font confiance</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Découvrez les expériences de notre communauté.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative"
              >
                <div className="absolute -top-6 left-10 w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Quote size={24} />
                </div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < t.rating ? "text-accent fill-accent" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-gray-600 mb-10 italic leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={t.avatar} 
                    alt={t.name} 
                    className="w-14 h-14 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Request CTA */}
      <section className="section-padding bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2" />
        <div className="container-max relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                Un projet complexe ? <br />
                <span className="text-secondary">Demandez un devis gratuit</span>
              </h2>
              <p className="text-white/70 text-lg mb-12 max-w-lg leading-relaxed">
                Pour vos travaux de rénovation, déménagement ou tout autre projet nécessitant 
                une expertise particulière, nos jobbeurs certifiés vous répondent en moins de 24h.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/request-quote" className="btn-secondary px-10 py-5 rounded-2xl text-lg shadow-2xl shadow-secondary/20 flex items-center justify-center gap-3">
                  <FileText size={24} />
                  Demander mon devis
                </Link>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-white/60">+120 devis traités aujourd'hui</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 blur-3xl rounded-full" />
                <img 
                  src="https://picsum.photos/seed/project/800/600" 
                  alt="Project" 
                  className="rounded-[48px] shadow-2xl relative z-10 border-8 border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-max grid md:grid-cols-4 gap-12">
          {[
            { icon: Shield, title: '100% Sécurisé', desc: 'Paiements protégés et identités vérifiées.' },
            { icon: Heart, title: 'Assurance Incluse', desc: 'Toutes vos prestations sont assurées par AXA.' },
            { icon: Zap, title: 'Rapidité', desc: 'Trouvez un prestataire en moins de 24h.' },
            { icon: CheckCircle, title: 'Qualité Garantie', desc: 'Satisfait ou refait. Votre bonheur est notre priorité.' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-[28px] bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 group hover:bg-primary transition-all">
                <item.icon size={32} className="text-primary group-hover:text-white transition-all" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
