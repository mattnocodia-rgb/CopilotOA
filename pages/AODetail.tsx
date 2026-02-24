
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  FileSearch, 
  Files, 
  PenTool, 
  Send,
  Loader2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  Bot,
  Trash2,
  Plus,
  FileUp,
  Settings,
  Sparkles,
  Euro
} from 'lucide-react';
import { Synthesis, ChatMessage, TenderFile, TenderOffer } from '../src/types/models';
import { useAppStore } from '../src/lib/store/useAppStore';
import { generateAOSynthesis, chatWithDCE, generateMemoryTechnical } from '../src/lib/gemini/client';
import { uploadTenderFile } from '../src/lib/supabase/services';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import EditAOModal from '../components/EditAOModal';

const AODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenders, updateTender, companyProfile, primaryColor } = useAppStore();
  const ao = tenders.find(o => o.id === id);
  
  const [activeTab, setActiveTab] = useState<'synthèse' | 'chat' | 'documents' | 'mémoire'>('synthèse');
  const [loadingSynthesis, setLoadingSynthesis] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statuses: { label: string, value: any }[] = [
    { label: 'Analyse', value: 'Analyse' },
    { label: 'Rédaction', value: 'Rédaction' },
    { label: 'Déposé', value: 'Déposé' },
    { label: 'Gagné', value: 'Gagné' },
    { label: 'Perdu', value: 'Perdu' },
    { label: 'Abandonné', value: 'Abandonné' },
  ];

  const handleStatusChange = (newStatus: any) => {
    if (!ao) return;
    updateTender(ao.id, { status: newStatus });
    setIsChangingStatus(false);
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [memoryDraft, setMemoryDraft] = useState<string | null>(null);
  const [generatingMemory, setGeneratingMemory] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const synthesis = ao?.synthesis;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerateSynthesis = async () => {
    if (!ao) return;
    setLoadingSynthesis(true);
    try {
      // For the demo, we use a fixed context if real files aren't parsed
      const context = "Appel d'offres public pour la rénovation de l'école Jules Ferry. Travaux de menuiserie, peinture et électricité. Budget estimé 450k€. Délais 4 mois.";
      const res = await generateAOSynthesis(ao.name, context);
      updateTender(ao.id, { synthesis: res });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSynthesis(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !ao) return;
    const userMsg: ChatMessage = { 
      id: Date.now().toString(),
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSendingMessage(true);
    
    try {
      const context = synthesis ? JSON.stringify(synthesis) : "AO " + ao.name;
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithDCE(input, history, context);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: response || "Désolé, je n'ai pas pu générer de réponse.", 
        timestamp: new Date().toISOString() 
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleGenerateMemory = async () => {
    if (!ao) return;
    setGeneratingMemory(true);
    try {
      const selectedTemplates = companyProfile?.templates.filter(t => selectedTemplateIds.includes(t.id));
      const draft = await generateMemoryTechnical(ao, companyProfile, selectedTemplates);
      setMemoryDraft(draft || "");
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingMemory(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!memoryDraft || !ao) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `Mémoire Technique : ${ao.name}`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Client : ${ao.moa}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Date : ${new Date().toLocaleDateString('fr-FR')}`,
          }),
          new Paragraph({ text: "" }), // Spacer
          ...memoryDraft.split('\n').map(line => {
            if (line.startsWith('# ')) {
              return new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1 });
            } else if (line.startsWith('## ')) {
              return new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2 });
            } else if (line.startsWith('### ')) {
              return new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3 });
            }
            return new Paragraph({
              children: [new TextRun(line)],
            });
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Memoire_Technique_${ao.name.replace(/\s+/g, '_')}.docx`);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!ao) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      const updatedFiles = ao.files.filter(f => f.id !== fileId);
      updateTender(ao.id, { files: updatedFiles });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !ao) return;

    setIsUploading(true);
    try {
      const newFiles: TenderFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Real upload to Supabase if configured
        let supabaseFileData = null;
        try {
          supabaseFileData = await uploadTenderFile(ao.id, file);
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
        newFiles.push(tenderFile);
      }
      
      updateTender(ao.id, { files: [...ao.files, ...newFiles] });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erreur lors de l'upload des fichiers.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateAO = (updatedAO: TenderOffer) => {
    updateTender(updatedAO.id, updatedAO);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  if (!ao) return <div className="p-8">Appel d'offre introuvable.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        Retour au dashboard
      </button>

      {/* Header Info */}
      <div className="bg-white p-4 lg:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-start">
          <div 
            className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl text-white flex items-center justify-center font-bold text-xl lg:text-2xl shadow-lg shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {ao.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900 leading-tight">{ao.name}</h1>
            <div className="flex flex-wrap gap-3 lg:gap-4 mt-2 text-slate-500 text-xs lg:text-sm items-center">
              <span className="flex items-center gap-1.5"><Calendar size={16} className="text-blue-500" /> Remise le {ao.deadline}</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 underline decoration-slate-300 decoration-2 underline-offset-4 cursor-help">{ao.moa}</span>
              <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                <Euro size={14} className="text-emerald-600" />
                {formatCurrency(ao.estimatedValue || 0)}
              </span>
              
              <div className="relative">
                <button 
                  onClick={() => setIsChangingStatus(!isChangingStatus)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                    ao.status === 'Gagné' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    ao.status === 'Perdu' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {ao.status}
                  <Plus size={12} className={`transition-transform ${isChangingStatus ? 'rotate-45' : ''}`} />
                </button>
                
                {isChangingStatus && (
                  <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {statuses.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => handleStatusChange(s.value)}
                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${ao.status === s.value ? 'text-blue-600' : 'text-slate-600'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 lg:flex-none text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Settings size={18} />
            Modifier
          </button>
        </div>
      </div>

      <EditAOModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ao={ao}
        onUpdate={handleUpdateAO}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full overflow-x-auto no-scrollbar">
        <TabButton icon={<FileSearch size={18} />} label="Synthèse" active={activeTab === 'synthèse'} onClick={() => setActiveTab('synthèse')} />
        <TabButton icon={<MessageSquare size={18} />} label="Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <TabButton icon={<Files size={18} />} label="Documents" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
        <TabButton icon={<PenTool size={18} />} label="Mémoire Technique" active={activeTab === 'mémoire'} onClick={() => setActiveTab('mémoire')} />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'synthèse' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingSynthesis ? (
              <div className="bg-white p-20 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-500 font-medium">L'IA analyse le DCE de 450 pages...</p>
              </div>
            ) : synthesis ? (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button 
                    onClick={handleGenerateSynthesis}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Sparkles size={16} />
                    Mettre à jour la synthèse
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                      <Bot className="text-blue-600" size={20} />
                      Résumé du projet
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {synthesis.summary}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Critères de Jugement</h3>
                    <div className="space-y-2">
                      {synthesis.criteria.map((c, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-sm font-medium text-slate-700">{c.label}</span>
                          <span className="text-sm font-bold text-blue-600">{c.weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <AlertTriangle className="text-amber-500" size={20} />
                      Points de Vigilance
                    </h3>
                    <ul className="space-y-3">
                      {synthesis.risks.map((r, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <CheckCircle2 size={18} className="text-slate-300 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Calendar className="text-blue-500" size={20} />
                      Dates Clés
                    </h3>
                    <div className="space-y-3">
                      {synthesis.keyDates.map((d, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-slate-700">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
              <div className="bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400">Cliquez pour lancer l'analyse intelligente du dossier.</p>
                <button 
                  onClick={handleGenerateSynthesis}
                  className="mt-4 px-6 py-2 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles size={18} />
                  Créer synthèse
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[500px] lg:h-[600px] overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Copilote IA</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Connecté au DCE
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 italic italic">Posez une question sur le CCTP, CCAP ou BPU</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale space-y-4">
                   <MessageSquare size={48} />
                   <p className="max-w-xs text-sm">Interrogez le dossier : "Quels sont les pénalités de retard ?" ou "Détaille les prestations du lot 3."</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-2xl flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Votre question sur le DCE..." 
                  className="flex-1 bg-transparent outline-none px-2 text-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !input.trim()}
                  className="hover:opacity-90 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
                  style={!sendingMessage && input.trim() ? { backgroundColor: primaryColor } : {}}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Documents du DCE</h3>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                  Ajouter des documents
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Document</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Taille</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ao.files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        file.type === 'PDF' ? 'bg-red-50 text-red-600' :
                        file.type === 'XLSX' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        <Files size={18} />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{file.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200">{file.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => file.publicUrl && window.open(file.publicUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {activeTab === 'mémoire' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {memoryDraft ? (
              <div className="bg-white p-4 lg:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900">Projet de Mémoire Technique</h3>
                  <button 
                    onClick={handleDownloadWord}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                  >
                    <Download size={18} /> Télécharger .DOCX
                  </button>
                </div>
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                  {memoryDraft}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <PenTool size={40} />
                </div>
                <div className="max-w-md">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Générez un brouillon complet</h3>
                   <p className="text-slate-500 text-sm mb-6">Copilote utilise vos références passées, vos moyens actuels et les exigences spécifiques du DCE pour rédiger une première version de votre mémoire technique.</p>
                   
                   <div className="text-left space-y-3 mb-6">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sélectionnez vos modèles de base :</label>
                     <div className="grid grid-cols-1 gap-2">
                       {companyProfile?.templates.map(t => (
                         <button 
                           key={t.id}
                           onClick={() => setSelectedTemplateIds(prev => 
                             prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                           )}
                           className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                             selectedTemplateIds.includes(t.id) 
                               ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' 
                               : 'border-slate-200 hover:border-slate-300'
                           }`}
                         >
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                             selectedTemplateIds.includes(t.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                           }`}>
                             {selectedTemplateIds.includes(t.id) && <CheckCircle2 size={12} className="text-white" />}
                           </div>
                           <span className="text-sm font-medium text-slate-700">{t.name}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                </div>
                <button 
                  onClick={handleGenerateMemory}
                  disabled={generatingMemory}
                  className="disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
                  style={!generatingMemory ? { backgroundColor: primaryColor } : {}}
                >
                  {generatingMemory ? <Loader2 className="animate-spin" size={20} /> : <PenTool size={20} />}
                  Rédiger avec l'IA
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => {
  const { primaryColor } = useAppStore();
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap
        ${active ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}
      `}
      style={active ? { color: primaryColor } : {}}
    >
      {icon}
      {label}
    </button>
  );
};

export default AODetail;
