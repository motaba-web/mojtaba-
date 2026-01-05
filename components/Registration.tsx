
import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { DatabaseService } from '../services/database';

interface RegistrationProps {
  onVerified: (user: User) => void;
  lang: AppLanguage;
  onLangToggle: () => void;
}

type AuthMode = 'signup' | 'login';

const Registration: React.FC<RegistrationProps> = ({ onVerified, lang, onLangToggle }) => {
  const [mode, setMode] = useState<AuthMode>('signup'); 
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Full Name
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [otpOrPassword, setOtpOrPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  // Load remembered credentials on mount
  useEffect(() => {
    const savedId = localStorage.getItem('sumsar_remembered_id');
    const savedPw = localStorage.getItem('sumsar_remembered_pw');
    if (savedId) {
      setLoginIdentifier(savedId);
      setRememberMe(true);
      if (savedPw) setOtpOrPassword(savedPw);
    }
  }, []);

  // Strictly enforce Arabic or English letters only for names (No symbols, no numbers)
  const handleNameChange = (val: string) => {
    const sanitized = val.replace(/[^A-Za-z\u0600-\u06FF\s]/g, '');
    setFullName(sanitized);
  };

  // UPDATED: Allow only letters (Arabic/English) and numbers for ID (9 or 11 characters)
  const handleIdChange = (val: string) => {
    const sanitized = val.replace(/[^A-Za-z0-9\u0600-\u06FF]/g, '');
    setIdNumber(sanitized);
  };

  // Enforce Phone format: allow +, digits, and space.
  const handlePhoneChange = (val: string) => {
    const sanitized = val.replace(/(?!^\+)[^\d\s]/g, '');
    setPhone(sanitized);
  };

  // Strictly sanitize address: Allow letters, numbers, and spaces. Block all special code symbols.
  const handleAddressChange = (val: string) => {
    const sanitized = val.replace(/[^A-Za-z0-9\u0600-\u06FF\s]/g, '');
    setAddress(sanitized);
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIdImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    setError('');
    
    // Security Check: Block common script/code patterns manually
    const codePatterns = [/<script/i, /javascript:/i, /SELECT /i, /UPDATE /i, /DELETE /i, /DROP /i, /\{/, /\}/, /\[/, /\]/, /\//, /\\/, /\*/];
    const inputsToCheck = [fullName, email, loginIdentifier, phone, address, idNumber];
    
    if (inputsToCheck.some(input => codePatterns.some(pattern => pattern.test(input)))) {
      setError(lang === AppLanguage.AR ? 'تم اكتشاف رموز غير مسموح بها!' : 'Unauthorized symbols or code detected!');
      return;
    }

    if (mode === 'login') {
      const identifier = loginIdentifier.toLowerCase().trim();
      
      if (!identifier) {
        setError(lang === AppLanguage.AR ? 'يرجى إدخال البريد الإلكتروني أو الاسم' : 'Please enter Email or Username');
        return;
      }

      // Special handling for Admin login integrated into standard login tab
      if (identifier === 'admin' || identifier === 'mogtaba') {
        setStep(2);
        return;
      }
      
      const users = DatabaseService.getUsers();
      const found = users.find(u => 
        u.email?.toLowerCase() === identifier || 
        u.fullName.toLowerCase() === identifier
      );

      if (!found) {
        setError(lang === AppLanguage.AR ? 'الحساب غير موجود، يرجى إنشاء حساب أولاً' : 'Account not found. Please sign up first.');
        return;
      }

      setTargetUser(found);
      setStep(2);
      return;
    }

    // Signup Validation
    if (!fullName.trim()) {
      setError(lang === AppLanguage.AR ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError(lang === AppLanguage.AR ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
      return;
    }
    
    const phoneTrimmed = phone.trim();
    const isLocal = /^\d{10}$/.test(phoneTrimmed);
    const isIntl = /^\+\d{3}\s\d{9}$/.test(phoneTrimmed);

    if (!isLocal && !isIntl) {
      setError(lang === AppLanguage.AR 
        ? 'تنسيق الهاتف غير صحيح. استخدم 10 أرقام (09...) أو الدولي (+249 9...)' 
        : 'Invalid phone format. Use 10 digits (09...) or Intl (+249 912345678)');
      return;
    }

    // UPDATED: Accept exactly 9 or 11 alphanumeric characters
    if (idNumber.length !== 9 && idNumber.length !== 11) {
      setError(lang === AppLanguage.AR 
        ? 'رقم الهوية يجب أن يكون 9 أو 11 حرفاً/رقماً' 
        : 'ID number must be exactly 9 or 11 characters/digits');
      return;
    }

    if (!idImage) {
      setError(t.idRequired);
      return;
    }
    
    setLoading(true);
    // Simulate sending OTP to email
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleVerify = () => {
    setError('');
    setLoading(true);
    
    // Save credentials if "Remember Me" is checked
    if (mode === 'login' && rememberMe) {
      localStorage.setItem('sumsar_remembered_id', loginIdentifier);
      localStorage.setItem('sumsar_remembered_pw', otpOrPassword);
    } else if (mode === 'login' && !rememberMe) {
      localStorage.removeItem('sumsar_remembered_id');
      localStorage.removeItem('sumsar_remembered_pw');
    }

    setTimeout(() => {
      if (mode === 'login') {
        const identifier = loginIdentifier.toLowerCase().trim();

        // Admin verification logic
        if (identifier === 'admin' || identifier === 'mogtaba') {
          if (otpOrPassword === '0994') {
            const adminUser: User = {
              id: 'admin_root',
              fullName: "MOGTABA YOSIF ABDALLA ALAWD",
              phone: "0994",
              email: "admin@sumsar.sd",
              address: "Khartoum, Sudan",
              idNumber: "ADMIN-001",
              idImageUrl: "https://picsum.photos/200/200?random=admin",
              profileImageUrl: "https://picsum.photos/200/200?random=admin",
              isVerified: true,
              isAdmin: true,
              registeredAt: Date.now()
            };
            onVerified(adminUser);
          } else {
            setError(lang === AppLanguage.AR ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
            setLoading(false);
          }
          return;
        }

        // Normal user OTP verification
        if (otpOrPassword === '123456' && targetUser) { // Mock OTP for demo
          onVerified(targetUser);
        } else {
          setError(lang === AppLanguage.AR ? 'رمز التحقق غير صحيح' : 'Incorrect OTP');
        }
        setLoading(false);
        return;
      }

      // Signup Completion (First time only)
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        fullName,
        email,
        phone,
        address,
        idNumber,
        idImageUrl: idImage!,
        profileImageUrl: idImage!, // Default profile photo to ID photo
        isVerified: true,
        isAdmin: false,
        registeredAt: Date.now()
      };
      
      const users = DatabaseService.getUsers();
      users.push(newUser);
      DatabaseService.saveUsers(users);
      onVerified(newUser);
      setLoading(false);
    }, 600);
  };

  const isLoginAdmin = mode === 'login' && (loginIdentifier.toLowerCase().trim() === 'admin' || loginIdentifier.toLowerCase().trim() === 'mogtaba');

  return (
    <div className="max-w-md mx-auto p-6 pt-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-blue-600">Sumsar – سمسار</h1>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sudanese Car Marketplace</span>
        </div>
        <button onClick={onLangToggle} className="text-gray-500 font-bold border rounded-full px-4 py-1 hover:bg-gray-50 transition-colors">
          {lang === AppLanguage.AR ? 'English' : 'عربي'}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
        <div className="flex mb-8 bg-gray-50 p-1 rounded-2xl">
          <button 
            onClick={() => { setMode('signup'); setStep(1); setOtpOrPassword(''); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            {t.signup}
          </button>
          <button 
            onClick={() => { setMode('login'); setStep(1); setOtpOrPassword(''); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            {t.login}
          </button>
        </div>

        <h2 className="text-2xl font-black mb-8 text-center text-gray-800">
          {mode === 'login' ? t.login : t.signup}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-5">
            {mode === 'login' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{lang === AppLanguage.AR ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}</label>
                  <input 
                    value={loginIdentifier} 
                    onChange={(e) => setLoginIdentifier(e.target.value)} 
                    type="text" 
                    placeholder={lang === AppLanguage.AR ? 'أدخل إيميلك أو اسمك الكامل' : 'Email or Full Name'}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-bold" 
                  />
                </div>
                
                <div className="flex items-center gap-2 px-1">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="text-xs font-bold text-gray-500 cursor-pointer uppercase tracking-widest">
                    {t.rememberMe}
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{t.fullName}</label>
                  <input value={fullName} onChange={(e) => handleNameChange(e.target.value)} type="text" placeholder="Full Name (Letters only)" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{t.email}</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@example.com" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{t.phone}</label>
                  <input 
                    value={phone} 
                    onChange={(e) => handlePhoneChange(e.target.value)} 
                    type="tel" 
                    maxLength={14}
                    placeholder={lang === AppLanguage.AR ? '0912345678 أو +249 912345678' : '0912345678 or +249 912345678'} 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{t.address}</label>
                  <input value={address} onChange={(e) => handleAddressChange(e.target.value)} type="text" placeholder="Khartoum, Sudan (No symbols)" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{t.idNumber}</label>
                  <input 
                    value={idNumber} 
                    onChange={(e) => handleIdChange(e.target.value)} 
                    type="text" 
                    maxLength={11}
                    placeholder={lang === AppLanguage.AR ? 'رقم الهوية (9 أو 11 حرفاً/رقماً)' : 'ID Number (9 or 11 letters/numbers only)'} 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-bold" 
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2">
                  <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                    {lang === AppLanguage.AR 
                      ? 'يتم طلب الهوية فقط عند إنشاء الحساب لأول مرة لضمان الأمان.' 
                      : 'Identity verification is only required during your initial registration for security.'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">{t.uploadId}</label>
                  <div className="relative group bg-gray-50 border-2 border-gray-200 border-dashed rounded-[32px] p-6 text-center hover:border-blue-400 transition-all cursor-default">
                    {idImage ? (
                      <div className="space-y-4">
                        <img src={idImage} className="mx-auto h-40 w-full object-cover rounded-2xl shadow-md border-4 border-white" />
                        <button onClick={() => setIdImage(null)} className="text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-700">
                          {lang === AppLanguage.AR ? 'إزالة الصورة' : 'Remove Image'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="flex justify-center gap-4">
                          <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{lang === AppLanguage.AR ? 'كاميرا' : 'Camera'}</span>
                          </button>
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{lang === AppLanguage.AR ? 'ملف' : 'File'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                    <input ref={cameraInputRef} type="file" className="sr-only" accept="image/*" capture="environment" onChange={handleIdUpload} />
                    <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleIdUpload} />
                  </div>
                </div>
              </>
            )}

            <button disabled={loading} onClick={handleNextStep} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4">
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-sm text-gray-500 font-bold">
              {isLoginAdmin 
                ? (lang === AppLanguage.AR ? 'أدخل كلمة مرور المسؤول' : 'Enter Admin Password') 
                : `${lang === AppLanguage.AR ? 'أدخل الرمز المرسل إلى بريدك' : 'Enter OTP sent to your email'} (${mode === 'login' ? targetUser?.email : email})`}
            </p>
            <input 
              value={otpOrPassword} 
              onChange={(e) => setOtpOrPassword(e.target.value)} 
              type={isLoginAdmin ? "password" : "text"} 
              maxLength={isLoginAdmin ? 20 : 6} 
              placeholder={isLoginAdmin ? "••••" : "000000"}
              className={`w-full p-5 text-center text-3xl font-black bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all ${!isLoginAdmin ? 'tracking-[0.8em]' : ''}`}
            />
            
            {mode === 'login' && (
              <div className="flex items-center gap-2 justify-center">
                <input 
                  type="checkbox" 
                  id="rememberMeStep2" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="rememberMeStep2" className="text-xs font-bold text-gray-500 cursor-pointer uppercase tracking-widest">
                  {t.rememberMe}
                </label>
              </div>
            )}

            <button disabled={loading} onClick={handleVerify} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-xl active:scale-[0.98]">
              {loading ? 'Verifying...' : (isLoginAdmin ? (lang === AppLanguage.AR ? 'دخول' : 'Sign In') : t.verify)}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-sm text-gray-400 font-bold hover:text-blue-600">
              {lang === AppLanguage.AR ? 'العودة' : 'Go Back'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 text-center text-xs text-gray-400 font-bold px-8 leading-relaxed">
        <p className="text-orange-400 mb-2 uppercase tracking-widest">{t.brokerWarning}</p>
        <p>© 2024 SUMSAR SUDAN • BUILT BY MOGTABA ALAWD</p>
      </div>
    </div>
  );
};

export default Registration;
