import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Search, MoreVertical, Phone, Video, Image as ImageIcon, Paperclip, Smile, ArrowLeft, MessageSquare, Plus } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Conversation, Message } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const convoIdParam = searchParams.get('convoId');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convs);
      
      if (convoIdParam && !activeConversation) {
        const target = convs.find(c => c.id === convoIdParam);
        if (target) {
          setActiveConversation(target);
          setShowMobileList(false);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching conversations:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, convoIdParam]);

  useEffect(() => {
    if (!activeConversation) return;

    const q = query(
      collection(db, 'conversations', activeConversation.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      scrollToBottom();
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConversation || !newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, 'conversations', activeConversation.id, 'messages'), {
        senderId: user.uid,
        text,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    const otherId = conv.participants.find(id => id !== user?.uid);
    return otherId ? { id: otherId, ...conv.participantDetails[otherId] } : null;
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden pt-16">
      <div className="container-max flex w-full h-full bg-white shadow-xl overflow-hidden md:rounded-t-3xl border-x border-t border-gray-100">
        
        {/* Conversations List */}
        <aside className={`w-full md:w-96 border-r border-gray-100 flex flex-col ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-display font-bold text-primary mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher une discussion..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucune conversation pour le moment.</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setShowMobileList(false);
                    }}
                    className={`w-full p-4 flex gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeConversation?.id === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  >
                    <img 
                      src={other?.photoUrl || 'https://via.placeholder.com/40'} 
                      alt={other?.name} 
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow text-left overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{other?.name}</h3>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {conv.lastMessageAt && format(conv.lastMessageAt.toDate(), 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={`flex-grow flex flex-col bg-white ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <img 
                    src={getOtherParticipant(activeConversation)?.photoUrl} 
                    alt={getOtherParticipant(activeConversation)?.name} 
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{getOtherParticipant(activeConversation)?.name}</h3>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> En ligne
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/mission/propose?clientId=${getOtherParticipant(activeConversation)?.id}&clientName=${getOtherParticipant(activeConversation)?.name}`)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all"
                  >
                    <Plus size={16} />
                    Proposer une mission
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.uid;
                  const isNote = msg.type === 'note';
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isMe ? 'order-2' : 'order-1'}`}>
                        {isNote ? (
                          <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                              <Info size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Note d'instruction</span>
                            </div>
                            <p className="text-sm text-amber-900 leading-relaxed font-medium">
                              {msg.text}
                            </p>
                          </div>
                        ) : (
                          <div className={`p-4 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' : 'bg-white text-gray-700 rounded-tl-none shadow-sm border border-gray-100'}`}>
                            {msg.text}
                          </div>
                        )}
                        <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {msg.createdAt && format(msg.createdAt.toDate(), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="flex items-center gap-1 px-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                      <ImageIcon size={20} />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..." 
                    className="flex-grow bg-transparent py-2 outline-none text-sm"
                  />
                  <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                    <Smile size={20} />
                  </button>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 p-12 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={48} className="opacity-20" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Vos messages</h2>
              <p className="max-w-xs">Sélectionnez une conversation pour commencer à discuter avec vos jobbeurs ou clients.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;
