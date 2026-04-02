import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from './constants/services';

// Components
import Navbar from './components/Navbar';
import { Home, Dashboard, ServiceDetails, Profile, AdminDashboard, BecomeProvider, Blog, Contact, Services, JobberDashboard, NewMission, ProposeMission, CategoryPage, Messages, MissionDetails, RequestQuote, ReportForm } from './pages';

// Context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // One-time initialization of services if empty
    const initServices = async () => {
      const servicesSnap = await getDocs(collection(db, 'services'));
      if (servicesSnap.empty) {
        console.log("Initializing services from constants...");
        for (const cat of CATEGORIES) {
          for (const service of cat.services) {
            await addDoc(collection(db, 'services'), {
              category: cat.name,
              subcategory: cat.name,
              name: service.name,
              description: service.description,
              basePrice: 20 // Default base price
            });
          }
        }
      }
    };
    initServices();

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if profile exists, if not create it
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          const isAdminEmail = currentUser.email === "mejhabib27@gmail.com";
          await setDoc(docRef, {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Utilisateur',
            email: currentUser.email || '',
            role: isAdminEmail ? 'admin' : 'client',
            photoUrl: currentUser.photoURL || '',
            createdAt: new Date()
          });
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/service/:id" element={<ServiceDetails />} />
              <Route path="/become-provider" element={<BecomeProvider />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/jobber" element={profile?.role === 'jobber' ? <JobberDashboard /> : <Navigate to="/" />} />
              <Route path="/mission/new" element={user ? <NewMission /> : <Navigate to="/" />} />
              <Route path="/mission/propose" element={profile?.role === 'jobber' ? <ProposeMission /> : <Navigate to="/" />} />
              <Route path="/mission/:id" element={user ? <MissionDetails /> : <Navigate to="/" />} />
              <Route path="/request-quote" element={<RequestQuote />} />
              <Route path="/report" element={user ? <ReportForm /> : <Navigate to="/" />} />
              <Route path="/messages" element={user ? <Messages /> : <Navigate to="/" />} />
              <Route path="/profile/:uid" element={<Profile />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/category/:categoryId/:serviceId" element={<CategoryPage />} />
              <Route path="/admin" element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h2 className="text-2xl font-display font-bold text-primary mb-4">Yoojo Clone</h2>
                <p className="text-gray-500 max-w-sm mb-6">
                  La marketplace de services à la personne qui simplifie votre quotidien. 
                  Trouvez un jobbeur de confiance en quelques clics.
                </p>
                <div className="max-w-sm">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">Newsletter</h4>
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); alert('Merci pour votre inscription !'); }}>
                    <input 
                      type="email" 
                      placeholder="Votre email" 
                      className="flex-grow px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      required
                    />
                    <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-sm whitespace-nowrap">S'inscrire</button>
                  </form>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Services</h3>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/category/menage" className="hover:text-primary transition-colors">Ménage</Link></li>
                  <li><Link to="/category/bricolage" className="hover:text-primary transition-colors">Bricolage</Link></li>
                  <li><Link to="/category/jardinage" className="hover:text-primary transition-colors">Jardinage</Link></li>
                  <li><Link to="/category/demenagement" className="hover:text-primary transition-colors">Déménagement</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Plateforme</h3>
                <ul className="space-y-2 text-gray-500">
                  <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link to="/become-provider" className="hover:text-primary transition-colors">Devenir Jobbeur</Link></li>
                  <li>Aide & Support</li>
                  <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
              © 2026 Yoojo Clone. Tous droits réservés.
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
