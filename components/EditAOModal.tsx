
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { TenderOffer } from '../src/types/models';
import { useAppStore } from '../src/lib/store/useAppStore';

interface EditAOModalProps {
  isOpen: boolean;
  onClose: () => void;
  ao: TenderOffer;
  onUpdate: (ao: TenderOffer) => void;
}

const EditAOModal: React.FC<EditAOModalProps> = ({ isOpen, onClose, ao, onUpdate }) => {
  const { primaryColor } = useAppStore();
  const [formData, setFormData] = useState({
    name: ao.name,
    moa: ao.moa,
    deadline: ao.deadline,
    location: ao.location,
    estimatedValue: ao.estimatedValue?.toString() || '',
    description: ao.description || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: ao.name,
        moa: ao.moa,
        deadline: ao.deadline,
        location: ao.location,
        estimatedValue: ao.estimatedValue?.toString() || '',
        description: ao.description || '',
      });
    }
  }, [isOpen, ao]);

  const handleSubmit = () => {
    onUpdate({
      ...ao,
      ...formData,
      estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Modifier l'Appel d'Offres</h2>
            <p className="text-[10px] sm:text-xs text-slate-500">Mettez à jour les informations de votre dossier</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nom du Projet</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Client (MOA)</label>
              <input 
                type="text" 
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
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Montant Estimé (€)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                value={formData.estimatedValue}
                onChange={e => setFormData({...formData, estimatedValue: e.target.value})}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Description</label>
              <textarea 
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:bg-white text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm"
            >
              Annuler
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.name}
              className="flex-[2] disabled:bg-slate-200 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
              style={formData.name ? { backgroundColor: primaryColor } : {}}
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAOModal;
