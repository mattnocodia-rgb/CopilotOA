
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, primaryColor } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setUser({
        id: 'u-1',
        email: email || 'contact@btp-solutions.fr',
        name: 'Thomas Martin',
        role: 'OWNER',
        plan: 'FREE'
      });
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600 text-white shadow-xl mb-4" style={{ backgroundColor: primaryColor }}>
            <ClipboardCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">COPILOTE AO</h1>
          <p className="text-slate-500 mt-2 font-medium">L'intelligence artificielle au service de vos marchés publics.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Connexion</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Se souvenir de moi
                </label>
                <a href="#" className="text-blue-600 hover:underline">Mot de passe oublié ?</a>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundColor: primaryColor }}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-white px-4 text-slate-400">Ou continuer avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-[#f25022]"></div>
                  <div className="w-1.5 h-1.5 bg-[#7fbb00]"></div>
                  <div className="w-1.5 h-1.5 bg-[#00a4ef]"></div>
                  <div className="w-1.5 h-1.5 bg-[#ffb900]"></div>
                </div>
                Microsoft
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Pas encore de compte ? <a href="#" className="text-blue-600 font-bold hover:underline">Créer un profil</a>
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          &copy; 2025 Copilote AO. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
