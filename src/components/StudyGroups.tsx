import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, collection, getDocs, query, where, doc, addDoc, onSnapshot, serverTimestamp, arrayUnion, updateDoc, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Users, Plus, MessageSquare, Send, User, BookOpen, Search, X, Loader2, ArrowRight, FileText, Link as LinkIcon, Share2, Trash2 } from 'lucide-react';
import { StudyGroup, Message, UserProfile, Material } from '../types';

const StudyGroups = () => {
  const [user] = useAuthState(auth);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'materials'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'link' | 'note'>('link');
  const [materialContent, setMaterialContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'studyGroups'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGroup));
      setGroups(fetchedGroups);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedGroup) return;
    const q = query(
      collection(db, 'studyGroups', selectedGroup.id, 'messages'),
      where('createdAt', '!=', null)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(fetchedMessages);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });
    return () => unsubscribe();
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    const q = query(
      collection(db, 'studyGroups', selectedGroup.id, 'materials'),
      where('createdAt', '!=', null)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMaterials = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Material))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMaterials(fetchedMaterials);
    });
    return () => unsubscribe();
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (!user || !groupName.trim()) return;
    try {
      const newGroup = {
        name: groupName,
        description: groupDesc,
        grade: 'Grade 8', // Default or get from profile
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };
      const path = 'studyGroups';
      try {
        await addDoc(collection(db, 'studyGroups'), newGroup);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
    } catch (err: any) {
      console.error('Error creating group:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedGroup || !newMessage.trim()) return;
    try {
      const message = {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Student',
        createdAt: serverTimestamp(),
      };
      const path = `studyGroups/${selectedGroup.id}/messages`;
      try {
        await addDoc(collection(db, 'studyGroups', selectedGroup.id, 'messages'), message);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
    }
  };

  const handleShareMaterial = async () => {
    if (!user || !selectedGroup || !materialTitle.trim()) return;
    try {
      const material = {
        title: materialTitle,
        type: materialType,
        [materialType === 'link' ? 'url' : 'content']: materialContent,
        senderId: user.uid,
        senderName: user.displayName || 'Student',
        createdAt: serverTimestamp(),
      };
      const path = `studyGroups/${selectedGroup.id}/materials`;
      try {
        await addDoc(collection(db, 'studyGroups', selectedGroup.id, 'materials'), material);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
      setShowShareModal(false);
      setMaterialTitle('');
      setMaterialContent('');
    } catch (err: any) {
      console.error('Error sharing material:', err);
    }
  };

  const handleJoinGroup = async (group: StudyGroup) => {
    if (!user || group.members.includes(user.uid)) return;
    try {
      const path = `studyGroups/${group.id}`;
      try {
        await updateDoc(doc(db, 'studyGroups', group.id), {
          members: arrayUnion(user.uid)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } catch (err: any) {
      console.error('Error joining group:', err);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)]">
        {/* Sidebar: Groups List */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tighter uppercase">STUDY <span className="text-[#D4AF37]">GROUPS</span></h1>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 bg-[#D4AF37] text-black rounded-xl flex items-center justify-center hover:bg-[#F9E79F] transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs focus:border-[#D4AF37] outline-none transition-all"
            />
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                  selectedGroup?.id === group.id 
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm group-hover:text-[#D4AF37] transition-colors">{group.name}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{group.grade}</span>
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-2">{group.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                  <Users size={12} /> {group.members.length} Members
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Area: Discussion or Selection */}
        <div className="flex-grow bg-white/5 border border-white/10 rounded-[40px] overflow-hidden flex flex-col backdrop-blur-xl">
          {selectedGroup ? (
            <>
              {/* Group Header */}
              <div className="p-6 border-b border-white/10 flex flex-col gap-4 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                      <p className="text-xs text-gray-500">{selectedGroup.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedGroup.members.includes(user?.uid || '') ? (
                      <button 
                        onClick={() => handleJoinGroup(selectedGroup)}
                        className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-full hover:bg-[#F9E79F] transition-all text-xs"
                      >
                        Join Group
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="px-4 py-2 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all text-xs flex items-center gap-2"
                      >
                        <Share2 size={14} /> Share Material
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${
                      activeTab === 'chat' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    Discussion
                  </button>
                  <button 
                    onClick={() => setActiveTab('materials')}
                    className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${
                      activeTab === 'materials' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    Materials ({materials.length})
                  </button>
                </div>
              </div>

              {activeTab === 'chat' ? (
                <>
                  {/* Messages Area */}
                  <div 
                    ref={scrollRef}
                    className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#D4AF37]/20"
                  >
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 px-2">
                            {msg.senderName}
                          </span>
                          <div className={`p-4 rounded-2xl text-sm ${
                            msg.senderId === user?.uid 
                              ? 'bg-[#D4AF37] text-black font-medium' 
                              : 'bg-white/10 text-gray-200'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 bg-white/5 border-t border-white/10">
                    <div className="relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={selectedGroup.members.includes(user?.uid || '') ? "Type a message..." : "Join the group to participate"}
                        disabled={!selectedGroup.members.includes(user?.uid || '')}
                        className="w-full pl-6 pr-16 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !selectedGroup.members.includes(user?.uid || '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#D4AF37] text-black rounded-xl flex items-center justify-center hover:bg-[#F9E79F] transition-all disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
                  {materials.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <BookOpen size={48} className="text-[#D4AF37] mb-4" />
                      <p className="text-sm">No materials shared yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {materials.map((material) => (
                        <div key={material.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[#D4AF37]/50 transition-all group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                              {material.type === 'link' ? <LinkIcon size={20} /> : <FileText size={20} />}
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                              {new Date(material.createdAt?.seconds * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm mb-1">{material.title}</h4>
                          <p className="text-[10px] text-gray-400 mb-4 line-clamp-2">Shared by {material.senderName}</p>
                          
                          {material.type === 'link' ? (
                            <a 
                              href={material.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full py-2 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all"
                            >
                              Open Link <ArrowRight size={12} />
                            </a>
                          ) : (
                            <div className="p-3 bg-black/20 rounded-lg text-[10px] text-gray-300 max-h-24 overflow-y-auto italic">
                              {material.content}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-50">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6">
                <Users size={48} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">SELECT A <span className="text-[#D4AF37]">GROUP</span></h3>
              <p className="text-sm max-w-sm">Choose a study group from the sidebar to start collaborating with your classmates.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase">CREATE <span className="text-[#D4AF37]">GROUP</span></h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Group Name</label>
                  <input 
                    type="text" 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Grade 10 Math Wizards"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    placeholder="What is this group about?"
                    rows={3}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"
                  />
                </div>
                <button 
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim()}
                  className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#F9E79F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Create Group <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Material Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase">SHARE <span className="text-[#D4AF37]">MATERIAL</span></h2>
                <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                  <button 
                    onClick={() => setMaterialType('link')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      materialType === 'link' ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Link
                  </button>
                  <button 
                    onClick={() => setMaterialType('note')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      materialType === 'note' ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    Note
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    placeholder="e.g. Calculus Cheat Sheet"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {materialType === 'link' ? 'URL' : 'Note Content'}
                  </label>
                  {materialType === 'link' ? (
                    <input 
                      type="url" 
                      value={materialContent}
                      onChange={(e) => setMaterialContent(e.target.value)}
                      placeholder="https://example.com/resource"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm"
                    />
                  ) : (
                    <textarea 
                      value={materialContent}
                      onChange={(e) => setMaterialContent(e.target.value)}
                      placeholder="Type your study note here..."
                      rows={4}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#D4AF37] outline-none transition-all text-sm resize-none"
                    />
                  )}
                </div>
                <button 
                  onClick={handleShareMaterial}
                  disabled={!materialTitle.trim() || !materialContent.trim()}
                  className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#F9E79F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Share Now <Share2 size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyGroups;
