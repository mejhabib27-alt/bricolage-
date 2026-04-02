import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Search, User, LogOut, Menu, X, MessageSquare, LayoutGrid, Sparkles, Plus, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants/services';

export default function Navbar() {
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/messages" className="p-2 text-gray-400 hover:text-primary transition-colors relative">
            <MessageSquare size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
          </Link>
          <button className="p-2 text-gray-400 hover:text-primary transition-colors">
            <LayoutGrid size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <span className="hidden sm:block text-2xl font-display font-bold text-primary tracking-tight">
              Yoojo<span className="text-secondary">Clone</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="relative">
            <button 
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2"
            >
              Catégories <ChevronDown size={14} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                  className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 grid grid-cols-1 gap-2 z-50"
                >
                  {CATEGORIES.slice(0, 6).map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      <div className={`w-8 h-8 ${cat.bgColor} ${cat.textColor} rounded-lg flex items-center justify-center`}>
                        <cat.icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary">{cat.name}</span>
                    </Link>
                  ))}
                  <Link 
                    to="/services" 
                    className="mt-2 text-center text-xs font-bold text-primary hover:underline"
                    onClick={() => setIsCategoriesOpen(false)}
                  >
                    Voir toutes les catégories
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/services" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Services</Link>
          <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Blog</Link>
          <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Contact</Link>
          <Link to="/request-quote" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">Demander un devis</Link>
          <Link to="/become-provider" className="text-sm font-bold text-secondary hover:text-secondary/80 transition-colors">Devenir Jobbeur</Link>
          <Link to="/mission/new" className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={18} />
            Poster une mission
          </Link>
          
          <div className="h-6 w-px bg-gray-200 mx-2" />

          {user ? (
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg">Admin</Link>
              )}
              {profile?.role === 'jobber' && (
                <Link to="/jobber" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Espace Jobber
                </Link>
              )}
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Tableau de bord</Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
              <Link to={`/profile/${user.uid}`} className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all active:scale-95"
            >
              Inscription
            </button>
          )}
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-4 md:hidden">
          {!user && (
            <button 
              onClick={handleLogin}
              className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all active:scale-95 text-sm"
            >
              Inscription
            </button>
          )}
          <button 
            className="p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-6 md:hidden shadow-xl"
          >
            <div className="flex flex-col gap-4">
              <Link to="/services" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-900">Services</Link>
              <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-900">Blog</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-900">Contact</Link>
              <Link to="/request-quote" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-primary">Demander un devis</Link>
              <Link to="/become-provider" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">Devenir Jobbeur</Link>
              <Link to="/mission/new" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-orange-500">Poster une mission</Link>
              <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-primary flex items-center gap-2">
                <MessageSquare size={20} />
                Messages
              </Link>
              {user ? (
                <>
                  {profile?.role === 'jobber' && (
                    <Link to="/jobber" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-primary">Espace Jobber</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-900">Tableau de bord</Link>
                  <button onClick={handleLogout} className="text-lg font-medium text-red-500 text-left">Déconnexion</button>
                </>
              ) : (
                <button onClick={handleLogin} className="btn-primary w-full">Connexion / Inscription</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
