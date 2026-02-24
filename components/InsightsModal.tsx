
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, TrendingUp, Target, Users, AlertCircle, RotateCcw } from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose }) => {
  const { tenders, companyProfile, primaryColor } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !insights && !loading) {
      generateInsights();
    }
  }, [isOpen]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Tu es un consultant stratégique expert en marchés publics BTP. 
        Analyse les données suivantes de l'entreprise et propose 3 à 4 "Insights Stratégiques" concrets pour améliorer leur taux de succès ou leur pipeline.
        
        PROFIL ENTREPRISE:
        - Nom: ${companyProfile?.name}
        - Certifications: ${companyProfile?.certifications.join(', ')}
        - Ressources: ${companyProfile?.resources}
        
        PIPELINE ACTUEL (Appels d'Offres):
        ${tenders.map(t => `- ${t.name} (${t.status}, ${t.estimatedValue}€, ${t.location})`).join('\n')}
        
        Format de réponse: Markdown avec des titres courts et percutants. 
        Sois très spécifique au secteur du BTP (groupements, variantes techniques, optimisation de mémoire technique, etc.).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsights(response.text || "Aucun insight généré.");
    } catch (e) {
      console.error(e);
      setError("Impossible de générer les insights pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInsights(null);
    generateInsights();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Insights Stratégiques IA</h2>
              <p className="text-xs text-slate-500">Analyse personnalisée de votre performance commerciale</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset} 
              disabled={loading}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 disabled:opacity-50"
              title="Régénérer les insights"
            >
              <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={48} style={{ color: primaryColor }} />
              <p className="text-slate-500 font-medium animate-pulse">Analyse de votre pipeline en cours...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3">
              <AlertCircle size={24} />
              <p className="font-medium">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <TrendingUp className="text-blue-600 mb-2" size={20} />
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Potentiel</p>
                  <p className="text-lg font-black text-blue-900">Optimisation</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <Target className="text-emerald-600 mb-2" size={20} />
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ciblage</p>
                  <p className="text-lg font-black text-emerald-900">Précision</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <Users className="text-amber-600 mb-2" size={20} />
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Partenariats</p>
                  <p className="text-lg font-black text-amber-900">Synergie</p>
                </div>
              </div>

              <div className="markdown-body prose prose-slate max-w-none">
                <Markdown>{insights || ""}</Markdown>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsModal;
