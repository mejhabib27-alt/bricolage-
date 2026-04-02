import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, Timestamp, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Booking } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, MapPin, Calendar, ChevronRight, Sparkles, Briefcase, User, Search, Star, MessageSquare, CreditCard, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [clientBookings, setClientBookings] = useState<Booking[]>([]);
  const [availableMissions, setAvailableMissions] = useState<Booking[]>([]);
  const [myMissions, setMyMissions] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'client' | 'jobber'>('client');
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);

  const isJobber = profile?.role === 'jobber' || profile?.role === 'admin';

  const handleMessage = async (otherUserId: string) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      let existingConvoId = '';

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(otherUserId)) {
          existingConvoId = doc.id;
        }
      });

      if (existingConvoId) {
        navigate('/messages');
      } else {
        await addDoc(collection(db, 'conversations'), {
          participants: [user.uid, otherUserId],
          updatedAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          lastMessage: ''
        });
        navigate('/messages');
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Client Bookings
    const qClient = query(
      collection(db, 'bookings'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeClient = onSnapshot(qClient, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setClientBookings(data);
      if (activeTab === 'client') setLoading(false);
    });

    // Available Missions (for jobbers)
    let unsubscribeMissions = () => {};
    let unsubscribeMyMissions = () => {};

    if (isJobber) {
      const qMissions = query(
        collection(db, 'bookings'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      unsubscribeMissions = onSnapshot(qMissions, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        // Filter out own bookings
        setAvailableMissions(data.filter(b => b.clientId !== user.uid));
      });

      const qMyMissions = query(
        collection(db, 'bookings'),
        where('jobberId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribeMyMissions = onSnapshot(qMyMissions, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setMyMissions(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      unsubscribeClient();
      unsubscribeMissions();
      unsubscribeMyMissions();
    };
  }, [user, isJobber]);

  const handleAcceptMission = async (bookingId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        jobberId: user.uid,
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error accepting mission:", error);
      alert("Erreur lors de l'acceptation de la mission.");
    }
  };

  const handleCompleteMission = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed',
        completedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error completing mission:", error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Erreur lors de l'annulation.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'accepted': return <CheckCircle size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-3">Bonjour, {user?.displayName} 👋</h1>
          <p className="text-gray-500 text-lg max-w-xl">
            {activeTab === 'client' 
              ? "Gérez vos demandes de services et suivez leur avancement en temps réel."
              : "Trouvez de nouvelles missions et gérez vos interventions en cours."}
          </p>
        </div>

        {isJobber && (
          <div className="flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'client' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={18} />
              Client
            </button>
            <button
              onClick={() => setActiveTab('jobber')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'jobber' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Briefcase size={18} />
              Jobbeur
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'client' ? (
              <motion.div
                key="client-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Mes demandes de services</h2>
                  <span className="px-4 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                    {clientBookings.length} au total
                  </span>
                </div>

                {clientBookings.length === 0 ? (
                  <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/30">
                    <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                      <Calendar size={48} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Aucune demande pour le moment</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg">
                      Vous n'avez pas encore posté de demande de service. Commencez dès maintenant !
                    </p>
                    <a href="/" className="btn-primary inline-flex px-10 py-4">Trouver un service</a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientBookings.map((booking, idx) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        index={idx} 
                        onCancel={() => handleCancelBooking(booking.id)}
                        onMessage={() => handleMessage(booking.jobberId)}
                        onReview={() => setReviewingBooking(booking)}
                        onPay={() => navigate(`/payment/${booking.id}`)}
                        onDetails={() => navigate(`/mission/${booking.id}`)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="jobber-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* My Missions */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold">Mes missions en cours</h2>
                    <span className="px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-bold">
                      {myMissions.length} actives
                    </span>
                  </div>
                  
                  {myMissions.length === 0 ? (
                    <div className="bg-gray-50 rounded-[40px] p-12 text-center border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">Vous n'avez pas encore de missions acceptées.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myMissions.map((booking, idx) => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking} 
                          index={idx} 
                          isMission 
                          onComplete={() => handleCompleteMission(booking.id)}
                          onMessage={() => handleMessage(booking.clientId)}
                          onDetails={() => navigate(`/mission/${booking.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Available Missions */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold">Missions disponibles à proximité</h2>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <Search size={16} />
                      Actualisé en temps réel
                    </div>
                  </div>

                  {availableMissions.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/30">
                      <div className="w-24 h-24 bg-blue-50 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-8">
                        <Search size={48} />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Pas de nouvelles missions</h3>
                      <p className="text-gray-500 max-w-sm mx-auto text-lg">
                        Revenez plus tard pour découvrir de nouvelles opportunités dans votre secteur.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableMissions.map((booking, idx) => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking} 
                          index={idx} 
                          isAvailable 
                          onAccept={() => handleAcceptMission(booking.id)}
                          onDetails={() => navigate(`/mission/${booking.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {profile?.role === 'client' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary rounded-[40px] p-10 text-white shadow-2xl shadow-primary/30 overflow-hidden relative"
            >
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
                <Sparkles size={200} />
              </div>
              <h3 className="text-3xl font-display font-bold mb-4 leading-tight">Devenez Jobbeur</h3>
              <p className="text-blue-100 mb-10 text-lg leading-relaxed opacity-90">
                Vous avez du talent et du temps libre ? Complétez vos revenus en aidant vos voisins.
              </p>
              <button 
                onClick={() => window.location.href = `/profile/${user?.uid}`}
                className="w-full bg-white text-primary font-bold py-5 rounded-3xl hover:bg-blue-50 transition-all shadow-lg"
              >
                S'inscrire comme jobbeur
              </button>
            </motion.div>
          )}

          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-gray-200/30">
            <h3 className="text-2xl font-display font-bold mb-8">Centre d'aide</h3>
            <div className="space-y-4">
              <HelpItem title="Comment ça marche ?" />
              <HelpItem title="Assurance AXA & Protection" />
              <HelpItem title="Paiements & Facturation" />
              <HelpItem title="Contacter le support" />
            </div>
          </div>

          {isJobber && (
            <div className="p-8 bg-secondary/5 rounded-[40px] border border-secondary/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                  <Star size={24} className="fill-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Statut Jobbeur</h4>
                  <p className="text-sm text-gray-500">Niveau Débutant</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-1/3 rounded-full" />
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Prochaine étape : 3 missions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {reviewingBooking && (
          <ReviewModal 
            booking={reviewingBooking} 
            onClose={() => setReviewingBooking(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        fromId: user.uid,
        fromName: user.displayName,
        toId: booking.jobberId,
        bookingId: booking.id,
        rating,
        comment,
        createdAt: Timestamp.now()
      });

      await updateDoc(doc(db, 'bookings', booking.id), {
        hasReview: true
      });

      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-display font-bold mb-2">Laisser un avis</h2>
        <p className="text-gray-500 mb-8">Partagez votre expérience avec {(booking as any).providerName || 'le jobbeur'}.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Commentaire</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qu'avez-vous pensé de la prestation ?"
              className="w-full px-6 py-4 rounded-3xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-primary text-white rounded-3xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Publier l'avis"}
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface BookingCardProps {
  booking: Booking;
  index: number;
  isMission?: boolean;
  isAvailable?: boolean;
  onAccept?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onMessage?: () => void;
  onReview?: () => void;
  onPay?: () => void;
  onDetails?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  index, 
  isMission = false, 
  isAvailable = false,
  onAccept,
  onComplete,
  onCancel,
  onMessage,
  onReview,
  onPay,
  onDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'accepted': return <CheckCircle size={14} />;
      case 'paid': return <CreditCard size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${isMission ? 'bg-secondary/10 text-secondary' : 'bg-blue-50 text-primary'}`}>
            {isMission ? <Briefcase size={36} /> : <Clock size={36} />}
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{(booking as any).subcategory || (booking as any).serviceName || 'Service'}</h3>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-gray-400 font-semibold">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-300" />
                {booking.date?.toDate ? format(booking.date.toDate(), 'PPP', { locale: fr }) : 'Date non définie'}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-300" />
                {booking.location || 'Lieu non défini'}
              </span>
              {(booking as any).totalPrice && (
                <span className="text-gray-900 font-bold">{(booking as any).totalPrice}€</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onDetails}
            className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-primary transition-all"
            title="Détails de la mission"
          >
            <Search size={24} />
          </button>

          {onMessage && (
            <button 
              onClick={onMessage}
              className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-primary transition-all"
              title="Envoyer un message"
            >
              <MessageSquare size={24} />
            </button>
          )}

          {isAvailable && (
            <button 
              onClick={onAccept}
              className="btn-primary px-8 py-4 shadow-lg shadow-primary/20"
            >
              Accepter
            </button>
          )}

          {onPay && booking.status === 'accepted' && (
            <button 
              onClick={onPay}
              className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <CreditCard size={20} />
              Payer
            </button>
          )}

          {isMission && booking.status === 'paid' && (
            <button 
              onClick={onComplete}
              className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
            >
              Terminer
            </button>
          )}

          {onReview && booking.status === 'completed' && !(booking as any).hasReview && (
            <button 
              onClick={onReview}
              className="bg-yellow-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2"
            >
              <Star size={20} />
              Avis
            </button>
          )}

          {onCancel && (booking.status === 'pending' || booking.status === 'accepted') && (
            <button 
              onClick={onCancel}
              className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
              title="Annuler"
            >
              <XCircle size={24} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HelpItem({ title }: { title: string }) {
  return (
    <button className="w-full p-5 text-left rounded-[24px] bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-between group">
      <span className="font-bold text-gray-700">{title}</span>
      <ChevronRight size={20} className="text-gray-300 group-hover:text-primary transition-all" />
    </button>
  );
}
