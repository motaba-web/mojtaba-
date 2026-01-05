
import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../constants';
import { chatWithAssistant } from '../services/gemini';

const ChatBot: React.FC<{ lang: AppLanguage }> = ({ lang }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const botRes = await chatWithAssistant(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: botRes }]);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </div>
        <div>
          <h2 className="font-bold">{TRANSLATIONS[lang].chatWithAI}</h2>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">AI Powered</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Ask me about car prices, registration, or how Sumsar works!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl animate-pulse text-gray-400">Thinking...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question..."
          className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSend} disabled={loading} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
