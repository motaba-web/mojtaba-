
import React, { useState, useEffect } from 'react';
import { Listing, User, AppLanguage, AdminConfig } from '../types';
import { TRANSLATIONS } from '../constants';
import { DatabaseService } from '../services/database';

interface HomeProps {
  lang: AppLanguage;
  user: User;
  config: AdminConfig;
  highlightListingId?: string | null;
  onShare: (item: { title: string; url: string }) => void;
  onOpenAdmin?: () => void;
  onEditListing: (listing: Listing) => void;
}

const Home: React.FC<HomeProps> = ({ lang, user, config, highlightListingId, onShare, onOpenAdmin, onEditListing }) => {
  const [listings, setListings] = useState<Listing[]>(DatabaseService.getListings());
  const [search, setSearch] = useState('');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setListings(DatabaseService.getListings());
  }, []);

  const filtered = listings.filter(l => 
    l.model.toLowerCase().includes(search.toLowerCase()) || 
    l.description.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalListings: listings.length,
    totalUsers: DatabaseService.getUsers().length,
    totalReports: DatabaseService.getReports().length
  };

  const handleShare = (listing: Listing) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?listing=${listing.id}`;
    const text = `${listing.model} (${listing.year}) - ${listing.price.toLocaleString()} SDG. ${t.welcome}`;
    onShare({ title: text, url: shareUrl });
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm(lang === 'AR' ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure you want to delete this post?')) {
      DatabaseService.deleteListing(id);
      setListings(DatabaseService.getListings());
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">
      {/* Admin Dashboard Card - Sleek Version */}
      {user.isAdmin && (
        <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl mx-2 mb-6 overflow-hidden relative border border-white/5">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black tracking-tight">{lang === 'AR' ? 'مركز التحكم' : 'Admin Dashboard'}</h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{lang === 'AR' ? 'أهلاً يا مجتبى' : 'Welcome, Mogtaba'}</p>
              </div>
              <button 
                onClick={onOpenAdmin}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-lg active:scale-95"
              >
                {lang === 'AR' ? 'لوحة التحكم' : 'Management'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/10">
                <p className="text-lg font-black">{stats.totalListings}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{lang === 'AR' ? 'إعلان' : 'Posts'}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/10">
                <p className="text-lg font-black">{stats.totalUsers}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{lang === 'AR' ? 'عضو' : 'Users'}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-2xl text-center border border-red-500/20">
                <p className="text-lg font-black text-red-400">{stats.totalReports}</p>
                <p className="text-[8px] font-bold text-red-300 uppercase tracking-tighter">{lang === 'AR' ? 'بلاغ' : 'Alerts'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-Style Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder={t.search} 
            className="w-full py-3 pl-12 pr-4 bg-gray-100 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      {/* The Instagram-Style Feed */}
      <div className="space-y-2">
        {filtered.map(listing => {
          const isOwner = user.id === listing.sellerId;
          const showControls = isOwner || user.isAdmin;

          return (
            <div 
              key={listing.id} 
              id={`listing-${listing.id}`}
              className={`bg-white border-y md:border md:rounded-3xl border-gray-100 overflow-hidden transition-all duration-700 ${highlightListingId === listing.id ? 'ring-4 ring-blue-500 scale-[1.02] shadow-2xl z-20' : ''}`}
            >
              {/* Post Header: User Info */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                      <img 
                        src={listing.sellerProfileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.sellerName}`} 
                        className="w-full h-full rounded-full bg-gray-100 object-cover" 
                        alt="avatar"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 leading-tight">{listing.sellerName}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{listing.location || 'Sudan'}</span>
                  </div>
                </div>
                {showControls && (
                  <div className="flex gap-2">
                    <button onClick={() => onEditListing(listing)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                      {lang === 'AR' ? 'تعديل' : 'Edit'}
                    </button>
                    <button onClick={() => handleDeleteListing(listing.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      {lang === 'AR' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>

              {/* Post Media: Square Photo */}
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {listing.images[0] && (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.model} 
                    className="w-full h-full object-cover" 
                  />
                )}
                {/* Status Badge Overlays */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black text-white shadow-lg uppercase tracking-widest ${listing.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {listing.status === 'AVAILABLE' ? t.available : t.sold}
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-[9px] font-black text-white bg-blue-600 shadow-lg uppercase tracking-widest">
                    {listing.condition === 'NEW' ? 'New' : 'Used'}
                  </span>
                </div>
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white">
                    1/{listing.images.length}
                  </div>
                )}
              </div>

              {/* Post Interaction Bar */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <a href={`tel:${listing.sellerPhone}`} className="text-gray-900 hover:scale-110 transition-transform active:scale-90">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2-2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </a>
                  <button onClick={() => handleShare(listing)} className="text-gray-900 hover:scale-110 transition-transform active:scale-90">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"/></svg>
                  </button>
                  <button onClick={() => {
                     const reason = prompt(t.reportFraud);
                     if (reason) {
                       DatabaseService.addReport({
                         id: Math.random().toString(36).substr(2, 9),
                         targetId: listing.id,
                         type: 'LISTING',
                         reporterId: user.id,
                         reason,
                         timestamp: Date.now()
                       });
                       alert(t.success);
                       setListings(DatabaseService.getListings());
                     }
                  }} className="text-gray-900 hover:scale-110 transition-transform active:scale-90">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </button>
                </div>
                <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {listing.mileage.toLocaleString()} KM
                </div>
              </div>

              {/* Post Description / Caption */}
              <div className="px-4 pb-6 space-y-1">
                <p className="text-lg font-black text-gray-900">
                  {listing.price.toLocaleString()} <span className="text-[10px] font-bold">SDG</span>
                </p>
                <div className="text-sm">
                  <span className="font-black text-gray-900 mr-2">{listing.model} ({listing.year})</span>
                  <span className="text-gray-700 leading-relaxed">{listing.description}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                  {new Date(listing.createdAt).toLocaleDateString()} • {t.brokerWarning}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <p className="font-bold text-sm uppercase tracking-widest">{lang === 'AR' ? 'لا توجد نتائج' : 'No Cars Found'}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
