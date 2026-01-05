
import React, { useState } from 'react';
import { User, AppLanguage, Listing, CarCondition, ListingStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { DatabaseService } from '../services/database';
import { editCarImage } from '../services/gemini';

interface ListingFormProps {
  user: User;
  onComplete: () => void;
  lang: AppLanguage;
  listing?: Listing;
}

const ListingForm: React.FC<ListingFormProps> = ({ user, onComplete, lang, listing }) => {
  const [model, setModel] = useState(listing?.model || '');
  const [year, setYear] = useState(listing?.year || new Date().getFullYear());
  const [mileage, setMileage] = useState(listing?.mileage || 0);
  const [price, setPrice] = useState(listing?.price || 0);
  const [location, setLocation] = useState(listing?.location || '');
  const [description, setDescription] = useState(listing?.description || '');
  const [condition, setCondition] = useState<CarCondition>(listing?.condition || CarCondition.USED);
  const [status, setStatus] = useState<ListingStatus>(listing?.status || ListingStatus.AVAILABLE);
  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  const t = TRANSLATIONS[lang];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    const filesArray = Array.from(fileList);
    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiEdit = async () => {
    if (editingImageIndex === null || !aiPrompt) return;
    setLoading(true);
    const edited = await editCarImage(images[editingImageIndex], aiPrompt);
    if (edited) {
      const newImages = [...images];
      newImages[editingImageIndex] = edited;
      setImages(newImages);
      setEditingImageIndex(null);
      setAiPrompt('');
    }
    setLoading(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      }, (err) => {
        alert("Location access denied.");
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);
    
    const newListings = DatabaseService.getListings();
    const listingData: Listing = {
      id: listing?.id || Math.random().toString(36).substr(2, 9),
      sellerId: user.id,
      sellerName: user.fullName,
      sellerPhone: user.phone,
      sellerProfileImage: user.profileImageUrl,
      model,
      year,
      mileage,
      price,
      location,
      description,
      condition,
      images,
      createdAt: listing?.createdAt || Date.now(),
      status: status,
      reportCount: listing?.reportCount || 0
    };

    if (listing) {
      const index = newListings.findIndex(l => l.id === listing.id);
      newListings[index] = listingData;
    } else {
      newListings.push(listingData);
    }

    DatabaseService.saveListings(newListings);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{listing ? t.edit : t.addListing}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.model}</label>
            <input required value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.year}</label>
            <input required type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.mileage}</label>
            <input required type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.price} (SDG)</label>
            <input required type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{lang === 'AR' ? 'الموقع' : 'Location'}</label>
          <div className="flex gap-2">
            <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder={lang === 'AR' ? 'المدينة، المنطقة' : 'City, Area'} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={handleGetLocation} className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold border border-blue-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.condition}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCondition(CarCondition.NEW)} className={`flex-1 py-3 rounded-lg font-bold border ${condition === CarCondition.NEW ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>New</button>
              <button type="button" onClick={() => setCondition(CarCondition.USED)} className={`flex-1 py-3 rounded-lg font-bold border ${condition === CarCondition.USED ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>Used</button>
            </div>
          </div>
          {listing && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStatus(ListingStatus.AVAILABLE)} className={`flex-1 py-3 rounded-lg font-bold border ${status === ListingStatus.AVAILABLE ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{t.available}</button>
                <button type="button" onClick={() => setStatus(ListingStatus.SOLD)} className={`flex-1 py-3 rounded-lg font-bold border ${status === ListingStatus.SOLD ? 'bg-red-600 text-white border-red-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{t.sold}</button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{t.description}</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Car Photos (Multiple)</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button type="button" onClick={() => setEditingImageIndex(i)} className="p-1 bg-white rounded-full text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="p-1 bg-white rounded-full text-red-600 hover:bg-red-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Add Photo</span>
              <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        {editingImageIndex !== null && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-bold text-blue-700">AI Image Enhancement</h4>
            <p className="text-xs text-blue-600">Ask Gemini to enhance this photo or apply specific edits.</p>
            <input 
              value={aiPrompt} 
              onChange={(e) => setAiPrompt(e.target.value)} 
              placeholder="e.g., 'Make the lighting more dramatic' or 'Show the car in a clean showroom environment'"
              className="w-full p-3 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleAiEdit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs disabled:opacity-50">
                {loading ? 'Processing...' : 'Enhance with AI'}
              </button>
              <button type="button" onClick={() => setEditingImageIndex(null)} className="px-4 py-2 bg-white text-gray-500 border border-gray-200 rounded-lg font-bold text-xs">Cancel</button>
            </div>
          </div>
        )}

        {status === ListingStatus.SOLD && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
             <h4 className="text-sm font-bold text-yellow-700">{t.paymentReceipt} (Required)</h4>
             <p className="text-xs text-yellow-600">Upload a screenshot of the 1% commission payment to Sumsar.</p>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-yellow-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-400">
                <div className="space-y-1 text-center">
                  {paymentReceipt ? (
                    <img src={paymentReceipt} className="mx-auto h-24 w-auto rounded" />
                  ) : (
                    <svg className="mx-auto h-10 w-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  )}
                  <div className="flex text-xs text-gray-600 justify-center">
                    <label className="relative cursor-pointer font-bold text-yellow-700 hover:text-yellow-600">
                      <span>Upload Receipt</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={handleReceiptUpload} />
                    </label>
                  </div>
                </div>
              </div>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
            {t.commissionWarning}
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100 flex gap-4">
          <button type="button" onClick={onComplete} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? 'Saving...' : t.save}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
