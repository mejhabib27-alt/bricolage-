import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

const faqs = [
  {
    question: "Comment réserver un jobbeur ?",
    answer: "C'est très simple ! Recherchez le service dont vous avez besoin, choisissez un jobbeur en fonction de ses avis et tarifs, puis envoyez-lui une demande de réservation. Une fois acceptée, vous pourrez discuter des détails."
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, Amex) via notre système de paiement sécurisé. Les fonds sont bloqués jusqu'à la fin de la prestation pour garantir votre satisfaction."
  },
  {
    question: "Suis-je assuré pendant la prestation ?",
    answer: "Oui, toutes les prestations réalisées via Yoojo Clone sont couvertes par notre assurance partenaire AXA. Cela inclut les dommages corporels et matériels."
  },
  {
    question: "Comment devenir jobbeur ?",
    answer: "Rendez-vous sur la page 'Devenir Jobbeur', créez votre profil en détaillant vos compétences, et commencez à postuler aux missions autour de vous."
  }
];

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-8 leading-tight">
              Parlons de votre <span className="text-primary">projet</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Une question ? Un besoin spécifique ? Notre équipe est là pour vous accompagner et répondre à toutes vos interrogations.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos coordonnées</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Mail size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-lg font-bold text-gray-900">contact@yoojo-clone.fr</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-teal-50 text-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Phone size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                      <p className="text-lg font-bold text-gray-900">01 23 45 67 89</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-amber-50 text-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Bureaux</p>
                      <p className="text-lg font-bold text-gray-900">123 Avenue des Champs-Élysées, Paris</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-900 rounded-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl" />
                <MessageSquare className="text-primary mb-6" size={40} />
                <h3 className="text-xl font-bold mb-4">Support 24/7</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Nos conseillers sont disponibles par chat pour vous aider en temps réel.
                </p>
                <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all">
                  Lancer le chat
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50">
                {formState === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Message envoyé !</h2>
                    <p className="text-gray-500 text-lg mb-8">Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.</p>
                    <button 
                      onClick={() => setFormState('idle')}
                      className="btn-primary px-10 py-4"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Nom complet</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Jean Dupont" 
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                        <input 
                          required
                          type="email" 
                          placeholder="jean@example.com" 
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Sujet</label>
                      <select className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700">
                        <option>Question sur une réservation</option>
                        <option>Devenir jobbeur</option>
                        <option>Problème technique</option>
                        <option>Autre demande</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder="Comment pouvons-nous vous aider ?" 
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>
                    <button 
                      disabled={formState === 'submitting'}
                      className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {formState === 'submitting' ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Envoyer le message
                          <Send size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <HelpCircle className="text-primary mx-auto mb-6" size={48} />
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-lg text-gray-500">Trouvez rapidement des réponses aux questions les plus courantes.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                  >
                    <ChevronDown size={24} className="text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8"
                    >
                      <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
