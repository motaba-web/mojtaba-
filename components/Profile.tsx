
import React, { useState, useRef } from 'react';
import { User, AppLanguage } from '../types';
import { TRANSLATIONS } from '../constants';
import { DatabaseService } from '../services/database';

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
  onLogout: () => void;
  lang: AppLanguage;
  onShareApp: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, onLogout, lang, onShareApp }) => {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl || user.idImageUrl);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    const updated = { ...user, fullName, address, phone, profileImageUrl };
    setUser(updated);
    
    const users = DatabaseService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updated;
      DatabaseService.saveUsers(users);
    }
    DatabaseService.setCurrentUser(updated);
    setEditing(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="relative inline-block mb-4">
          <img src={profileImageUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-50 mx-auto" />
          <div className="absolute bottom-0 right-0 bg-green-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
          </div>
          {editing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
        </div>
        <h2 className="text-2xl font-bold">{user.fullName}</h2>
        <p className="text-gray-500 font-medium text-sm">ID: {user.idNumber}</p>
        <button onClick={onShareApp} className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-200 transition-all flex items-center gap-2 mx-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"/></svg>
          Share App Link
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        {editing ? (
          <div className="space-y-4">
            <div className="flex justify-center pb-2">
               <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  {lang === 'AR' ? 'تغيير الصورة الشخصية' : 'Change Profile Photo'}
               </button>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.fullName}</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.phone}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.address}</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold transition-all active:scale-95 shadow-md">Save Changes</button>
              <button onClick={() => setEditing(false)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm font-bold text-gray-400">{t.fullName}</span>
              <span className="text-sm font-bold text-gray-700">{user.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm font-bold text-gray-400">{t.phone}</span>
              <span className="text-sm font-bold text-gray-700">{user.phone}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm font-bold text-gray-400">{t.address}</span>
              <span className="text-sm font-bold text-gray-700">{user.address}</span>
            </div>
            <div className="pt-4 flex gap-4">
              <button onClick={() => setEditing(true)} className="flex-1 py-4 bg-gray-50 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                {t.edit} Profile
              </button>
              <button onClick={onLogout} className="flex-1 py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
                {t.logout}
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
        <svg className="w-6 h-6 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p className="text-xs text-orange-800 font-medium leading-relaxed">
          {t.brokerWarning} {t.noExternalBrokers}
        </p>
      </div>
    </div>
  );
};

export default Profile;
