import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Info,
  ArrowRight,
  Search,
  Plus,
  X,
  Wrench,
  Image as ImageIcon
} from 'lucide-react';
import { CATEGORIES } from '../constants/services';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Service', description: 'Quel type de tâche ?' },
  { id: 2, title: 'Détails', description: 'Durée et matériel' },
  { id: 3, title: 'Budget', description: 'Urgence et prix' },
  { id: 4, title: 'Lieu', description: 'Où et quand ?' },
];

const DURATION_OPTIONS = [
  { id: '30min', label: '30 min' },
  { id: '1h', label: '1 heure' },
  { id: '2h', label: '2 heures' },
  { id: '4h', label: 'Demi-journée' },
  { id: '8h', label: 'Journée entière' },
  { id: 'multi', label: 'Plusieurs jours' },
];

const EQUIPMENT_TAGS = [
  'Perceuse', 'Tournevis', 'Escabeau', 'Tondeuse', 'Aspirateur', 'Produits ménagers', 'Pinceaux', 'Marteau', 'Niveau à bulle', 'Scie'
];

export default function NewMission() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: searchParams.get('category') || '',
    taskType: searchParams.get('service') || '',
    customTaskType: '',
    description: '',
    duration: '2h',
    customDuration: '',
    peopleCount: 1,
    equipment: 'Je fournis tout le matériel',
    customEquipment: [] as string[],
    urgency: 'Normal',
    flexibility: 'Flexible',
    budget: 50,
    location: profile?.location || '',
    date: '',
    time: '09:00',
  });

  useEffect(() => {
    const cat = searchParams.get('category');
    const serv = searchParams.get('service');
    if (cat || serv) {
      setFormData(prev => ({
        ...prev,
        category: cat || prev.category,
        taskType: serv || prev.taskType
      }));
    }
  }, [searchParams]);

  const [newEquip, setNewEquip] = useState('');

  const selectedCategory = useMemo(() => 
    CATEGORIES.find(c => c.name === formData.category), 
    [formData.category]
  );

  const handleNext = () => {
    if (currentStep === 1 && !formData.taskType && !formData.customTaskType) return;
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const finalTaskType = formData.taskType === 'Autre' ? formData.customTaskType : formData.taskType;
      const finalDuration = formData.duration === 'Personnalisé' ? formData.customDuration : formData.duration;

      await addDoc(collection(db, 'bookings'), {
        ...formData,
        taskType: finalTaskType,
        duration: finalDuration,
        clientId: user.uid,
        clientName: profile?.name || user.displayName,
        status: 'pending',
        createdAt: serverTimestamp(),
        totalAmount: formData.budget,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error("Error creating mission:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomEquip = () => {
    if (newEquip.trim() && !formData.customEquipment.includes(newEquip.trim())) {
      setFormData(prev => ({
        ...prev,
        customEquipment: [...prev.customEquipment, newEquip.trim()]
      }));
      setNewEquip('');
    }
  };

  const removeCustomEquip = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      customEquipment: prev.customEquipment.filter(t => t !== tag)
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[48px] shadow-2xl text-center max-w-md w-full border border-gray-100"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Mission publiée !</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Votre demande a été envoyée aux jobbeurs à proximité. Vous recevrez des propositions très bientôt.</p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-primary"
            />
          </div>
          <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">Redirection vers votre tableau de bord...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-display font-bold text-gray-900">Poster une mission</h1>
            <div className="text-right">
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Étape {currentStep} sur 4</p>
              <p className="text-sm font-bold text-gray-400">{STEPS[currentStep-1].title}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex-grow">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                  currentStep >= step.id ? 'bg-primary' : 'bg-gray-200'
                }`} />
                <p className={`mt-3 text-[10px] font-black uppercase tracking-widest text-center ${
                  currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[48px] p-8 lg:p-12 border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex-grow"
                  >
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Quel service recherchez-vous ?</h3>
                      <p className="text-gray-500">Choisissez une catégorie pour commencer votre demande.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.name, taskType: '' }))}
                          className={`p-6 rounded-[32px] border-2 transition-all text-center group ${
                            formData.category === cat.name 
                              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                              : 'border-gray-50 bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                            formData.category === cat.name ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:text-primary'
                          }`}>
                            {cat.icon}
                          </div>
                          <p className={`text-xs font-bold uppercase tracking-widest ${
                            formData.category === cat.name ? 'text-primary' : 'text-gray-500'
                          }`}>{cat.name}</p>
                        </button>
                      ))}
                    </div>

                    {formData.category && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 pt-8 border-t border-gray-50"
                      >
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Type de tâche spécifique</label>
                        <div className="flex flex-wrap gap-3">
                          {selectedCategory?.services.map((service) => (
                            <button
                              key={service.name}
                              onClick={() => setFormData(prev => ({ ...prev, taskType: service.name, customTaskType: '' }))}
                              className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                                formData.taskType === service.name 
                                  ? 'border-primary bg-primary text-white' 
                                  : 'border-gray-100 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {service.name}
                            </button>
                          ))}
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, taskType: 'Autre' }))}
                            className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                              formData.taskType === 'Autre' 
                                ? 'border-primary bg-primary text-white' 
                                : 'border-gray-100 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            Autre
                          </button>
                        </div>

                        {formData.taskType === 'Autre' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <input 
                              type="text"
                              value={formData.customTaskType}
                              onChange={(e) => setFormData(prev => ({ ...prev, customTaskType: e.target.value }))}
                              placeholder="Précisez le type de tâche (ex: Monter un meuble IKEA)"
                              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10 flex-grow"
                  >
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Détails de la mission</h3>
                      <p className="text-gray-500">Précisez vos besoins pour obtenir des devis précis.</p>
                    </div>

                    <div className="space-y-8">
                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Durée estimée de la mission</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                          {[...DURATION_OPTIONS, { id: 'custom', label: 'Personnalisé' }].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setFormData(prev => ({ ...prev, duration: opt.label }))}
                              className={`py-3 rounded-xl border-2 font-bold text-[10px] transition-all ${
                                formData.duration === opt.label 
                                  ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                                  : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {formData.duration === 'Personnalisé' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4"
                          >
                            <input 
                              type="text"
                              value={formData.customDuration}
                              onChange={(e) => setFormData(prev => ({ ...prev, customDuration: e.target.value }))}
                              placeholder="Ex: 3 jours, 15 minutes, etc."
                              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* People Count */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Nombre de personnes nécessaires</label>
                        <div className="flex gap-4">
                          {[1, 2, 3, 4, '5+'].map((num) => (
                            <button
                              key={num}
                              onClick={() => setFormData(prev => ({ ...prev, peopleCount: typeof num === 'string' ? 5 : num }))}
                              className={`w-14 h-14 rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-center ${
                                formData.peopleCount === (typeof num === 'string' ? 5 : num)
                                  ? 'border-primary bg-primary text-white' 
                                  : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Equipment */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Matériel nécessaire & Outillage</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          {[
                            'Je fournis tout le matériel',
                            'Le jobbeur doit tout apporter',
                            'Matériel partagé / À discuter'
                          ].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setFormData(prev => ({ ...prev, equipment: opt }))}
                              className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all text-center leading-tight ${
                                formData.equipment === opt 
                                  ? 'border-primary bg-primary text-white' 
                                  : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outils spécifiques (optionnel)</p>
                          <div className="flex flex-wrap gap-2">
                            {EQUIPMENT_TAGS.map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  if (formData.customEquipment.includes(tag)) {
                                    removeCustomEquip(tag);
                                  } else {
                                    setFormData(prev => ({ ...prev, customEquipment: [...prev.customEquipment, tag] }));
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  formData.customEquipment.includes(tag)
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={newEquip}
                              onChange={(e) => setNewEquip(e.target.value)}
                              placeholder="Ajouter un autre outil..."
                              className="flex-grow px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && addCustomEquip()}
                            />
                            <button 
                              onClick={addCustomEquip}
                              className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Photos Placeholder */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Photos de la mission (Optionnel)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <ImageIcon size={32} />
                          </div>
                          <p className="text-sm font-bold text-gray-900">Cliquez pour ajouter des photos</p>
                          <p className="text-xs text-gray-400 mt-2">Format JPG, PNG (max 5 Mo)</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10 flex-grow"
                  >
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Budget et Urgence</h3>
                      <p className="text-gray-500">Définissez vos priorités pour cette mission.</p>
                    </div>

                    <div className="space-y-10">
                      {/* Urgency */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Niveau d'urgence</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'Normal', label: 'Normal', icon: <Clock size={18} /> },
                            { id: 'Urgent', label: 'Urgent', icon: <AlertCircle size={18} /> },
                            { id: 'Immédiat', label: 'Immédiat', icon: <Calendar size={18} /> },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setFormData(prev => ({ ...prev, urgency: opt.id }))}
                              className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${
                                formData.urgency === opt.id 
                                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                  : 'border-gray-50 bg-white hover:border-gray-200'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                formData.urgency === opt.id ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'
                              }`}>
                                {opt.icon}
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-widest ${
                                formData.urgency === opt.id ? 'text-primary' : 'text-gray-500'
                              }`}>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Budget Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Budget estimé</label>
                          <span className="text-4xl font-display font-bold text-primary">{formData.budget}€</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="1000" 
                          step="10"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                          className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span>10€</span>
                          <span>500€</span>
                          <span>1000€</span>
                        </div>
                        <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                          <Info className="text-blue-500 flex-shrink-0" size={20} />
                          <p className="text-sm text-blue-700 font-medium leading-relaxed">
                            Ce budget est indicatif. Les jobbeurs pourront vous proposer des tarifs différents en fonction de la complexité réelle de la tâche.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10 flex-grow"
                  >
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Lieu et Description</h3>
                      <p className="text-gray-500">Dernière étape pour finaliser votre demande.</p>
                    </div>

                    <div className="space-y-8">
                      {/* Location */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Adresse de la mission</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input 
                            type="text" 
                            placeholder="Ex: 15 rue de la Paix, Paris"
                            className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Date souhaitée</label>
                          <input 
                            type="date" 
                            className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Heure</label>
                          <input 
                            type="time" 
                            className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Description libre</label>
                        <textarea 
                          placeholder="Décrivez précisément ce qu'il y a à faire..."
                          className="w-full p-6 bg-gray-50 rounded-[32px] border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none font-medium text-gray-700"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 font-bold text-sm transition-all ${
                    currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <ChevronLeft size={20} />
                  Retour
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={currentStep === 1 && !formData.taskType}
                    className={`btn-primary px-10 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 ${
                      currentStep === 1 && !formData.taskType ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Suivant
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.location || !formData.date}
                    className={`btn-primary px-12 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 ${
                      loading || !formData.location || !formData.date ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Publication...' : 'Publier ma mission'}
                    <Check size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Récapitulatif</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Search size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Service</p>
                    <p className="text-sm font-bold text-gray-900">{formData.taskType || formData.category || 'Non défini'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Durée & Urgence</p>
                    <p className="text-sm font-bold text-gray-900">{formData.duration} • {formData.urgency}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Matériel</p>
                    <p className="text-sm font-bold text-gray-900">{formData.equipment}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lieu</p>
                    <p className="text-sm font-bold text-gray-900 truncate w-40">{formData.location || 'À définir'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500">Budget estimé</span>
                    <span className="text-2xl font-display font-bold text-primary">{formData.budget}€</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium italic">Frais de service inclus</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-orange-50 rounded-3xl border border-orange-100">
                <div className="flex items-center gap-3 text-orange-600 mb-2">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Conseil</span>
                </div>
                <p className="text-xs text-orange-700 font-medium leading-relaxed">
                  Ajoutez des photos de votre besoin une fois la mission publiée pour recevoir des offres plus précises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
