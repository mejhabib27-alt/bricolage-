import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Star, MapPin, Calendar, Clock } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../App';
import { addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES as CATEGORY_METADATA } from '../constants/services';
import { Service } from '../types';

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedSub, setSelectedSub] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('2');
  const [equipment, setEquipment] = useState('none');
  const [peopleCount, setPeopleCount] = useState('1');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const category = useMemo(() => CATEGORY_METADATA.find(cat => cat.id === id), [id]);

  useEffect(() => {
    if (!category) return;
    const q = query(collection(db, 'services'), where('category', '==', category.name));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setDbServices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
          <ChevronRight size={40} />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Catégorie non trouvée</h2>
        <p className="text-gray-500 mb-8">Désolé, nous n'avons pas trouvé la catégorie demandée.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour réserver un service.");
      return;
    }
    if (!selectedSub || !location || !date) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'bookings'), {
        clientId: user.uid,
        serviceId: id,
        subcategory: selectedSub,
        location,
        date: new Date(date),
        duration: parseInt(duration),
        equipment,
        peopleCount: parseInt(peopleCount),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setBookingStatus('success');
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Content */}
        <div className="flex-grow">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
            <ChevronRight className="rotate-180" size={16} />
            Retour aux catégories
          </Link>

          <div className="flex items-center gap-6 mb-8">
            <div className={`${category.bgColor} ${category.textColor} w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm`}>
              <category.icon size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">{category.name}</h1>
              <p className="text-gray-500 text-lg max-w-xl">{category.description}</p>
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold mb-6">Choisissez votre besoin spécifique</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {dbServices.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedSub(service.name)}
                className={`p-6 text-left rounded-2xl border-2 transition-all ${
                  selectedSub === service.name 
                    ? 'border-primary bg-blue-50/50 ring-4 ring-primary/10' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-lg block mb-1">{service.name}</span>
                <span className="text-sm text-gray-500">{service.description}</span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Pourquoi réserver sur Yoojo Clone ?</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">Qualité garantie</h4>
                  <p className="text-sm text-gray-500">Nos jobbeurs sont notés 4.8/5 en moyenne par nos clients.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">Réponse rapide</h4>
                  <p className="text-sm text-gray-500">Recevez des propositions en moins de 30 minutes en moyenne.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Booking Form */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="sticky top-32 glass-card p-8 rounded-3xl">
            <h3 className="text-2xl font-display font-bold mb-6">Votre demande</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service sélectionné</label>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-600 font-medium border border-gray-100">
                  {selectedSub || 'Veuillez choisir un service à gauche'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu de la prestation</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Adresse ou code postal" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date souhaitée</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="datetime-local" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Durée (heures)</label>
                  <select 
                    className="w-full px-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                      <option key={h} value={h}>{h} h</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Personnes</label>
                  <select 
                    className="w-full px-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(e.target.value)}
                  >
                    {[1, 2, 3, 4].map(p => (
                      <option key={p} value={p}>{p} pers.</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel nécessaire</label>
                <select 
                  className="w-full px-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                >
                  <option value="none">Je fournis tout le matériel</option>
                  <option value="provider">Le jobbeur doit apporter son matériel</option>
                  <option value="partial">A discuter avec le jobbeur</option>
                </select>
              </div>

              {bookingStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-green-50 text-green-700 rounded-2xl text-center font-semibold"
                >
                  Demande envoyée avec succès ! <br />
                  <Link to="/dashboard" className="text-sm underline mt-2 block">Voir mes demandes</Link>
                </motion.div>
              ) : (
                <button 
                  onClick={handleBooking}
                  disabled={bookingStatus === 'loading'}
                  className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {bookingStatus === 'loading' ? 'Envoi...' : 'Poster ma demande'}
                </button>
              )}

              <p className="text-xs text-center text-gray-400 mt-4">
                Gratuit et sans engagement. Vous ne payez que si vous acceptez une offre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
