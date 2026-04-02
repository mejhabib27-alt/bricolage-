import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Info,
  FileText,
  Send,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { CATEGORIES } from '../constants/services';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Votre projet', description: 'Quel est votre besoin ?' },
  { id: 2, title: 'Détails', description: 'Précisions techniques' },
  { id: 3, title: 'Coordonnées', description: 'Où vous joindre ?' },
];

export default function RequestQuote() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    taskType: '',
    description: '',
    budget: 0,
    location: profile?.location || '',
    date: '',
    urgency: 'Normal',
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'quote_requests'), {
        ...formData,
        clientId: user?.uid || 'anonymous',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error("Error creating quote request:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Demande envoyée !</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Votre demande de devis a été transmise. Nos experts vous recontacteront dans les plus brefs délais.</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full py-4 rounded-2xl">Retour à l'accueil</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Demander un devis gratuit</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Décrivez votre projet et recevez des offres personnalisées de nos meilleurs prestataires.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-4 mb-12">
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

        <div className="bg-white rounded-[48px] p-8 lg:p-12 border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
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
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Quel est votre projet ?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.name }))}
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
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          formData.category === cat.name ? 'text-primary' : 'text-gray-500'
                        }`}>{cat.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Description détaillée</label>
                  <textarea 
                    className="w-full p-6 bg-gray-50 rounded-[32px] border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none font-medium text-gray-700"
                    placeholder="Expliquez-nous votre besoin en quelques lignes..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-grow"
              >
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Précisions techniques</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Niveau d'urgence</label>
                    <div className="space-y-3">
                      {['Normal', 'Urgent', 'Immédiat'].map(u => (
                        <button
                          key={u}
                          onClick={() => setFormData(prev => ({ ...prev, urgency: u }))}
                          className={`w-full p-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-between ${
                            formData.urgency === u ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-gray-50 text-gray-500'
                          }`}
                        >
                          {u}
                          {formData.urgency === u && <Check size={18} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Date souhaitée</label>
                    <input 
                      type="date"
                      className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Budget approximatif (€)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="number"
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                      placeholder="Ex: 500"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    />
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
                className="space-y-8 flex-grow"
              >
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Vos coordonnées</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="email"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="tel"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ville / Code Postal</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                  <AlertCircle className="text-blue-500 flex-shrink-0" size={20} />
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Vos données sont protégées et ne seront partagées qu'avec les prestataires sélectionnés pour votre projet.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
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
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.category}
                className={`btn-primary px-10 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 ${
                  currentStep === 1 && !formData.category ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Suivant
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.email}
                className={`btn-primary px-12 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 ${
                  loading || !formData.name || !formData.email ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Envoi...' : 'Envoyer ma demande'}
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
