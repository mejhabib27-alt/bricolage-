import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Booking, Review } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Star, Edit3, Save, X, Calendar, Clock, CheckCircle, Image as ImageIcon, MessageSquare, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

const MOCK_GALLERY = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400",
];

export default function Profile() {
  const { uid } = useParams<{ uid: string }>();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [bookingDate, setBookingDate] = useState('');
  const [duration, setDuration] = useState('2');
  const [equipment, setEquipment] = useState('none');
  const [peopleCount, setPeopleCount] = useState('1');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'gallery' | 'reviews'>('about');

  const isOwnProfile = user?.uid === uid;
  const isAdminUser = currentUserProfile?.role === 'admin';
  const canEdit = isOwnProfile || isAdminUser;
  const isJobber = profile?.role === 'jobber';

  const handleBooking = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour réserver.");
      return;
    }
    if (!bookingDate) {
      alert("Veuillez choisir une date.");
      return;
    }

    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'bookings'), {
        clientId: user.uid,
        providerId: uid,
        date: new Date(bookingDate),
        duration: parseInt(duration),
        equipment,
        peopleCount: parseInt(peopleCount),
        status: 'pending',
        createdAt: serverTimestamp(),
        providerName: profile?.name,
        clientName: user.displayName || 'Client'
      });
      setBookingStatus('success');
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus('idle');
    }
  };

  useEffect(() => {
    if (!uid) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile(data);
        setEditData(data);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });

    const reviewsQuery = query(collection(db, 'reviews'), where('toId', '==', uid));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeReviews();
    };
  }, [uid]);

  const handleSave = async () => {
    if (!uid || !user) return;
    try {
      await updateDoc(doc(db, 'users', uid), editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Erreur lors de la mise à jour du profil. Vérifiez vos permissions.");
    }
  };

  if (loading) {
    return <div className="p-24 text-center">Chargement du profil...</div>;
  }

  if (!profile) {
    return <div className="p-24 text-center">Profil non trouvé.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Profile Info */}
        <div className="flex-grow">
          <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden mb-12">
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-primary to-blue-400 opacity-10" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
              <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl flex-shrink-0">
                <img 
                  src={profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.name}&size=200`} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-grow pt-4">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    {isEditing ? (
                      <input 
                        className="text-3xl lg:text-4xl font-display font-bold mb-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 w-full"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      <h1 className="text-3xl lg:text-4xl font-display font-bold mb-2">{profile.name}</h1>
                    )}
                    <div className="flex items-center gap-4 text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {isEditing ? (
                          <input 
                            className="bg-gray-50 rounded-lg px-2 py-1 border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20"
                            value={editData.location || ''}
                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                            placeholder="Ville"
                          />
                        ) : (
                          profile.location || 'Lieu non défini'
                        )}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star size={16} className="text-accent fill-accent" />
                        {profile.rating || 'Nouveau'} ({profile.reviewsCount || 0} avis)
                      </span>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      {!isOwnProfile && (
                        <Link 
                          to={`/report?targetId=${uid}&type=user`}
                          className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100 hover:text-red-600 transition-all"
                          title="Signaler cet utilisateur"
                        >
                          <ShieldAlert size={24} />
                        </Link>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-primary transition-all"
                        >
                          {isEditing ? <X size={24} /> : <Edit3 size={24} />}
                        </button>
                      )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'about', label: 'À propos', icon: <User size={18} /> },
                    { id: 'services', label: 'Services', icon: <CheckCircle size={18} /> },
                    { id: 'gallery', label: 'Galerie', icon: <ImageIcon size={18} /> },
                    { id: 'reviews', label: 'Avis', icon: <MessageSquare size={18} /> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-4 font-bold text-sm transition-all relative whitespace-nowrap ${
                        activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'about' && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Contact & Rôle</h3>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 text-gray-700 font-medium">
                                <Mail size={18} className="text-gray-400" />
                                {profile.email}
                              </div>
                              {user && (
                                <div className="flex items-center gap-3 text-gray-700 font-medium">
                                  <Phone size={18} className="text-gray-400" />
                                  {isEditing ? (
                                    <input 
                                      className="bg-white rounded-xl px-3 py-2 border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-semibold text-primary w-full"
                                      value={editData.phone || ''}
                                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                      placeholder="Numéro de téléphone"
                                    />
                                  ) : (
                                    profile.phone || 'Non renseigné'
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-3 text-gray-700 font-medium">
                                <User size={18} className="text-gray-400" />
                                Rôle: 
                                {isEditing ? (
                                  <select 
                                    className="bg-white rounded-xl px-3 py-2 border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-semibold text-primary"
                                    value={editData.role}
                                    onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                                  >
                                    <option value="client">Client</option>
                                    <option value="jobber">Jobbeur</option>
                                    {isAdminUser && <option value="admin">Administrateur</option>}
                                  </select>
                                ) : (
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    profile.role === 'admin' ? 'bg-red-100 text-red-600' : 
                                    profile.role === 'jobber' ? 'bg-green-100 text-green-600' : 
                                    'bg-blue-100 text-blue-600'
                                  }`}>
                                    {profile.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Statistiques</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="block text-2xl font-bold text-primary">{profile.completedJobs || 0}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Missions</span>
                              </div>
                              <div>
                                <span className="block text-2xl font-bold text-secondary">{profile.rating ? `${(profile.rating * 20).toFixed(0)}%` : '100%'}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase">Satisfaction</span>
                              </div>
                              {profile.experience && (
                                <div className="col-span-2 mt-2">
                                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Expérience</span>
                                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
                                    {profile.experience === 'beginner' ? 'Débutant' : profile.experience === 'intermediate' ? 'Intermédiaire' : 'Expert'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xl font-bold mb-4">À propos</h3>
                            {isEditing ? (
                              <textarea 
                                className="w-full p-6 bg-gray-50 rounded-3xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] transition-all"
                                value={editData.bio || ''}
                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                placeholder="Parlez-nous de vous..."
                              />
                            ) : (
                              <p className="text-gray-600 leading-relaxed text-lg italic">
                                {profile.bio || "Aucune description fournie."}
                              </p>
                            )}
                          </div>

                          {isJobber && (
                            <div>
                              <h3 className="text-xl font-bold mb-4">Tarification</h3>
                              {isEditing ? (
                                <div className="flex items-center gap-4">
                                  <input 
                                    type="number"
                                    className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-semibold text-primary w-32"
                                    value={editData.hourlyRate || 0}
                                    onChange={(e) => setEditData({ ...editData, hourlyRate: parseInt(e.target.value) })}
                                  />
                                  <span className="font-bold text-gray-500">€ / heure</span>
                                </div>
                              ) : (
                                <p className="text-2xl font-bold text-primary">{profile.hourlyRate || 25}€<span className="text-sm font-normal text-gray-400">/h</span></p>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'services' && (
                      <motion.div
                        key="services"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Services proposés</h3>
                          {isEditing && (
                            <button 
                              onClick={() => {
                                const newService = prompt("Nom du service :");
                                if (newService) {
                                  const currentServices = editData.services || [];
                                  setEditData({ ...editData, services: [...currentServices, newService] });
                                }
                              }}
                              className="text-sm font-bold text-primary hover:underline"
                            >
                              + Ajouter un service
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(isEditing ? editData.services : profile.services || ['Bricolage', 'Ménage', 'Jardinage']).map((s, i) => (
                            <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                  <CheckCircle size={20} />
                                </div>
                                <span className="font-bold text-gray-700">{s}</span>
                              </div>
                              {isEditing ? (
                                <button 
                                  onClick={() => {
                                    const filtered = (editData.services || []).filter((_, idx) => idx !== i);
                                    setEditData({ ...editData, services: filtered });
                                  }}
                                  className="text-red-400 hover:text-red-600 p-2"
                                >
                                  <X size={16} />
                                </button>
                              ) : (
                                <span className="text-primary font-bold">{profile.hourlyRate || 25}€/h</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'gallery' && (
                      <motion.div
                        key="gallery"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Galerie de réalisations</h3>
                          {isEditing && (
                            <button 
                              onClick={() => {
                                const url = prompt("URL de l'image :");
                                if (url) {
                                  const currentGallery = editData.gallery || [];
                                  setEditData({ ...editData, gallery: [...currentGallery, url] });
                                }
                              }}
                              className="text-sm font-bold text-primary hover:underline"
                            >
                              + Ajouter une image
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {(isEditing ? editData.gallery : profile.gallery || MOCK_GALLERY).map((img, i) => (
                            <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-sm group relative">
                              <img src={img} alt="Work" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              {isEditing && (
                                <button 
                                  onClick={() => {
                                    const filtered = (editData.gallery || []).filter((_, idx) => idx !== i);
                                    setEditData({ ...editData, gallery: filtered });
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                      <motion.div
                        key="reviews"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                        <h3 className="text-xl font-bold mb-6">Avis clients</h3>
                        <div className="space-y-4">
                          {reviews.length > 0 ? reviews.map(review => (
                            <div key={review.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm">
                                    {review.fromId[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">Client</p>
                                    <p className="text-xs text-gray-400">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Récemment'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} size={14} className="text-accent fill-accent" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600 italic">"{review.comment}"</p>
                            </div>
                          )) : (
                            <div className="text-center py-12 text-gray-400">
                              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                              <p>Aucun avis pour le moment.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleSave}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-12 shadow-xl shadow-primary/20"
                  >
                    <Save size={20} />
                    Enregistrer les modifications
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Sidebar (Only for Jobbers) */}
        {isJobber && !isOwnProfile && (
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="sticky top-32 glass-card p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50">
              <h3 className="text-2xl font-display font-bold mb-6">Réserver {profile.name}</h3>
              
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                  <p className="text-sm text-gray-500 mb-1">Tarif horaire</p>
                  <p className="text-3xl font-display font-bold text-primary">25€<span className="text-lg font-sans text-gray-400">/h</span></p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Date & Heure</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="datetime-local" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Durée (h)</label>
                    <select 
                      className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                        <option key={h} value={h}>{h} h</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Personnes</label>
                    <select 
                      className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
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
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Matériel</label>
                  <select 
                    className="w-full px-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 transition-all"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                  >
                    <option value="none">Je fournis tout</option>
                    <option value="provider">Jobbeur apporte</option>
                    <option value="partial">À discuter</option>
                  </select>
                </div>

                {bookingStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-green-50 text-green-700 rounded-3xl text-center font-bold"
                  >
                    Demande envoyée ! <br />
                    <Link to="/dashboard" className="text-sm underline mt-2 block">Suivre ma demande</Link>
                  </motion.div>
                ) : (
                  <button 
                    onClick={handleBooking}
                    disabled={bookingStatus === 'loading'}
                    className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingStatus === 'loading' ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Réserver maintenant
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                )}

                <div className="pt-6 border-t border-gray-50 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <ShieldCheck size={16} className="text-green-500" />
                    Paiement sécurisé & Assurance incluse
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <Clock size={16} className="text-blue-500" />
                    Réponse sous 30 minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
