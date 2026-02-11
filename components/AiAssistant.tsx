
import React from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { Property } from '../types';
import { aiService } from '../services/aiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AiAssistantProps {
  properties: Property[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ properties }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  // Initialize welcome message based on current language
  const [messages, setMessages] = React.useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'ai', 
      text: language === 'el' 
        ? 'Γεια σας! Είμαι ο ψηφιακός Concierge του TOWER 15. Πώς μπορώ να σας βοηθήσω με τη διαμονή σας στη Θεσσαλονίκη;\n\n(I speak English too! Just ask.)'
        : 'Hello! I am the TOWER 15 Concierge. How can I assist you with your stay in Thessaloniki?' 
    }
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // If language changes and chat is still at initial state, update the greeting
  React.useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{
        id: 'welcome',
        role: 'ai',
        text: language === 'el' 
          ? 'Γεια σας! Είμαι ο ψηφιακός Concierge του TOWER 15. Πώς μπορώ να σας βοηθήσω με τη διαμονή σας στη Θεσσαλονίκη;\n\n(I speak English too! Just ask.)'
          : 'Hello! I am the TOWER 15 Concierge. How can I assist you with your stay in Thessaloniki?'
      }]);
    }
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare history for AI service
      const history = messages.slice(1).map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
      
      const responseText = await aiService.askConcierge(properties, userMsg.text, history);
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        text: language === 'el' 
          ? "Υπάρχει πρόβλημα σύνδεσης. Παρακαλώ δοκιμάστε ξανά." 
          : "I'm having trouble connecting to the network. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Localized UI Texts
  const texts = {
    el: {
      label: "Concierge",
      placeholder: "Ρωτήστε για δωμάτια, τιμές ή τοποθεσία...",
      headerSub: "Tower 15 Suites"
    },
    en: {
      label: "Concierge",
      placeholder: "Ask about rooms, prices, or location...",
      headerSub: "Tower 15 Suites"
    }
  };

  const t = texts[language];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] group flex items-center justify-center animate-in zoom-in duration-300"
      >
        <div className="absolute inset-0 bg-stone-900 rounded-full animate-ping opacity-10 group-hover:opacity-20 duration-1000"></div>
        <div className="relative w-14 h-14 bg-stone-900 text-gold-400 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border border-gold-500/30">
          <MessageSquare size={24} className="fill-current" />
        </div>
        <div className="absolute right-full mr-4 bg-white text-stone-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-stone-100">
           {t.label}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-sm md:max-w-md animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[500px]">
        
        {/* Header */}
        <div className="bg-stone-900 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-stone-900">
                <Sparkles size={16} />
             </div>
             <div>
               <h3 className="font-serif italic text-lg leading-none text-gold-400">Concierge</h3>
               <span className="text-[10px] uppercase tracking-widest text-stone-400">{t.headerSub}</span>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors text-stone-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 custom-scrollbar-footer">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-stone-900 text-gold-400'}`}>
                     {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-white text-stone-800 rounded-tr-none' 
                    : 'bg-stone-900 text-stone-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
               </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex justify-start">
               <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-gold-400 flex items-center justify-center shrink-0">
                     <Bot size={14} />
                  </div>
                  <div className="bg-stone-900 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                     <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce delay-100"></div>
                     <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce delay-200"></div>
                  </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100 shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 pr-12 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all text-sm"
              placeholder={t.placeholder}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-stone-900 text-gold-400 rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AiAssistant;
