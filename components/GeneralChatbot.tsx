
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Maximize2, Minimize2, MessageSquare, RotateCcw } from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';
import { chatWithAllTenders } from '../src/lib/gemini/client';
import Markdown from 'react-markdown';

interface GeneralChatbotProps {
  inline?: boolean;
}

const GeneralChatbot: React.FC<GeneralChatbotProps> = ({ inline = false }) => {
  const [isOpen, setIsOpen] = useState(inline);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { tenders, primaryColor, chatMessages, addChatMessage, resetChat } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const response = await chatWithAllTenders(userMessage, tenders);
      addChatMessage({ role: 'bot', content: response || "Désolé, je n'ai pas pu traiter votre demande." });
    } catch (error) {
      console.error("Chat error:", error);
      addChatMessage({ role: 'bot', content: "Une erreur est survenue lors de la communication avec l'IA." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !inline) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-[100]"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageSquare size={28} />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">1</span>
      </button>
    );
  }

  return (
    <div className={`
      bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300
      ${inline ? 'w-full h-full' : isMaximized ? 'fixed bottom-6 right-6 z-[100] w-[calc(100vw-3rem)] h-[calc(100vh-3rem)]' : 'fixed bottom-6 right-6 z-[100] w-96 h-[500px]'}
    `}>
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Assistant Stratégique</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium">En ligne • {tenders.length} dossiers analysés</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={resetChat}
            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
            title="Réinitialiser la conversation"
          >
            <RotateCcw size={16} />
          </button>
          {!inline && (
            <>
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
              >
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] p-3 rounded-2xl text-sm
              ${msg.role === 'user' 
                ? 'text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'}
            `}
            style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
            >
              <div className="markdown-body">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-xs text-slate-500 font-medium">L'IA analyse vos dossiers...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez une question sur vos AO..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="text-white p-2.5 rounded-xl transition-all disabled:opacity-50 active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
          L'IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
};

export default GeneralChatbot;
