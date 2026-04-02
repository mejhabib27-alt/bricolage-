import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../App';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { CATEGORIES } from '../constants/services';
import { 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Wallet, 
  Star, 
  ArrowRight,
  Briefcase,
  Users,
  Zap
} from 'lucide-react';

export default function BecomeProvider() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [formData, setFormData] = useState({
    hourlyRate: 25,
    skills: [] as string[],
    subSkills: [] as string[],
    experience: 'intermediate',
    bio: '',
    availability: [] as string[],
    equipment: [] as string[],
    serviceRadius: 20,
    location: profile?.location || ''
  });

  const handleBecomeJobber = async () => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          setStep('form');
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
      return;
    }
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'jobber',
        services: formData.skills,
        subServices: formData.subSkills,
        hourlyRate: formData.hourlyRate,
        experience: formData.experience,
        bio: formData.bio || profile?.bio || '',
        availability: formData.availability,
        equipment: formData.equipment,
        serviceRadius: formData.serviceRadius,
        location: formData.location || profile?.location || '',
        completedJobs: 0,
        gallery: [],
        rating: 5,
        reviewsCount: 0
      });
      setStep('success');
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Une erreur est survenue lors de la mise à jour de votre profil.");
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const isSelected = prev.skills.includes(skill);
      const newSkills = isSelected 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      
      // Also clear subskills if category is removed
      const category = CATEGORIES.find(c => c.name === skill);
      const newSubSkills = isSelected && category
        ? prev.subSkills.filter(ss => !category.services.some(s => s.name === ss))
        : prev.subSkills;

      return { ...prev, skills: newSkills, subSkills: newSubSkills };
    });
  };

  const toggleSubSkill = (subSkill: string) => {
    setFormData(prev => ({
      ...prev,
      subSkills: prev.subSkills.includes(subSkill)
        ? prev.subSkills.filter(s => s !== subSkill)
        : [...prev.subSkills, subSkill]
    }));
  };

  const toggleAvailability = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const toggleEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(i => i !== item)
        : [...prev.equipment, item]
    }));
  };

  const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const COMMON_EQUIPMENT = ['Véhicule personnel', 'Outillage de base', 'Matériel de nettoyage', 'Smartphone', 'Remorque', 'Escabeau'];

  const availableSkills = CATEGORIES.map(c => c.name);

  const benefits = [
    {
      icon: <Wallet className="text-secondary" size={32} />,
      title: "Complétez vos revenus",
      description: "Gagnez de l'argent en rendant service à vos voisins selon vos compétences et vos tarifs."
    },
    {
      icon: <Clock className="text-secondary" size={32} />,
      title: "Travaillez quand vous voulez",
      description: "Soyez votre propre patron. Choisissez vos horaires et les missions qui vous intéressent."
    },
    {
      icon: <ShieldCheck className="text-secondary" size={32} />,
      title: "Paiements sécurisés",
      description: "Tous les paiements sont sécurisés et garantis par notre plateforme. Pas de mauvaise surprise."
    },
    {
      icon: <TrendingUp className="text-secondary" size={32} />,
      title: "Boostez votre réputation",
      description: "Accumulez des avis positifs et devenez un jobbeur de référence dans votre secteur."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Créez votre profil",
      description: "Inscrivez-vous gratuitement et détaillez vos compétences, votre expérience et vos tarifs."
    },
    {
      number: "02",
      title: "Postulez aux missions",
      description: "Consultez les demandes autour de vous et proposez vos services aux clients."
    },
    {
      number: "03",
      title: "Réalisez la prestation",
      description: "Effectuez le travail avec soin et professionnalisme pour satisfaire votre client."
    },
    {
      number: "04",
      title: "Recevez votre paiement",
      description: "Une fois la mission validée, votre rémunération est versée directement sur votre compte."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gray-50 -z-10" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-bold mb-8">
                    <Zap size={16} />
                    Rejoignez 15 000+ jobbeurs actifs
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-display font-bold text-gray-900 mb-8 leading-tight">
                    Gagnez de l'argent en <span className="text-primary">rendant service</span>
                  </h1>
                  <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-lg">
                    Devenez jobbeur sur Yoojo Clone et transformez votre temps libre en revenus. Bricolage, ménage, jardinage... vos talents ont de la valeur.
                  </p>
                  
                  {profile?.role === 'jobber' ? (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="btn-primary px-10 py-5 text-lg flex items-center gap-3 shadow-xl shadow-primary/20"
                    >
                      Accéder à mon tableau de bord
                      <ArrowRight size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleBecomeJobber}
                      className="btn-primary px-10 py-5 text-lg flex items-center gap-3 shadow-xl shadow-primary/20"
                    >
                      {user ? "Devenir Jobbeur maintenant" : "S'inscrire comme Jobbeur"}
                      <ArrowRight size={20} />
                    </button>
                  )}

                  <div className="mt-12 flex items-center gap-8">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
                      </div>
                      <p className="text-sm font-bold text-gray-900">4.9/5 basé sur 50k+ avis</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-[60px] overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1000" 
                      alt="Jobber working"
                      className="w-full aspect-[4/5] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12 text-white">
                      <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30">
                        <p className="text-lg font-medium mb-2 italic">"Grâce à Yoojo, j'ai pu lancer mon activité de bricolage et je gagne aujourd'hui 1500€ de plus par mois."</p>
                        <p className="font-bold">— Thomas, Jobbeur depuis 2 ans</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                  <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">Pourquoi devenir jobbeur ?</h2>
                  <p className="text-lg text-gray-500">
                    Rejoignez une communauté de confiance et profitez d'outils performants pour développer votre activité.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-10 rounded-[40px] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all group"
                    >
                      <div className="mb-8 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                      <p className="text-gray-500 leading-relaxed">{benefit.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 py-24"
          >
            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-100 shadow-2xl">
              <h2 className="text-3xl font-display font-bold mb-8 text-center">Complétez votre profil jobbeur</h2>
              
              <div className="space-y-12">
                {/* Categories */}
                <div>
                  <label className="block text-lg font-bold mb-4">Quels services proposez-vous ?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleSkill(cat.name)}
                        className={`px-4 py-3 rounded-2xl border-2 transition-all font-semibold text-sm flex flex-col items-center gap-2 ${
                          formData.skills.includes(cat.name)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                        }`}
                      >
                        <cat.icon size={20} />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-skills */}
                {formData.skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                  >
                    <label className="block text-lg font-bold">Précisez vos spécialités</label>
                    <div className="space-y-6">
                      {CATEGORIES.filter(c => formData.skills.includes(c.name)).map(cat => (
                        <div key={cat.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <cat.icon size={14} />
                            {cat.name}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cat.services.map(service => (
                              <button
                                key={service.id}
                                onClick={() => toggleSubSkill(service.name)}
                                className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs ${
                                  formData.subSkills.includes(service.name)
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                }`}
                              >
                                {service.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Availability & Radius */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-lg font-bold mb-4">Disponibilités habituelles</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleAvailability(day)}
                          className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs ${
                            formData.availability.includes(day)
                              ? 'border-secondary bg-secondary text-white'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-lg font-bold mb-4">Rayon d'intervention ({formData.serviceRadius} km)</label>
                    <input 
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={formData.serviceRadius}
                      onChange={(e) => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-secondary"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>5 km</span>
                      <span>50 km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-lg font-bold mb-4">Matériel & Équipement</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_EQUIPMENT.map(item => (
                      <button
                        key={item}
                        onClick={() => toggleEquipment(item)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs ${
                          formData.equipment.includes(item)
                            ? 'border-accent bg-accent text-white'
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rate & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-bold mb-4">Tarif horaire (€/h)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-lg"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">€ / h</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-lg font-bold mb-4">Niveau d'expérience</label>
                    <select 
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                    >
                      <option value="beginner">Débutant (0-2 ans)</option>
                      <option value="intermediate">Intermédiaire (2-5 ans)</option>
                      <option value="expert">Expert / Professionnel (5+ ans)</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-lg font-bold mb-4">Votre ville / Code postal</label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Paris 75001"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-4">Présentez-vous en quelques mots</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Décrivez votre parcours, vos points forts, votre sérieux..."
                    className="w-full px-6 py-4 bg-gray-50 rounded-[32px] border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none font-medium"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={formData.skills.length === 0 || !formData.location}
                  className="w-full btn-primary py-5 text-lg shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  Finaliser mon inscription
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto px-6 py-32 text-center"
          >
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">Félicitations !</h2>
            <p className="text-xl text-gray-500 mb-12">
              Vous êtes désormais jobbeur sur Yoojo Clone. Vous pouvez dès maintenant consulter les missions à proximité.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary px-12 py-5 text-lg"
            >
              Accéder à mon tableau de bord
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
