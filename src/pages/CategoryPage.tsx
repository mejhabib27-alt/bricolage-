import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants/services';
import { ArrowRight, ChevronRight, Star, Clock, Shield, CheckCircle2 } from 'lucide-react';

export default function CategoryPage() {
  const { categoryId, serviceId } = useParams();
  
  const category = CATEGORIES.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
          <Link to="/" className="text-primary hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const selectedService = serviceId ? category.services.find(s => s.id === serviceId) : null;

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/category/${category.id}`} className={!serviceId ? "text-primary font-medium" : "hover:text-primary"}>
            {category.name}
          </Link>
          {serviceId && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-medium">{selectedService?.name}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8"
            >
              <div className={`w-16 h-16 ${category.bgColor} ${category.textColor} rounded-2xl flex items-center justify-center mb-6`}>
                <category.icon className="w-8 h-8" />
              </div>
              
              <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
                {serviceId ? selectedService?.name : category.name}
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed mb-8">
                {serviceId ? selectedService?.description : category.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">4.9/5</p>
                    <p className="text-xs text-gray-500">Note moyenne</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">30 min</p>
                    <p className="text-xs text-gray-500">Réponse rapide</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Assuré</p>
                    <p className="text-xs text-gray-500">Protection incluse</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {!serviceId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/category/${category.id}/${service.id}`}
                      className="block bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary hover:shadow-md transition-all group"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center text-primary text-sm font-semibold">
                        Voir les détails
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {serviceId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pourquoi choisir ce service ?</h2>
                <div className="space-y-4">
                  {[
                    "Jobbeurs qualifiés et vérifiés",
                    "Paiement sécurisé en ligne",
                    "Assurance AXA incluse",
                    "Service client disponible 7j/7",
                    "Tarifs transparents et compétitifs"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Besoin d'aide ?</h3>
                <p className="text-gray-500 mb-8">
                  Postez votre demande gratuitement et recevez des offres en moins de 30 minutes.
                </p>
                <Link
                  to={`/mission/new?category=${category.name}${serviceId ? `&service=${selectedService?.name}` : ''}`}
                  className="block w-full bg-primary text-white text-center py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Demander un devis
                </Link>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Gratuit et sans engagement
                </p>
              </div>

              <div className="mt-8 bg-primary/5 rounded-3xl p-8 border border-primary/10">
                <h4 className="font-bold text-primary mb-2">Comment ça marche ?</h4>
                <ol className="space-y-4 mt-4">
                  {[
                    "Décrivez votre besoin",
                    "Recevez des offres",
                    "Choisissez votre jobbeur",
                    "Payez une fois satisfait"
                  ].map((step, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm text-gray-700">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
