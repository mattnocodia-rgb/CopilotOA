
import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Loader2, FilePlus, Plus, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { TenderOffer, TenderFile } from '../src/types/models';
import { GoogleGenAI, Type } from "@google/genai";
import { uploadTenderFile, saveTenderToDb } from '../src/lib/supabase/services';
import { useAppStore } from '../src/lib/store/useAppStore';

interface NewAOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ao: TenderOffer) => void;
}

const NewAOModal: React.FC<NewAOModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { tenders, user, companyProfile, primaryColor } = useAppStore();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isLimitReached = user?.plan === 'FREE' && tenders.length >= 1;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [dceText, setDceText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    moa: '',
    deadline: '',
    location: '',
    estimatedValue: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<TenderFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    setIsAnalyzing(true);
    setUploadProgress(10);
    setError(null);
    
    const newTenderFiles: TenderFile[] = [];
    let aggregatedText = "";
    const tempTenderId = Math.random().toString(36).substr(2, 9);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Real upload to Supabase
        let supabaseFileData = null;
        try {
          supabaseFileData = await uploadTenderFile(tempTenderId, file);
        } catch (uploadErr) {
          console.error("Supabase upload failed, falling back to local simulation", uploadErr);
        }

        const tenderFile: TenderFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() as any || 'PDF',
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadedAt: new Date().toISOString(),
          storagePath: supabaseFileData?.path,
          publicUrl: supabaseFileData?.url
        };
        newTenderFiles.push(tenderFile);

        // Simulation de lecture de texte (FileReader)
        // Note: Pour un vrai PDF, on utiliserait pdf.js ici.
        if (file.type === "text/plain" || file.name.endsWith('.txt')) {
          const text = await file.text();
          aggregatedText += `\n--- FICHIER: ${file.name} ---\n${text}`;
        } else {
          // Simulation d'extraction pour les PDF/DOCX (pour la démo)
          aggregatedText += `\n[Contenu extrait du document ${file.name}: Analyse des lots de gros oeuvre et menuiserie...]`;
        }
        
        setUploadProgress(10 + ((i + 1) / files.length) * 40);
      }

      setUploadedFiles(prev => [...prev, ...newTenderFiles]);
      setDceText(prev => prev + aggregatedText);
      
      // Simulation du CHUNKING (découpage pour l'IA)
      console.log("Chunking du texte en cours... Taille totale:", aggregatedText.length);
      setUploadProgress(70);
      
      if (aggregatedText.length > 50) {
        await handleQuickAnalyze(aggregatedText);
      } else {
        setUploadProgress(100);
        setTimeout(() => {
          setIsAnalyzing(false);
          setUploadProgress(0);
        }, 500);
      }
    } catch (err) {
      setError("Erreur lors de la lecture des fichiers.");
      setIsAnalyzing(false);
    }
  };

  const handleQuickAnalyze = async (textToAnalyze: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // On envoie le texte (éventuellement tronqué si trop gros, ou via un système de vecteurs en prod)
      const chunk = textToAnalyze.substring(0, 15000); 

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tu es un expert BTP. Analyse ce contenu de DCE (ou liste de fichiers) et extrais les métadonnées de l'appel d'offres.
        CONTENU: ${chunk}
        Renvoie un JSON valide.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              moa: { type: Type.STRING },
              deadline: { type: Type.STRING, description: "YYYY-MM-DD" },
              location: { type: Type.STRING },
              estimatedValue: { type: Type.NUMBER, description: "Montant estimé en euros" },
            },
            required: ["name", "moa", "deadline", "location"]
          }
        }
      });
      
      const extracted = JSON.parse(response.text || "{}");
      setFormData({
        name: extracted.name || formData.name,
        moa: extracted.moa || formData.moa,
        deadline: extracted.deadline || formData.deadline,
        location: extracted.location || formData.location,
        estimatedValue: extracted.estimatedValue?.toString() || formData.estimatedValue,
      });
      setUploadProgress(100);
      setTimeout(() => {
        setStep(1);
        setIsAnalyzing(false);
        setUploadProgress(0);
      }, 800);
    } catch (e) {
      console.error("Analysis failed", e);
      setError("L'IA n'a pas pu extraire les données. Veuillez compléter manuellement.");
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    const newAO: TenderOffer = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: companyProfile?.id || 'unknown',
      ...formData,
      estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0,
      status: 'Analyse',
      description: dceText.substring(0, 500) || 'DCE importé via fichiers.',
      createdAt: new Date().toISOString(),
      files: uploadedFiles,
    };

    try {
      await saveTenderToDb(newAO);
    } catch (err) {
      console.warn("Could not save to Supabase DB, keeping in local state only", err);
    }

    onAdd(newAO);
    onClose();
    // Reset state
    setStep(1);
    setFormData({ name: '', moa: '', deadline: '', location: '', estimatedValue: '' });
    setUploadedFiles([]);
    setDceText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Nouvel Appel d'Offres</h2>
            <p className="text-[10px] sm:text-xs text-slate-500">Importez votre DCE pour une analyse automatique</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-8">
          {isLimitReached ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <Sparkles className="text-amber-600" size={40} />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-xl font-black text-slate-900 mb-2">Limite du plan gratuit atteinte</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sur le plan gratuit, vous ne pouvez gérer qu'un seul appel d'offres à la fois. 
                  Passez au plan <strong>Premium</strong> pour débloquer des dossiers illimités et des analyses IA avancées.
                </p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => {
                    onClose();
                    // Navigate to settings billing section
                    window.location.hash = '#/reglages';
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Passer au plan Premium
                </button>
                <button 
                  onClick={onClose}
                  className="block w-full text-slate-400 text-xs font-bold mt-4 hover:text-slate-600 transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
             <div className="flex items-center gap-2">
               <div 
                 className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${step === 1 ? 'text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                 style={step === 1 ? { backgroundColor: primaryColor } : {}}
               >1</div>
               <span className={`text-xs sm:text-sm font-semibold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Synthèse</span>
             </div>
             <div className="h-px bg-slate-200 flex-1"></div>
             <div className="flex items-center gap-2">
               <div 
                 className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${step === 2 ? 'text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                 style={step === 2 ? { backgroundColor: primaryColor } : {}}
               >2</div>
               <span className={`text-xs sm:text-sm font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Documents</span>
             </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nom du Projet</label>
                  <input 
                    type="text" 
                    placeholder="Nom extrait automatiquement..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Client (MOA)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Mairie de Paris"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                    value={formData.moa}
                    onChange={e => setFormData({...formData, moa: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Échéance</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Ville / Code Postal</label>
                  <input 
                    type="text" 
                    placeholder="Lieu de l'opération"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Montant Estimé (€)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 450000"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                    value={formData.estimatedValue}
                    onChange={e => setFormData({...formData, estimatedValue: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full sm:flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Gérer les documents
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.name}
                  className="w-full sm:flex-[2] disabled:bg-slate-200 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                  style={formData.name ? { backgroundColor: primaryColor } : {}}
                >
                  Confirmer et Analyser
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              <div 
                className={`bg-slate-50 border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer ${isAnalyzing ? 'bg-slate-100' : 'border-slate-200 hover:bg-slate-100'}`}
                style={isAnalyzing ? { borderColor: primaryColor } : {}}
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              >
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <Loader2 className="animate-spin mx-auto" size={32} style={{ color: primaryColor }} />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Lecture et Indexation...</p>
                      <p className="text-[10px] text-slate-500 mt-1">Extraction du texte et chunking pour l'IA</p>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-[200px] mx-auto">
                      <div 
                        className="h-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%`, backgroundColor: primaryColor }}
                      ></div>
                    </div>
                  </div>
                ) : uploadedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-center flex-wrap gap-2 max-h-32 overflow-y-auto p-2">
                      {uploadedFiles.map(f => (
                        <div key={f.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-medium text-slate-700 shadow-sm animate-in zoom-in">
                          <FileText size={12} style={{ color: primaryColor }} />
                          {f.name}
                        </div>
                      ))}
                    </div>
                    <button className="font-bold text-xs flex items-center gap-1 mx-auto" style={{ color: primaryColor }}>
                      <Plus size={14} /> Ajouter d'autres fichiers
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <Upload style={{ color: primaryColor }} size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Déposez votre DCE ici</h3>
                    <p className="text-slate-400 text-[10px] sm:text-xs px-4 sm:px-10">Sélectionnez les PDF, Excel ou ZIP du marché. L'IA scanne le règlement et le CCTP en temps réel.</p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Note rapide / Contexte additionnel</label>
                <textarea 
                  rows={2}
                  placeholder="Informations complémentaires, lots spécifiques..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                  value={dceText}
                  onChange={e => setDceText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm"
                >
                  Retour
                </button>
                <button 
                  onClick={() => handleQuickAnalyze(dceText)}
                  disabled={isAnalyzing || !dceText}
                  className="w-full sm:flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 text-sm"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Relancer l'Analyse IA
                </button>
              </div>
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
};

export default NewAOModal;
