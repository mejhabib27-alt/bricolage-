import { Sparkles, Hammer, Scissors, Truck, Dog, Home as HomeIcon, Baby, GraduationCap, Camera, PartyPopper, Heart, Car } from 'lucide-react';

export const CATEGORIES = [
  { 
    id: 'menage', 
    name: 'Ménage', 
    icon: Sparkles, 
    color: 'bg-blue-500', 
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    description: 'Confiez votre intérieur à des experts du nettoyage. Un domicile impeccable sans effort.',
    services: [
      { id: 'nettoyage-domicile', name: 'Nettoyage domicile', description: 'Ménage régulier ou ponctuel' },
      { id: 'repassage', name: 'Repassage', description: 'Linge repassé et plié' },
      { id: 'nettoyage-vitres', name: 'Nettoyage vitres', description: 'Vitrages sans traces' },
      { id: 'etat-des-lieux', name: 'État des lieux', description: 'Nettoyage complet avant/après déménagement' }
    ]
  },
  { 
    id: 'bricolage', 
    name: 'Bricolage', 
    icon: Hammer, 
    color: 'bg-orange-500', 
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    description: 'Besoin d\'un coup de main pour vos petits travaux ? Nos bricoleurs sont là pour vous.',
    services: [
      { id: 'montage-meubles', name: 'Montage meubles', description: 'IKEA, Conforama, etc.' },
      { id: 'peinture', name: 'Peinture', description: 'Murs, plafonds, boiseries' },
      { id: 'petite-plomberie', name: 'Petite plomberie', description: 'Fuites, robinets, débouchage' },
      { id: 'electricite', name: 'Électricité', description: 'Prises, luminaires, interrupteurs' },
      { id: 'pose-tringles', name: 'Pose de tringles', description: 'Rideaux, cadres, étagères' },
      { id: 'parquet', name: 'Poser du parquet', description: 'Sols stratifiés ou massifs' }
    ]
  },
  { 
    id: 'jardinage', 
    name: 'Jardinage', 
    icon: Scissors, 
    color: 'bg-green-500', 
    textColor: 'text-green-500',
    bgColor: 'bg-green-50',
    description: 'Profitez d\'un jardin magnifique toute l\'année avec nos jardiniers passionnés.',
    services: [
      { id: 'tonte-pelouse', name: 'Tonte pelouse', description: 'Entretien régulier de votre gazon' },
      { id: 'taille-haie', name: 'Taille de haie', description: 'Coupe propre et évacuation des déchets' },
      { id: 'arrosage', name: 'Arrosage', description: 'Gestion de l\'eau pour vos plantes' },
      { id: 'debroussaillage', name: 'Débroussaillage', description: 'Remise en état de terrains' }
    ]
  },
  { 
    id: 'demenagement', 
    name: 'Déménagement', 
    icon: Truck, 
    color: 'bg-purple-500', 
    textColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    description: 'Déménagez l\'esprit tranquille avec une aide efficace pour vos meubles et cartons.',
    services: [
      { id: 'aide-transport', name: 'Aide au transport', description: 'Chauffeur et véhicule' },
      { id: 'gros-bras', name: 'Gros bras', description: 'Manutention d\'objets lourds' },
      { id: 'location-camion', name: 'Location camion', description: 'Avec ou sans chauffeur' },
      { id: 'emballage-cartons', name: 'Emballage cartons', description: 'Protection de vos objets fragiles' }
    ]
  },
  { 
    id: 'animaux', 
    name: 'Animaux', 
    icon: Dog, 
    color: 'bg-pink-500', 
    textColor: 'text-pink-500',
    bgColor: 'bg-pink-50',
    description: 'Le meilleur pour vos compagnons à quatre pattes.',
    services: [
      { id: 'pet-sitting', name: 'Garde d\'animaux', description: 'À domicile ou chez le jobbeur' },
      { id: 'promenade', name: 'Promenade', description: 'Sorties quotidiennes' }
    ]
  },
  { 
    id: 'aide', 
    name: 'Aide à domicile', 
    icon: HomeIcon, 
    color: 'bg-teal-500', 
    textColor: 'text-teal-500',
    bgColor: 'bg-teal-50',
    description: 'Une assistance précieuse pour faciliter votre quotidien.',
    services: [
      { id: 'courses', name: 'Courses', description: 'Livraison de vos achats' },
      { id: 'repas', name: 'Préparation repas', description: 'Cuisine à domicile' },
      { id: 'informatique', name: 'Informatique', description: 'Dépannage et formation' }
    ]
  },
  {
    id: 'baby-sitting',
    name: 'Baby-sitting',
    icon: Baby,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    description: 'Confiez vos enfants à des personnes de confiance.',
    services: [
      { id: 'garde-ponctuelle', name: 'Garde ponctuelle', description: 'Soirées, imprévus' },
      { id: 'sortie-ecole', name: 'Sortie d\'école', description: 'Récupération et goûter' }
    ]
  },
  {
    id: 'cours',
    name: 'Cours particuliers',
    icon: GraduationCap,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    description: 'Apprenez de nouvelles compétences avec des experts.',
    services: [
      { id: 'soutien-scolaire', name: 'Soutien scolaire', description: 'Maths, Français, Anglais...' },
      { id: 'musique', name: 'Cours de musique', description: 'Guitare, Piano, Chant...' }
    ]
  },
  {
    id: 'photo',
    name: 'Photographie',
    icon: Camera,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    description: 'Capturez vos plus beaux moments.',
    services: [
      { id: 'shooting-photo', name: 'Shooting photo', description: 'Portrait, Famille, Couple' },
      { id: 'evenement', name: 'Événements', description: 'Mariage, Anniversaire' }
    ]
  },
  {
    id: 'evenementiel',
    name: 'Événementiel',
    icon: PartyPopper,
    color: 'bg-rose-500',
    textColor: 'text-rose-500',
    bgColor: 'bg-rose-50',
    description: 'Organisez des événements inoubliables.',
    services: [
      { id: 'dj', name: 'DJ & Animation', description: 'Musique et ambiance' },
      { id: 'traiteur', name: 'Traiteur', description: 'Buffets et cocktails' }
    ]
  },
  {
    id: 'beaute',
    name: 'Beauté & Bien-être',
    icon: Heart,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    description: 'Prenez soin de vous à domicile.',
    services: [
      { id: 'coiffure', name: 'Coiffure', description: 'Coupe et brushing' },
      { id: 'massage', name: 'Massage', description: 'Relaxation et détente' }
    ]
  },
  {
    id: 'auto',
    name: 'Réparation Auto',
    icon: Car,
    color: 'bg-slate-500',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-50',
    description: 'Entretenez votre véhicule sans vous déplacer.',
    services: [
      { id: 'vidange', name: 'Vidange', description: 'Entretien courant' },
      { id: 'nettoyage-auto', name: 'Nettoyage auto', description: 'Intérieur et extérieur' }
    ]
  }
];
