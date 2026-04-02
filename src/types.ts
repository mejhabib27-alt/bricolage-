export type UserRole = 'client' | 'jobber' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  bio?: string;
  photoUrl?: string;
  rating?: number;
  reviewsCount?: number;
  location?: string;
  services?: string[];
  hourlyRate?: number;
  completedJobs?: number;
  isVerified?: boolean;
  languages?: string[];
  skills?: string[];
  gallery?: string[];
  experience?: string;
  balance?: number;
  responseRate?: number;
  interventionRadius?: number;
  maxHoursPerWeek?: number;
  isAvailable?: boolean;
}

export type BookingStatus = 'pending' | 'accepted' | 'paid' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  clientId: string;
  jobberId?: string;
  serviceId: string;
  categoryName?: string;
  taskType?: string;
  status: BookingStatus;
  date: any; // Firestore Timestamp
  location: string;
  totalAmount?: number;
  budget?: number;
  duration?: string;
  peopleCount?: number;
  equipment?: string;
  urgency?: 'normal' | 'urgent' | 'very_urgent';
  flexibility?: string;
  description?: string;
  createdAt: any; // Firestore Timestamp
  acceptedAt?: any;
  completedAt?: any;
  cancelledAt?: any;
  providerName?: string;
  clientName?: string;
}

export interface Service {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  description?: string;
  basePrice?: number;
}

export interface Provider extends UserProfile {
  services: string[];
  hourlyRate: number;
  completedJobs: number;
  isVerified: boolean;
  languages: string[];
  skills: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface Review {
  id: string;
  bookingId: string;
  fromId: string;
  toId: string;
  rating: number;
  comment?: string;
  createdAt: any; // Firestore Timestamp
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any; // Firestore Timestamp
  missionId?: string;
  participantDetails: {
    [uid: string]: {
      name: string;
      photoUrl: string;
    };
  };
  unreadCount?: {
    [uid: string]: number;
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  type?: 'text' | 'note';
  createdAt: any; // Firestore Timestamp
}
