import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Heart, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Services réalisés', value: '50k+' },
  { label: 'Prestataires qualifiés', value: '15k+' },
  { label: 'Clients satisfaits', value: '40k+' },
  { label: 'Villes couvertes', value: '120+' },
];

const values = [
  {
    icon: Shield,
    title: 'Confiance & Sécurité',
    description: 'Chaque prestataire est vérifié et chaque prestation est assurée pour votre tranquillité.',
    color: 'bg-teal-50 text-primary',
  },
  {
    icon: Heart,
    title: 'Qualité & Excellence',
    description: 'Nous nous engageons à fournir un service de la plus haute qualité pour chaque besoin.',
    color: 'bg-orange-50 text-secondary',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Nous créons des liens forts entre les talents locaux et ceux qui en ont besoin.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Nous simplifions la vie quotidienne grâce à une technologie intuitive et efficace.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const team = [
  {
    name: 'Sarah Martin',
    role: 'Fondatrice & CEO',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Thomas Dubois',
    role: 'Directeur Technique',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Léa Bernard',
    role: 'Responsable Communauté',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Marc Lefebvre',
    role: 'Directeur Produit',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  },
];

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000" 
            alt="Team working" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative container-max px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
          >
            Notre Mission
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            Simplifier la vie quotidienne en connectant les talents locaux avec ceux qui ont besoin d'un coup de main. Nous croyons en une économie collaborative basée sur la confiance et l'excellence.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="container-max px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</p>
                <p className="text-white/70 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-max grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-display font-bold mb-6">Notre Histoire</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Tout a commencé en 2020, avec une idée simple : pourquoi est-il si difficile de trouver quelqu'un de confiance pour monter un meuble ou tondre la pelouse ?
              </p>
              <p>
                YoojoClone est né de cette volonté de créer une plateforme transparente, sécurisée et efficace. Ce qui n'était au départ qu'une petite application locale est devenu aujourd'hui le leader de la mise en relation de services à domicile.
              </p>
              <p>
                Aujourd'hui, nous sommes fiers d'accompagner des milliers de jobbeurs dans le développement de leur activité et des milliers de clients dans leur quotidien.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
              alt="Office meeting" 
              className="rounded-[40px] shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-8 -left-8 bg-secondary p-8 rounded-3xl text-white shadow-xl hidden md:block">
              <p className="text-4xl font-bold mb-1">6 ans</p>
              <p className="font-medium opacity-80">D'innovation & de service</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">Nos Valeurs</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Ce qui nous anime au quotidien et guide chacune de nos décisions.
          </p>
        </div>
        <div className="container-max grid md:grid-cols-4 gap-8">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all group"
            >
              <div className={`${value.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <value.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding">
        <div className="container-max text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">L'Équipe</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Des passionnés qui travaillent chaque jour pour améliorer votre expérience.
          </p>
        </div>
        <div className="container-max grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center group"
            >
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-primary rounded-full scale-105 opacity-0 group-hover:opacity-10 transition-opacity" />
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-48 h-48 rounded-full object-cover shadow-lg group-hover:scale-95 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-primary font-medium text-sm uppercase tracking-wider">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="container-max relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">
            Prêt à rejoindre l'aventure ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/become-provider" className="btn-primary flex items-center justify-center gap-2">
              Devenir Jobbeur <ArrowRight size={20} />
            </Link>
            <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
              Trouver un service <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
