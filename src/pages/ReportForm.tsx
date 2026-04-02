import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  ShieldAlert,
  MessageSquare,
  Send
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReportForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('targetId');
  const type = searchParams.get('type') || 'user'; // 'user' or 'mission'
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const REASONS = [
    'Comportement inapproprié',
    'Arnaque ou fraude',
    'Contenu offensant',
    'Fausse identité',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        targetId,
        targetType: type,
        reason,
        description,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 3000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Une erreur est survenue.");
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
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Signalement envoyé</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Merci de nous aider à maintenir la communauté Yoojo Clone sûre. Notre équipe de modération va examiner votre signalement.</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Redirection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-all"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="bg-white rounded-[48px] p-8 lg:p-12 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Signaler un {type === 'user' ? 'utilisateur' : 'problème'}</h1>
              <p className="text-gray-500">Aidez-nous à comprendre ce qui ne va pas.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Motif du signalement</label>
              <div className="grid grid-cols-1 gap-3">
                {REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`w-full p-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-between ${
                      reason === r ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {r}
                    {reason === r && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Description (optionnel)</label>
              <textarea 
                className="w-full p-6 bg-gray-50 rounded-[32px] border border-gray-100 outline-none focus:ring-2 focus:ring-red-500/20 min-h-[150px] resize-none font-medium text-gray-700"
                placeholder="Donnez-nous plus de détails sur la situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex gap-4">
              <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
              <p className="text-xs text-orange-700 font-medium leading-relaxed">
                Tout signalement abusif pourra entraîner des sanctions sur votre propre compte.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !reason}
              className="w-full btn-primary bg-red-600 hover:bg-red-700 py-5 rounded-2xl shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Envoyer le signalement
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
