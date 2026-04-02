import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Wrench, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  User,
  ShieldCheck,
  Info,
  Star,
  Send
} from 'lucide-react';
import { doc, onSnapshot, updateDoc, Timestamp, addDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Booking, UserProfile } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MissionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [jobberProfile, setJobberProfile] = useState<UserProfile | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [instructionNote, setInstructionNote] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);

  const handleCompleteMission = async () => {
    if (!id || !user) return;
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status: 'completed',
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error completing mission:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !user || !mission) return;
    setIsSubmittingReview(true);
    try {
      const toId = user.uid === mission.clientId ? mission.jobberId : mission.clientId;
      await addDoc(collection(db, 'reviews'), {
        bookingId: id,
        fromId: user.uid,
        toId,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: serverTimestamp()
      });
      
      alert("Merci pour votre avis !");
      setReviewComment('');
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'bookings', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as Booking;
        setMission(data);
        
        // Fetch client profile
        onSnapshot(doc(db, 'users', data.clientId), (clientSnap) => {
          if (clientSnap.exists()) {
            setClientProfile(clientSnap.data() as UserProfile);
          }
        });

        // Fetch jobber profile if exists
        if (data.jobberId) {
          onSnapshot(doc(db, 'users', data.jobberId), (jobberSnap) => {
            if (jobberSnap.exists()) {
              setJobberProfile(jobberSnap.data() as UserProfile);
            }
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleAcceptMission = async () => {
    if (!user || !id) return;
    try {
      await updateDoc(doc(db, 'bookings', id), {
        jobberId: user.uid,
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error accepting mission:", error);
    }
  };

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
        if (data.participants.includes(otherUserId) && data.missionId === id) {
          existingConvoId = doc.id;
        }
      });

      if (existingConvoId) {
        navigate(`/messages?convoId=${existingConvoId}`);
      } else {
        const otherProfile = otherUserId === mission?.clientId ? clientProfile : jobberProfile;
        const newConvo = await addDoc(collection(db, 'conversations'), {
          participants: [user.uid, otherUserId],
          missionId: id,
          participantDetails: {
            [user.uid]: {
              name: profile?.name || user.displayName || 'Utilisateur',
              photoUrl: profile?.photoUrl || user.photoURL || ''
            },
            [otherUserId]: {
              name: otherProfile?.name || 'Utilisateur',
              photoUrl: otherProfile?.photoUrl || ''
            }
          },
          lastMessage: 'Conversation démarrée',
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        navigate(`/messages?convoId=${newConvo.id}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleSendInstruction = async () => {
    if (!user || !id || !instructionNote.trim() || !mission) return;
    setIsSendingNote(true);
    try {
      const otherUserId = user.uid === mission.clientId ? mission.jobberId : mission.clientId;
      if (!otherUserId) {
        alert("Aucun prestataire n'a encore accepté cette mission.");
        return;
      }

      // Find or create conversation
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      let convoId = '';

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(otherUserId) && data.missionId === id) {
          convoId = doc.id;
        }
      });

      if (!convoId) {
        const otherProfile = otherUserId === mission.clientId ? clientProfile : jobberProfile;
        const newConvo = await addDoc(collection(db, 'conversations'), {
          participants: [user.uid, otherUserId],
          missionId: id,
          participantDetails: {
            [user.uid]: {
              name: profile?.name || user.displayName || 'Utilisateur',
              photoUrl: profile?.photoUrl || user.photoURL || ''
            },
            [otherUserId]: {
              name: otherProfile?.name || 'Utilisateur',
              photoUrl: otherProfile?.photoUrl || ''
            }
          },
          lastMessage: 'Note d\'instruction envoyée',
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        convoId = newConvo.id;
      }

      // Send note as a special message
      await addDoc(collection(db, 'conversations', convoId, 'messages'), {
        senderId: user.uid,
        text: instructionNote,
        type: 'note',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'conversations', convoId), {
        lastMessage: 'Note: ' + instructionNote.substring(0, 30) + '...',
        lastMessageAt: serverTimestamp()
      });

      setInstructionNote('');
      alert("Note d'instruction envoyée au chat !");
    } catch (error) {
      console.error("Error sending instruction:", error);
    } finally {
      setIsSendingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Mission introuvable</h2>
        <p className="text-gray-500 mb-8">Désolé, cette mission n'existe pas ou a été supprimée.</p>
        <Link to="/dashboard" className="btn-primary">Retour au tableau de bord</Link>
      </div>
    );
  }

  const isOwner = user?.uid === mission.clientId;
  const isJobber = user?.uid === mission.jobberId;
  const canAccept = !mission.jobberId && profile?.role === 'jobber' && !isOwner;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <Link 
            to={`/report?targetId=${id}&type=mission`}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm transition-all"
          >
            <AlertCircle size={18} />
            Signaler un problème
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[48px] p-8 lg:p-12 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  mission.status === 'completed' ? 'bg-green-100 text-green-600' :
                  mission.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {mission.status === 'completed' ? 'Terminée' :
                   mission.status === 'accepted' ? 'À venir' :
                   'En attente'}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Publiée le {mission.createdAt?.toDate ? format(mission.createdAt.toDate(), 'd MMMM yyyy', { locale: fr }) : 'Récemment'}
                </span>
              </div>

              <h1 className="text-4xl font-display font-bold text-gray-900 mb-6">
                {mission.taskType || mission.category || 'Mission de service'}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12 py-8 border-y border-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                  </div>
                  <p className="font-bold text-gray-900">
                    {mission.date?.toDate ? format(mission.date.toDate(), 'd MMM yyyy', { locale: fr }) : mission.date || 'À définir'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Heure</span>
                  </div>
                  <p className="font-bold text-gray-900">
                    {mission.time || (mission.date?.toDate ? format(mission.date.toDate(), 'HH:mm') : 'À définir')}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Durée</span>
                  </div>
                  <p className="font-bold text-gray-900">{mission.duration || '2'}h</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Personnes</span>
                  </div>
                  <p className="font-bold text-gray-900">{mission.peopleCount || '1'}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description de la mission</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {mission.description || "Aucune description détaillée fournie pour cette mission."}
                  </p>
                </div>

                {/* Instructions / Notes Section */}
                {(isOwner || isJobber) && mission.status === 'accepted' && (
                  <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-900">Instructions & Notes détaillées</h3>
                        <p className="text-xs text-amber-700">Partagez des précisions importantes avec votre {isOwner ? 'jobbeur' : 'client'}.</p>
                      </div>
                    </div>
                    
                    {isOwner ? (
                      <div className="space-y-4">
                        <textarea 
                          value={instructionNote}
                          onChange={(e) => setInstructionNote(e.target.value)}
                          placeholder="Ex: Le code de l'immeuble est 1234, merci de monter au 3ème étage..."
                          className="w-full p-4 bg-white rounded-2xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[100px] text-sm"
                        />
                        <button 
                          onClick={handleSendInstruction}
                          disabled={isSendingNote || !instructionNote.trim()}
                          className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all disabled:opacity-50"
                        >
                          {isSendingNote ? 'Envoi...' : 'Envoyer comme note'}
                          <Send size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-800 italic">
                        Le client peut vous envoyer des instructions spécifiques ici. Elles apparaîtront également dans votre chat privé.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-primary" />
                      Lieu de la prestation
                    </h3>
                    <p className="text-gray-600 font-medium">{mission.location}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Wrench size={20} className="text-primary" />
                      Matériel
                    </h3>
                    <p className="text-gray-600 font-medium">{mission.equipment || 'Non spécifié'}</p>
                    {mission.customEquipment && mission.customEquipment.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {mission.customEquipment.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Banner */}
            <div className="bg-blue-600 rounded-[40px] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-600/20">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={32} />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Mission assurée par AXA</h3>
                <p className="text-blue-100 opacity-90">Toutes les prestations réalisées sur Yoojo Clone sont couvertes par notre assurance partenaire AXA.</p>
              </div>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold text-sm whitespace-nowrap hover:bg-blue-50 transition-colors">
                En savoir plus
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Budget Card */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
              <div className="mb-8">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Budget estimé</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-display font-bold text-primary">{mission.budget || mission.totalAmount || 0}€</span>
                  <span className="text-gray-400 font-bold">TTC</span>
                </div>
              </div>

              <div className="space-y-4">
                {canAccept && (
                  <button 
                    onClick={handleAcceptMission}
                    className="w-full btn-primary py-5 rounded-2xl text-lg shadow-xl shadow-primary/20"
                  >
                    Accepter la mission
                  </button>
                )}

                {mission.status === 'accepted' && isOwner && (
                  <button 
                    onClick={handleCompleteMission}
                    className="w-full btn-primary bg-green-600 hover:bg-green-700 py-4 rounded-2xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Marquer comme terminée
                  </button>
                )}

                {mission.status === 'completed' && (
                  <div className="p-6 bg-green-50 rounded-3xl border border-green-100 text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-bold text-green-800 mb-1">Mission terminée</h4>
                    <p className="text-xs text-green-600">Cette mission a été clôturée avec succès.</p>
                  </div>
                )}
                
                {/* Contact Button */}
                {mission.status !== 'completed' && (
                  <>
                    {(isOwner || isJobber) ? (
                      <button 
                        onClick={() => handleMessage(isOwner ? mission.jobberId! : mission.clientId)}
                        className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
                      >
                        <MessageSquare size={24} />
                        Contacter {isOwner ? 'le jobbeur' : 'le client'}
                      </button>
                    ) : (
                      // Potential jobber contacting client
                      !mission.jobberId && profile?.role === 'jobber' && (
                        <button 
                          onClick={() => handleMessage(mission.clientId)}
                          className="w-full bg-white border-2 border-gray-900 text-gray-900 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                        >
                          <MessageSquare size={24} />
                          Poser une question au client
                        </button>
                      )
                    )}
                  </>
                )}

                {!isOwner && !isJobber && !canAccept && (
                  <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex gap-4">
                    <Info className="text-orange-500 flex-shrink-0" size={20} />
                    <p className="text-sm text-orange-700 font-medium">
                      Cette mission a déjà été acceptée par un autre jobbeur.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form */}
            {mission.status === 'completed' && (isOwner || isJobber) && (
              <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Laisser un avis</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`p-2 transition-all ${reviewRating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                        >
                          <Star size={32} fill={reviewRating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Commentaire</label>
                    <textarea 
                      className="w-full p-6 bg-gray-50 rounded-[32px] border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none font-medium text-gray-700"
                      placeholder="Partagez votre expérience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !reviewComment}
                    className="w-full btn-primary py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                    Publier mon avis
                  </button>
                </div>
              </div>
            )}

            {/* Client Info */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">À propos du client</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                  <img 
                    src={clientProfile?.photoUrl || `https://ui-avatars.com/api/?name=${clientProfile?.name}`} 
                    alt={clientProfile?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{clientProfile?.name}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-black text-gray-900">{clientProfile?.rating || '5.0'}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">({clientProfile?.reviewsCount || 0} avis)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Membre depuis</span>
                  <span className="text-sm font-bold text-gray-900">
                    {clientProfile?.createdAt?.toDate ? format(clientProfile.createdAt.toDate(), 'yyyy') : '2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Missions postées</span>
                  <span className="text-sm font-bold text-gray-900">12</span>
                </div>
              </div>
            </div>

            {/* Jobber Info (if accepted) */}
            {mission.jobberId && (
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Le jobbeur</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                    <img 
                      src={jobberProfile?.photoUrl || `https://ui-avatars.com/api/?name=${jobberProfile?.name}`} 
                      alt={jobberProfile?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{jobberProfile?.name}</p>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black text-gray-900">{jobberProfile?.rating || '4.9'}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">({jobberProfile?.reviewsCount || 0} avis)</span>
                    </div>
                  </div>
                </div>
                <Link 
                  to={`/profile/${mission.jobberId}`}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-gray-50 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                >
                  Voir le profil complet
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
