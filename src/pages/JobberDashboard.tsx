import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  User, 
  Bell, 
  TrendingUp, 
  Star, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRight, 
  Plus, 
  ChevronRight,
  Filter,
  Search,
  MoreVertical,
  AlertCircle,
  MapPin,
  Calendar,
  Users as UsersIcon,
  Wrench,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Phone
} from 'lucide-react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Booking, UserProfile } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';

const EARNINGS_DATA = [
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1800 },
  { month: 'Dec', amount: 2400 },
  { month: 'Jan', amount: 1600 },
  { month: 'Feb', amount: 2100 },
  { month: 'Mar', amount: 2850 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, type: 'credit', amount: 45, label: 'Mission: Montage Meuble', date: 'Aujourd\'hui, 14:20' },
  { id: 2, type: 'credit', amount: 120, label: 'Mission: Peinture Salon', date: 'Hier, 18:45' },
  { id: 3, type: 'debit', amount: 500, label: 'Virement vers compte bancaire', date: '28 Mars, 10:15' },
  { id: 4, type: 'credit', amount: 65, label: 'Mission: Tonte Pelouse', date: '27 Mars, 16:30' },
];

export default function JobberDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'earnings' | 'profile' | 'notifications' | 'messages' | 'reviews' | 'services'>('dashboard');
  const [missions, setMissions] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate || 25);
  const [radius, setRadius] = useState(profile?.interventionRadius || 20);
  const [maxHours, setMaxHours] = useState(profile?.maxHoursPerWeek || 35);
  const [location, setLocation] = useState(profile?.location || '');
  const [userServices, setUserServices] = useState<string[]>(profile?.services || []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        bio,
        hourlyRate,
        interventionRadius: radius,
        maxHoursPerWeek: maxHours,
        location,
        services: userServices,
        updatedAt: Timestamp.now()
      });
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };
  const [missionFilter, setMissionFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(profile?.isAvailable ?? true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('jobberId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setMissions(data);
      setLoading(false);
    });

    const reviewsQ = query(
      collection(db, 'reviews'),
      where('toId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeReviews = onSnapshot(reviewsQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    });

    return () => {
      unsubscribe();
      unsubscribeReviews();
    };
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!user) return;
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isAvailable: nextState
      });
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  const filteredMissions = useMemo(() => {
    if (missionFilter === 'all') return missions;
    return missions.filter(m => m.status === missionFilter);
  }, [missions, missionFilter]);

  const stats = [
    { label: 'Solde', value: `${profile?.balance || '1,245'}€`, icon: <Wallet className="text-blue-500" />, trend: '+12%', trendUp: true },
    { label: 'Missions', value: missions.length, icon: <Briefcase className="text-orange-500" />, trend: '+3', trendUp: true },
    { label: 'Note', value: profile?.rating || '4.9', icon: <Star className="text-amber-500" />, trend: 'Stable', trendUp: true },
    { label: 'Taux de réponse', value: `${profile?.responseRate || '98'}%`, icon: <Clock className="text-green-500" />, trend: '+2%', trendUp: true },
  ];

  if (profile?.role !== 'jobber' && profile?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-orange-500 mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Accès réservé aux jobbeurs</h2>
        <p className="text-gray-500 mb-8">Vous devez être inscrit en tant que jobbeur pour accéder à cet espace.</p>
        <Link to="/become-provider" className="btn-primary">Devenir jobbeur</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar / Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Navigation Rail */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 p-4 mb-6">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                  <img src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Me" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 truncate w-32">{profile?.name}</p>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Jobbeur Expert</p>
                </div>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
                  { id: 'missions', label: 'Mes Missions', icon: <Briefcase size={20} />, badge: missions.filter(m => m.status === 'pending').length },
                  { id: 'earnings', label: 'Gains & Solde', icon: <Wallet size={20} /> },
                  { id: 'services', label: 'Mes Services', icon: <Wrench size={20} /> },
                  { id: 'reviews', label: 'Avis Clients', icon: <Star size={20} />, badge: reviews.length },
                  { id: 'profile', label: 'Profil Pro', icon: <User size={20} /> },
                  { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, badge: 3 },
                  { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, badge: 2 },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 font-bold text-sm">
                      {item.icon}
                      {item.label}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === item.id ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between px-4 mb-6">
                  <span className="text-sm font-bold text-gray-900">Disponibilité</span>
                  <button 
                    onClick={handleToggleAvailability}
                    className={`w-12 h-6 rounded-full transition-all relative ${isAvailable ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <button 
                  onClick={() => navigate('/mission/propose')}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus size={18} />
                  Proposer une mission
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-display font-bold text-gray-900">Centre de Pilotage 👋</h1>
                      <p className="text-gray-500">Gérez votre activité et optimisez vos revenus.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
                        {format(new Date(), 'EEEE d MMMM', { locale: fr })}
                      </div>
                      <button 
                        onClick={handleToggleAvailability}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                          isAvailable ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        {isAvailable ? 'En ligne' : 'Hors ligne'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions Pilotage */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Proposer une mission', icon: <Plus size={20} />, color: 'bg-orange-500', action: () => navigate('/mission/propose') },
                      { label: 'Mes Services', icon: <Wrench size={20} />, color: 'bg-blue-500', action: () => setActiveTab('services') },
                      { label: 'Voir mes Avis', icon: <Star size={20} />, color: 'bg-amber-500', action: () => setActiveTab('reviews') },
                      { label: 'Gains & Solde', icon: <Wallet size={20} />, color: 'bg-green-500', action: () => setActiveTab('earnings') },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className={`w-12 h-12 ${item.color} text-white rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-2xl">
                            {stat.icon}
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {stat.trend}
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-display font-bold text-gray-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Earnings Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Évolution des gains</h3>
                          <p className="text-sm text-gray-400">Sur les 6 derniers mois</p>
                        </div>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-500 outline-none">
                          <option>2026</option>
                          <option>2025</option>
                        </select>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={EARNINGS_DATA}>
                            <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="month" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                              dy={10}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                              tickFormatter={(value) => `${value}€`}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#3b82f6" 
                              strokeWidth={4}
                              fillOpacity={1} 
                              fill="url(#colorAmount)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Upcoming Missions */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900">Prochaines missions</h3>
                        <Link to="/jobber?tab=missions" className="text-primary text-sm font-bold hover:underline">Voir tout</Link>
                      </div>
                      <div className="space-y-6">
                        {missions.filter(m => m.status === 'accepted').slice(0, 3).map((mission, idx) => (
                          <div key={idx} className="flex gap-4 group cursor-pointer">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <Calendar size={20} />
                            </div>
                            <div className="flex-grow">
                              <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{mission.taskType || 'Mission'}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <Clock size={12} />
                                {mission.date?.toDate ? format(mission.date.toDate(), 'HH:mm') : '14:00'}
                                <span className="mx-1">•</span>
                                <MapPin size={12} />
                                {mission.location}
                              </div>
                            </div>
                          </div>
                        ))}
                        {missions.filter(m => m.status === 'accepted').length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-400 text-sm italic">Aucune mission prévue</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance & Insights Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900">Performance de conversion</h3>
                        <TrendingUp className="text-primary" size={20} />
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: 'Demandes reçues', value: missions.length, color: 'bg-blue-500' },
                          { label: 'Missions acceptées', value: missions.filter(m => m.status !== 'pending').length, color: 'bg-green-500' },
                          { label: 'Missions terminées', value: missions.filter(m => m.status === 'completed').length, color: 'bg-purple-500' },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="text-gray-900">{item.value}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / (missions.length || 1)) * 100}%` }}
                                className={`h-full ${item.color}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-8">Répartition des revenus</h3>
                      <div className="flex items-center justify-center h-[200px]">
                        <div className="text-center">
                          <p className="text-4xl font-display font-bold text-gray-900">
                            {missions.reduce((acc, m) => acc + (m.budget || m.totalAmount || 0), 0)}€
                          </p>
                          <p className="text-sm text-gray-400 font-medium">Total généré</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Panier moyen</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round(missions.reduce((acc, m) => acc + (m.budget || m.totalAmount || 0), 0) / (missions.length || 1))}€
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Taux de complétion</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round((missions.filter(m => m.status === 'completed').length / (missions.length || 1)) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-8">Activité récente</h3>
                    <div className="space-y-6">
                      {missions.slice(0, 5).map((mission, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              mission.status === 'completed' ? 'bg-green-100 text-green-600' :
                              mission.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              {mission.status === 'completed' ? <CheckCircle2 size={18} /> :
                               mission.status === 'accepted' ? <Briefcase size={18} /> :
                               <Clock size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {mission.status === 'completed' ? 'Mission terminée' :
                                 mission.status === 'accepted' ? 'Mission acceptée' :
                                 'Nouvelle demande'}
                              </p>
                              <p className="text-xs text-gray-400 font-medium">{mission.taskType || 'Service'} • {mission.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{mission.budget || mission.totalAmount || 0}€</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              {mission.createdAt?.toDate ? format(mission.createdAt.toDate(), 'd MMM', { locale: fr }) : 'Aujourd\'hui'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'missions' && (
                <motion.div
                  key="missions"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Mes Missions</h1>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                      {[
                        { id: 'all', label: 'Toutes' },
                        { id: 'pending', label: 'En attente' },
                        { id: 'accepted', label: 'À venir' },
                        { id: 'completed', label: 'Terminées' },
                      ].map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setMissionFilter(filter.id as any)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            missionFilter === filter.id 
                              ? 'bg-primary text-white shadow-md' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {filteredMissions.map((mission) => (
                      <div key={mission.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                mission.status === 'completed' ? 'bg-green-100 text-green-600' :
                                mission.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                                'bg-orange-100 text-orange-600'
                              }`}>
                                {mission.status === 'completed' ? 'Terminée' :
                                 mission.status === 'accepted' ? 'À venir' :
                                 'En attente'}
                              </span>
                              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                ID: #{mission.id.slice(0, 8)}
                              </span>
                            </div>
                            <h3 className="text-2xl font-display font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                              {mission.taskType || 'Mission de service'}
                            </h3>
                            <p className="text-gray-500 mb-8 line-clamp-2">{mission.description || "Aucune description détaillée fournie pour cette mission."}</p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                  <Calendar size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {mission.date?.toDate ? format(mission.date.toDate(), 'd MMM yyyy', { locale: fr }) : 'À définir'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                  <MapPin size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">Lieu</p>
                                  <p className="text-sm font-bold text-gray-900">{mission.location}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                  <Clock size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">Durée</p>
                                  <p className="text-sm font-bold text-gray-900">{mission.duration || '2'}h</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                  <UsersIcon size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">Personnes</p>
                                  <p className="text-sm font-bold text-gray-900">{mission.peopleCount || '1'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="w-full lg:w-64 flex-shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-50 pt-8 lg:pt-0 lg:pl-8">
                            <div className="mb-8">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Budget estimé</p>
                              <p className="text-4xl font-display font-bold text-primary">{mission.budget || mission.totalAmount || 0}€</p>
                            </div>
                            <div className="space-y-3">
                              {mission.status === 'pending' ? (
                                <button 
                                  onClick={() => navigate(`/mission/${mission.id}`)}
                                  className="w-full btn-primary py-4 rounded-2xl shadow-lg shadow-primary/20"
                                >
                                  Accepter
                                </button>
                              ) : (
                                <button 
                                  onClick={() => navigate(`/mission/${mission.id}`)}
                                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all"
                                >
                                  Détails complets
                                </button>
                              )}
                              <button 
                                onClick={() => navigate('/messages')}
                                className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                              >
                                <MessageSquare size={18} />
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredMissions.length === 0 && (
                      <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
                        <Briefcase size={64} className="mx-auto text-gray-100 mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune mission trouvée</h3>
                        <p className="text-gray-500">Modifiez vos filtres ou attendez de nouvelles opportunités.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'earnings' && (
                <motion.div
                  key="earnings"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Gains & Solde</h1>
                    <button className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20">
                      <ArrowUpRight size={18} />
                      Virement de solde
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Interactive Bar Chart */}
                      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-8">Revenus mensuels</h3>
                        <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={EARNINGS_DATA}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                tickFormatter={(value) => `${value}€`}
                              />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                                {EARNINGS_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === EARNINGS_DATA.length - 1 ? '#3b82f6' : '#e2e8f0'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-8">Transactions récentes</h3>
                        <div className="space-y-4">
                          {RECENT_TRANSACTIONS.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                  tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {tx.type === 'credit' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{tx.label}</p>
                                  <p className="text-xs text-gray-400 font-medium">{tx.date}</p>
                                </div>
                              </div>
                              <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}€
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Balance Card */}
                      <div className="bg-primary p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10">
                          <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Solde disponible</p>
                          <h2 className="text-5xl font-display font-bold mb-8">1,245.50€</h2>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                              <span className="text-sm font-medium opacity-80">En attente</span>
                              <span className="font-bold">340.00€</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                              <span className="text-sm font-medium opacity-80">Ce mois</span>
                              <span className="font-bold">+2,850.00€</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Actions rapides</h3>
                        <div className="space-y-3">
                          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                            <span className="text-sm font-bold text-gray-700">Télécharger factures</span>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-primary" />
                          </button>
                          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                            <span className="text-sm font-bold text-gray-700">Modifier RIB</span>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-primary" />
                          </button>
                          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                            <span className="text-sm font-bold text-gray-700">Support financier</span>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-primary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Mes Services & Compétences</h1>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <CheckCircle2 size={18} />
                      Enregistrer les modifications
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Services proposés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        'Bricolage', 'Ménage', 'Jardinage', 'Déménagement', 'Informatique', 
                        'Peinture', 'Plomberie', 'Électricité', 'Montage de meubles', 'Babysitting'
                      ].map(service => (
                        <button
                          key={service}
                          onClick={() => {
                            if (userServices.includes(service)) {
                              setUserServices(userServices.filter(s => s !== service));
                            } else {
                              setUserServices([...userServices, service]);
                            }
                          }}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            userServices.includes(service)
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <span className="font-bold">{service}</span>
                          {userServices.includes(service) && <CheckCircle2 size={18} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Tarification & Zone</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tarif horaire (€/h)</label>
                          <input 
                            type="number" 
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Rayon d'intervention (km)</label>
                          <input 
                            type="number" 
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Disponibilité hebdomadaire</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Heures max / semaine</label>
                          <input 
                            type="number" 
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={maxHours}
                            onChange={(e) => setMaxHours(Number(e.target.value))}
                          />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-sm text-blue-700 font-medium">
                            Ces paramètres aident notre algorithme à vous proposer les missions les plus pertinentes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Avis Clients</h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <Star className="text-amber-500 fill-amber-500" size={18} />
                      <span className="font-bold text-gray-900">{profile?.rating || '4.9'}</span>
                      <span className="text-gray-400">({reviews.length} avis)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm">
                              <img src={review.fromPhoto || `https://ui-avatars.com/api/?name=${review.fromName}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{review.fromName}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">
                            {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'd MMMM yyyy', { locale: fr }) : 'Récemment'}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                        {review.missionType && (
                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mission:</span>
                            <span className="text-xs font-bold text-primary">{review.missionType}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
                        <Star size={64} className="mx-auto text-gray-100 mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun avis pour le moment</h3>
                        <p className="text-gray-500">Les avis de vos clients apparaîtront ici après vos premières missions.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-3xl space-y-8"
                >
                  <h1 className="text-3xl font-display font-bold text-gray-900">Profil Professionnel</h1>
                  
                  <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-100 shadow-sm space-y-10">
                    {/* Photo & Basic Info */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[32px] overflow-hidden shadow-xl">
                          <img src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Me" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="text-center md:text-left flex-grow">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile?.name}</h3>
                        <p className="text-gray-500 mb-4">{profile?.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Identité vérifiée</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Jobbeur Expert</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ma Bio</label>
                      <textarea 
                        className="w-full p-6 bg-gray-50 rounded-3xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none font-medium text-gray-700"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Décrivez votre expérience et vos compétences..."
                      />
                    </div>

                    {/* Pro Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Téléphone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="tel" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tarif horaire (€/h)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="number" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Rayon d'intervention (km)</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="number" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Heures max / semaine</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="number" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={maxHours}
                            onChange={(e) => setMaxHours(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Localisation</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Paris, France"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full btn-primary py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={20} />
                      )}
                      {isSaving ? "Enregistrement..." : "Enregistrer mon profil pro"}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="h-[700px] bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="flex h-full">
                    {/* Simplified Messages View */}
                    <div className="w-full flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-6">
                        <MessageSquare size={48} />
                      </div>
                      <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Vos messages</h2>
                      <p className="text-gray-500 max-w-md mb-8">
                        Gérez vos conversations avec vos clients directement depuis votre espace pro.
                      </p>
                      <button 
                        onClick={() => navigate('/messages')}
                        className="btn-primary px-10 py-4 flex items-center gap-2"
                      >
                        Ouvrir la messagerie complète
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-2xl space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Notifications</h1>
                    <button className="text-sm font-bold text-primary hover:underline">Tout marquer comme lu</button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 1, type: 'mission', title: 'Nouvelle demande !', body: 'Un client vous a sollicité pour une mission de Bricolage.', time: 'Il y a 5 min', unread: true },
                      { id: 2, type: 'payment', title: 'Paiement reçu', body: 'Le paiement de 120€ pour la mission "Peinture" a été crédité.', time: 'Il y a 2h', unread: true },
                      { id: 3, type: 'review', title: 'Nouvel avis 5★', body: 'Thomas a laissé un commentaire positif sur votre profil.', time: 'Hier', unread: false },
                      { id: 4, type: 'system', title: 'Profil vérifié', body: 'Félicitations ! Votre profil est désormais certifié Yoojo Expert.', time: '2 jours', unread: false },
                    ].map((notif) => (
                      <div key={notif.id} className={`p-6 rounded-[32px] border transition-all flex gap-4 ${
                        notif.unread ? 'bg-white border-primary/20 shadow-md' : 'bg-gray-50 border-gray-100'
                      }`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'mission' ? 'bg-orange-100 text-orange-600' :
                          notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                          notif.type === 'review' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notif.type === 'mission' ? <Briefcase size={24} /> :
                           notif.type === 'payment' ? <DollarSign size={24} /> :
                           notif.type === 'review' ? <Star size={24} /> :
                           <AlertCircle size={24} />}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">{notif.title}</h4>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{notif.time}</span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{notif.body}</p>
                        </div>
                        {notif.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
