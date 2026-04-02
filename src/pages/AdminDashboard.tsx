import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, LayoutGrid, ListTree, Tag, Euro, Star } from 'lucide-react';
import { CATEGORIES as CATEGORY_METADATA } from '../constants/services';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    category: '',
    subcategory: '',
    name: '',
    description: '',
    basePrice: 0
  });

  if (profile?.role !== 'admin') {
    return <div className="p-24 text-center text-red-500 font-bold text-2xl">Accès refusé.</div>;
  }

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('category'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), formData);
      } else {
        await addDoc(collection(db, 'services'), formData);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        category: '',
        subcategory: '',
        name: '',
        description: '',
        basePrice: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  if (loading) {
    return <div className="p-24 text-center">Chargement de l'administration...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Gestion des Services</h1>
          <p className="text-gray-500">Ajoutez, modifiez ou supprimez les types de services disponibles sur la plateforme.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 px-8 py-4"
        >
          <Plus size={20} />
          Nouveau Service
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-widest">Catégorie</th>
              <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-widest">Sous-catégorie</th>
              <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-widest">Nom</th>
              <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-widest">Prix Base</th>
              <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-6">
                  <span className="px-3 py-1 bg-blue-50 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                    {service.category}
                  </span>
                </td>
                <td className="p-6 text-gray-500 font-medium">{service.subcategory || '-'}</td>
                <td className="p-6 font-bold text-gray-900">{service.name}</td>
                <td className="p-6 font-bold text-secondary">{service.basePrice || 0}€</td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openModal(service)}
                      className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-primary transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-2xl font-display font-bold">
                  {editingService ? 'Modifier le service' : 'Nouveau service'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid size={14} />
                      Catégorie
                    </label>
                    <select 
                      required
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {CATEGORY_METADATA.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <ListTree size={14} />
                      Sous-catégorie
                    </label>
                    <input 
                      className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="Ex: Nettoyage vitres"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={14} />
                    Nom du service
                  </label>
                  <input 
                    required
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Nettoyage complet"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Euro size={14} />
                    Prix de base (€)
                  </label>
                  <input 
                    type="number"
                    required
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-medium min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez brièvement le service..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-5 flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                  <Save size={20} />
                  {editingService ? 'Enregistrer les modifications' : 'Créer le service'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
