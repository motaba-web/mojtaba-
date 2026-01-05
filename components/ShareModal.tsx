
import React from 'react';
import { AppLanguage } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  lang: AppLanguage;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url, lang }) => {
  if (!isOpen) return null;

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const platforms = [
    {
      name: 'WhatsApp',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
      color: 'bg-green-500',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968830.png',
      color: 'bg-black',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
      color: 'bg-blue-600',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
      color: 'bg-sky-500',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    alert(lang === 'AR' ? 'تم نسخ الرابط!' : 'Link copied!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sumsar - سمسار',
          text: title,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10"
        style={{ direction: lang === 'AR' ? 'rtl' : 'ltr' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {lang === 'AR' ? 'مشاركة عبر' : 'Share via'}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {platforms.map(platform => (
              <a 
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 group"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center p-3 shadow-sm ${platform.color} group-hover:shadow-md transition-shadow`}>
                  <img src={platform.icon} alt={platform.name} className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <span className="text-xs font-bold text-gray-700">{platform.name}</span>
              </a>
            ))}
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleCopyLink}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
              {lang === 'AR' ? 'نسخ الرابط' : 'Copy Link'}
            </button>

            {navigator.share && (
              <button 
                onClick={handleNativeShare}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z"/></svg>
                {lang === 'AR' ? 'مشاركة النظام' : 'More Options'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
