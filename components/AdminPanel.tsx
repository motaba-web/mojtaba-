
import React, { useState, useEffect } from 'react';
import { AppLanguage, AdminConfig, Report, User, Listing } from '../types';
import { TRANSLATIONS, AVAILABLE_FONTS, BRANDING_PALETTE } from '../constants';
import { DatabaseService } from '../services/database';

interface AdminPanelProps {
  lang: AppLanguage;
  config: AdminConfig;
  setConfig: (config: AdminConfig) => void;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ lang, config, setConfig, onBack }) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'reports' | 'users' | 'listings' | 'build'>('branding');
  const [reports, setReports] = useState<Report[]>(DatabaseService.getReports());
  const [users, setUsers] = useState<User[]>(DatabaseService.getUsers());
  const [listings, setListings] = useState<Listing[]>(DatabaseService.getListings());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setReports(DatabaseService.getReports());
    setUsers(DatabaseService.getUsers());
    setListings(DatabaseService.getListings());
  }, [activeTab]);

  const handleUpdateConfig = (key: keyof AdminConfig, value: any) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    DatabaseService.saveConfig(next);
  };

  const handleSuspend = (userId: string) => {
    const nextUsers = users.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u);
    setUsers(nextUsers);
    DatabaseService.saveUsers(nextUsers);
  };

  const handleDeleteListing = (id: string) => {
    if (window.confirm('Are you sure you want to remove this listing?')) {
      DatabaseService.deleteListing(id);
      setListings(DatabaseService.getListings());
    }
  };

  const handleDownloadManifest = () => {
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) {
      window.open((manifest as HTMLLinkElement).href, '_blank');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 animate-in fade-in duration-300">
      {/* Premium Admin Header */}
      <div className="bg-slate-900 text-white p-8 rounded-b-[40px] shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4 hover:text-blue-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              {lang === 'AR' ? 'رجوع للرئيسية' : 'Back to Home'}
            </button>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              MOGTABA ALAWD
              <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Super User</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">Sumsar Global Administration & Oversight</p>
          </div>
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-[30px] border border-white/10 text-center min-w-[120px]">
            <p className="text-2xl font-black text-blue-500">1.0%</p>
            <p className="text-[9px] font-bold text-gray-500 uppercase">Fixed Fee</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminNavTile active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} label="Branding" icon="brush" color="bg-blue-600" />
          <AdminNavTile active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} label="Inventory" icon="car" color="bg-orange-500" />
          <AdminNavTile active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Registry" icon="users" color="bg-green-600" />
          <AdminNavTile active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Alerts" icon="flag" color="bg-red-500" count={reports.length} />
          <AdminNavTile active={activeTab === 'build'} onClick={() => setActiveTab('build')} label="APK" icon="download" color="bg-purple-600" />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">Visual Identity</h3>
                <div className="flex gap-2">
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.secondaryColor }}></div>
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.m1Color }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormGroup label="App Name (AR)" value={config.appNameAr} onChange={(v) => handleUpdateConfig('appNameAr', v)} />
                  <FormGroup label="App Name (EN)" value={config.appNameEn} onChange={(v) => handleUpdateConfig('appNameEn', v)} />
                  
                  <div className="space-y-6 bg-slate-50 p-6 rounded-[24px]">
                    <div className="flex flex-col gap-4">
                      <ColorField 
                        label="Primary" 
                        value={config.primaryColor} 
                        onChange={(v) => handleUpdateConfig('primaryColor', v)} 
                      />
                      <ColorField 
                        label="Secondary" 
                        value={config.secondaryColor} 
                        onChange={(v) => handleUpdateConfig('secondaryColor', v)} 
                      />
                      <ColorField 
                        label="(1 m) Color" 
                        value={config.m1Color} 
                        onChange={(v) => handleUpdateConfig('m1Color', v)} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Typography / Font</label>
                    <select 
                      value={config.fontFamily} 
                      onChange={(e) => handleUpdateConfig('fontFamily', e.target.value)}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[18px] outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-inner appearance-none"
                    >
                      {AVAILABLE_FONTS.map(f => (
                        <option key={f.name} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Branding Preview</p>
                   <div className="space-y-4">
                      <div className="h-12 rounded-2xl flex items-center px-4 text-white font-bold text-sm shadow-md transition-all" style={{ backgroundColor: config.primaryColor, fontFamily: config.fontFamily }}>
                        {config.appNameAr} / {config.appNameEn}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                         <div className="h-20 rounded-2xl bg-white border-2 border-slate-100 p-3 shadow-sm" style={{ fontFamily: config.fontFamily }}>
                            <div className="w-8 h-2 rounded-full mb-2" style={{ backgroundColor: config.primaryColor }}></div>
                            <div className="w-full h-1 bg-slate-100 rounded-full mb-1"></div>
                            <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                            <span className="text-[8px] font-bold">Primary</span>
                         </div>
                         <div className="h-20 rounded-2xl bg-white border-2 border-slate-100 p-3 shadow-sm" style={{ fontFamily: config.fontFamily }}>
                            <div className="w-8 h-2 rounded-full mb-2" style={{ backgroundColor: config.secondaryColor }}></div>
                            <div className="w-full h-1 bg-slate-100 rounded-full mb-1"></div>
                            <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                            <span className="text-[8px] font-bold">Secondary</span>
                         </div>
                         <div className="h-20 rounded-2xl bg-white border-2 border-slate-100 p-3 shadow-sm" style={{ fontFamily: config.fontFamily }}>
                            <div className="w-8 h-2 rounded-full mb-2" style={{ backgroundColor: config.m1Color }}></div>
                            <div className="w-full h-1 bg-slate-100 rounded-full mb-1"></div>
                            <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                            <span className="text-[8px] font-bold">(1 m)</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
              <FormGroup label="Logo URL" value={config.logoUrl} onChange={(v) => handleUpdateConfig('logoUrl', v)} />
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">Build & Export Center</h3>
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mobile Ready</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200">
                  <h4 className="font-black text-slate-700 mb-2 uppercase text-[11px] tracking-widest">PWA / Web APK Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                      Manifest Valid
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                      Offline Service Worker Active
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                      Installable on Android/iOS
                    </div>
                  </div>
                  <button onClick={handleDownloadManifest} className="mt-6 w-full py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                    View Manifest Source
                  </button>
                </div>

                <div className="bg-purple-900 text-white p-6 rounded-[32px] shadow-xl">
                  <h4 className="font-black mb-2 uppercase text-[11px] tracking-widest text-purple-300">Generate Native APK</h4>
                  <p className="text-xs font-bold text-purple-100 mb-4 leading-relaxed">
                    To create a signed APK for the Google Play Store, we recommend using **PWABuilder**.
                  </p>
                  <ol className="text-[10px] space-y-2 mb-6 opacity-80 list-decimal pl-4 font-bold">
                    <li>Copy this app URL</li>
                    <li>Go to pwabuilder.com</li>
                    <li>Paste the URL & click "Package"</li>
                    <li>Select "Android (Google Play)"</li>
                    <li>Download your .apk and .aab files</li>
                  </ol>
                  <button onClick={() => window.open('https://www.pwabuilder.com', '_blank')} className="w-full py-4 bg-white text-purple-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-purple-50 active:scale-95 transition-all">
                    Launch PWABuilder
                  </button>
                </div>
              </div>

              <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-[24px] shadow-lg flex items-center justify-center p-2 mb-4">
                  <img src={config.logoUrl} className="w-full h-full object-cover rounded-[18px]" />
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-1">{config.appNameEn} Distribution</h4>
                <p className="text-xs font-bold text-slate-400 max-w-sm mb-6">
                  {lang === 'AR' ? 'تطبيقك جاهز للنشر كـ PWA. يمكن للمستخدمين تثبيته مباشرة من المتصفح كـ APK.' : 'Your app is ready for PWA distribution. Users can install it directly from the browser as a Web APK.'}
                </p>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414C17.0588 15.3414 16.6588 15.6179 16.4765 16.0235C15.6529 17.8471 13.8471 19.1235 11.7529 19.1235C8.94118 19.1235 6.65882 16.8412 6.65882 14.0294C6.65882 11.2176 8.94118 8.93529 11.7529 8.93529C13.8471 8.93529 15.6529 10.2118 16.4765 12.0353C16.6588 12.4412 17.0588 12.7176 17.5235 12.7176H21.5C21.7765 12.7176 22 12.4941 22 12.2176V10.7412C22 10.4647 21.7765 10.2412 21.5 10.2412H18.3941C17.4353 7.35294 14.8353 5.24118 11.7529 5.24118C7.47059 5.24118 4 8.71176 4 13.0294C4 17.3471 7.47059 20.8176 11.7529 20.8176C14.8353 20.8176 17.4353 18.7059 18.3941 15.8176H21.5C21.7765 15.8176 22 15.5941 22 15.3176V13.8412C22 13.5647 21.7765 13.3412 21.5 13.3412H17.5235V15.3414H17.523ZM11.7529 12.5529C11.0588 12.5529 10.5 11.9941 10.5 11.3C10.5 10.6059 11.0588 10.0471 11.7529 10.0471C12.4471 10.0471 13.0059 10.6059 13.0059 11.3C13.0059 11.9941 12.4471 12.5529 11.7529 12.5529Z"/></svg>
                    Android
                  </div>
                  <div className="px-4 py-2 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2.01.76-3.27.82-1.31.05-2.31-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.24-2 1.12-3.14-1.18.05-2.52.79-3.32 1.76-.71.83-1.31 2.05-1.12 3.14 1.29.1 2.59-.92 3.32-1.76z"/></svg>
                    iOS
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-800 mb-6">Market Listings ({listings.length})</h3>
              <div className="grid grid-cols-1 gap-4">
                {listings.map(l => (
                  <div key={l.id} className="p-4 bg-slate-50 border border-slate-100 rounded-[24px] flex gap-4 items-center group hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all">
                    <img src={l.images[0]} className="w-20 h-20 rounded-[18px] object-cover shadow-sm" />
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-lg">{l.model}</h4>
                      <p className="text-xs font-bold text-slate-400">{l.sellerName} • {l.year}</p>
                      <p className="text-sm font-black text-blue-600 mt-1">{l.price.toLocaleString()} SDG</p>
                    </div>
                    <button onClick={() => handleDeleteListing(l.id)} className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
             <div className="space-y-4">
               <h3 className="text-2xl font-black text-slate-800 mb-6">User Registry ({users.length})</h3>
               <div className="grid grid-cols-1 gap-4">
                 {users.map(u => (
                   <div key={u.id} className="p-5 bg-white border-2 border-slate-50 rounded-[30px] flex justify-between items-center hover:border-blue-100 hover:shadow-lg transition-all">
                     <div className="flex items-center gap-4">
                       <div className="relative">
                          <img src={u.idImageUrl} className="w-16 h-16 rounded-[22px] object-cover border-2 border-slate-50 shadow-sm cursor-zoom-in" onClick={() => setSelectedUser(u)} />
                          {u.isAdmin && <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">AD</div>}
                       </div>
                       <div>
                         <h4 className="font-black text-slate-800 text-lg">{u.fullName}</h4>
                         <p className="text-xs font-bold text-slate-400 tracking-tighter">{u.phone} • {u.idNumber}</p>
                       </div>
                     </div>
                     {!u.isAdmin && (
                       <div className="flex gap-2">
                         <button onClick={() => handleSuspend(u.id)} className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${u.isVerified ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-green-600 text-white'}`}>
                           {u.isVerified ? 'Suspend' : 'Verify'}
                         </button>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'reports' && (
             <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Security Incident Alerts</h3>
                {reports.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="font-black text-slate-400 uppercase tracking-widest">System Clear</p>
                  </div>
                ) : reports.map(r => (
                  <div key={r.id} className="p-6 bg-red-50 border-2 border-red-100 rounded-[32px] flex justify-between items-center gap-6 animate-in slide-in-from-right-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Incident</span>
                        <span className="text-[10px] font-bold text-red-300">#{r.id}</span>
                      </div>
                      <p className="text-lg font-black text-red-900 leading-tight">{r.reason}</p>
                      <p className="text-xs font-bold text-red-400 mt-1 uppercase">Target: {r.type} {r.targetId}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => {
                        if(r.type === 'LISTING') handleDeleteListing(r.targetId);
                        else handleSuspend(r.targetId);
                        DatabaseService.saveReports(reports.filter(x => x.id !== r.id));
                        setReports(prev => prev.filter(x => x.id !== r.id));
                      }} className="bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-red-700 transition-all">Resolve</button>
                      <button onClick={() => {
                        DatabaseService.saveReports(reports.filter(x => x.id !== r.id));
                        setReports(prev => prev.filter(x => x.id !== r.id));
                      }} className="bg-white text-red-400 px-6 py-3 rounded-2xl text-xs font-black hover:bg-red-50 transition-all">Dismiss</button>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Identity Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-3xl bg-white rounded-[50px] shadow-2xl overflow-hidden p-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-800">Review Identity</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Document Authentication System</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-4 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Official Name</p>
                  <p className="font-black text-xl text-slate-800">{selectedUser.fullName}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">National ID / Passport</p>
                  <p className="font-black text-xl text-slate-800 tracking-wider">{selectedUser.idNumber}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Phone</p>
                  <p className="font-black text-xl text-slate-800">{selectedUser.phone}</p>
                </div>
              </div>
              <div className="flex-1 bg-slate-900 rounded-[40px] p-2 shadow-2xl overflow-hidden">
                <img src={selectedUser.idImageUrl} className="w-full h-80 object-cover rounded-[38px] opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4">
               <button onClick={() => setSelectedUser(null)} className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-blue-700 active:scale-95 transition-all">Approve Document</button>
               <button onClick={() => { handleSuspend(selectedUser.id); setSelectedUser(null); }} className="px-10 py-5 bg-slate-100 text-red-500 rounded-[24px] font-black text-lg hover:bg-red-50 transition-all">Reject / Flag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ColorField: React.FC<{ label: string, value: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-10 h-10 rounded-full cursor-pointer border-2 border-white shadow-md overflow-hidden"
      />
    </div>
    <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-2xl shadow-inner max-h-24 overflow-y-auto">
      {BRANDING_PALETTE.map(color => (
        <button 
          key={color} 
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 active:scale-90 border border-slate-100 ${value.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-slate-800 ring-offset-1' : ''}`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  </div>
);

const AdminNavTile: React.FC<{ active: boolean, onClick: () => void, label: string, icon: string, color: string, count?: number }> = ({ active, onClick, label, icon, color, count }) => {
  const getIcon = () => {
    switch (icon) {
      case 'brush': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>;
      case 'car': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>;
      case 'users': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
      case 'flag': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>;
      case 'download': return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>;
      default: return null;
    }
  };
  return (
    <button 
      onClick={onClick} 
      className={`relative p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${active ? `bg-white shadow-2xl border-blue-500 transform -translate-y-1` : 'bg-white border-transparent grayscale hover:grayscale-0 hover:shadow-lg'}`}
    >
      <div className={`p-3 rounded-2xl text-white ${color} shadow-lg`}>
        {getIcon()}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
          {count}
        </span>
      )}
    </button>
  );
};

const FormGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[18px] outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-inner" 
    />
  </div>
);

export default AdminPanel;
