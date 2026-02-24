
import React, { useState } from 'react';
import { Save, Building2, ShieldCheck, Users, Briefcase, Plus, X, FileText } from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';
import { CompanyProfile, CompanyReference } from '../src/types/models';

const CompanyProfilePage: React.FC = () => {
  const { companyProfile, setCompanyProfile } = useAppStore();
  const [profile, setProfile] = useState<CompanyProfile>(companyProfile || {
    id: 'comp-1',
    name: '',
    siret: '',
    address: '',
    certifications: [],
    resources: '',
    references: [],
    templates: []
  });

  const [newCert, setNewCert] = useState('');
  const [newRef, setNewRef] = useState<Partial<CompanyReference>>({ title: '', client: '', year: '', amount: '' });

  const save = () => {
    setCompanyProfile(profile);
    alert('Profil sauvegardé !');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil de l'Entreprise</h1>
          <p className="text-slate-500 text-sm">Ces informations sont utilisées par l'IA pour personnaliser vos mémoires techniques.</p>
        </div>
        <button 
          onClick={save}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
        >
          <Save size={20} /> Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
           <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
             <Building2 className="text-blue-500" size={20} />
             Informations Générales
           </h3>
           <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Raison Sociale</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">SIRET</label>
                <input 
                  type="text" 
                  value={profile.siret}
                  onChange={e => setProfile({...profile, siret: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Adresse</label>
                <input 
                  type="text" 
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none"
                />
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
           <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
             <ShieldCheck className="text-blue-500" size={20} />
             Certifications & Labels
           </h3>
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Ex: QUALIBAT 2111"
               value={newCert}
               onChange={e => setNewCert(e.target.value)}
               className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none text-sm"
             />
             <button 
               onClick={() => {
                 if (newCert) {
                   setProfile({...profile, certifications: [...profile.certifications, newCert]});
                   setNewCert('');
                 }
               }}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg"
             >
               <Plus size={18} />
             </button>
           </div>
           <div className="flex flex-wrap gap-2">
             {profile.certifications.map((c, i) => (
               <span key={i} className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-100">
                 {c}
                 <X 
                   size={14} 
                   className="cursor-pointer hover:text-blue-900" 
                   onClick={() => setProfile({...profile, certifications: profile.certifications.filter((_, idx) => idx !== i)})}
                 />
               </span>
             ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
           <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
             <Users className="text-blue-500" size={20} />
             Moyens Humains & Matériels
           </h3>
           <textarea 
             rows={4}
             value={profile.resources}
             onChange={e => setProfile({...profile, resources: e.target.value})}
             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm leading-relaxed"
             placeholder="Décrivez vos équipes et votre parc matériel..."
           ></textarea>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
           <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
             <Briefcase className="text-blue-500" size={20} />
             Références Majeures
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
             <input 
               type="text" 
               placeholder="Projet"
               value={newRef.title}
               onChange={e => setNewRef({...newRef, title: e.target.value})}
               className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none text-sm"
             />
             <input 
               type="text" 
               placeholder="Client"
               value={newRef.client}
               onChange={e => setNewRef({...newRef, client: e.target.value})}
               className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none text-sm"
             />
             <input 
               type="text" 
               placeholder="Année"
               value={newRef.year}
               onChange={e => setNewRef({...newRef, year: e.target.value})}
               className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none text-sm"
             />
             <button 
               onClick={() => {
                 if (newRef.title) {
                   const ref: CompanyReference = {
                     id: Math.random().toString(36).substr(2, 9),
                     title: newRef.title || '',
                     client: newRef.client || '',
                     year: newRef.year || '',
                     amount: newRef.amount || '',
                     description: ''
                   };
                   setProfile({...profile, references: [...profile.references, ref]});
                   setNewRef({ title: '', client: '', year: '', amount: '' });
                 }
               }}
               className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
             >
               <Plus size={18} /> Ajouter
             </button>
           </div>
           <div className="grid grid-cols-1 gap-3">
             {profile.references.map((r) => (
               <div key={r.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-slate-800">{r.title}</span>
                   <span className="text-xs text-slate-500">{r.client} • {r.year}</span>
                 </div>
                 <X 
                   size={16} 
                   className="text-slate-400 cursor-pointer hover:text-red-500 transition-colors"
                   onClick={() => setProfile({...profile, references: profile.references.filter(ref => ref.id !== r.id)})}
                 />
               </div>
             ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
           <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
             <FileText className="text-blue-500" size={20} />
             Modèles de Documents
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.templates.map(t => (
                <div key={t.id} className="border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Mis à jour le {new Date(t.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <button className="border-2 border-dashed border-slate-200 p-4 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all">
                <Plus size={20} /> Nouveau modèle
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
