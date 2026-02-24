
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  X,
  Euro
} from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';

const TendersList: React.FC = () => {
  const navigate = useNavigate();
  const { tenders, primaryColor } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredTenders = useMemo(() => {
    return tenders.filter(ao => {
      const matchesSearch = ao.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           ao.moa.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || ao.status === statusFilter;
      const matchesLocation = ao.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesLocation;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tenders, searchQuery, statusFilter, locationFilter]);

  const statuses = ['All', 'Analyse', 'Rédaction', 'Déposé', 'Gagné', 'Perdu'];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Analyse': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Rédaction': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Déposé': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'Gagné': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Perdu': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Tous mes Appels d'Offres</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm lg:text-base">Gérez et suivez l'ensemble de vos dossiers de candidature.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 bg-white border rounded-xl transition-all ${isFilterOpen ? 'border-blue-600 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-300 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Statut</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm outline-none focus:bg-white"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Tous les statuts' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Code Postal / Ville</label>
            <input 
              type="text" 
              placeholder="Ex: 75001"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm outline-none focus:bg-white"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setLocationFilter('');
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={14} /> Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredTenders.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun appel d'offre trouvé</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Ajustez vos filtres ou importez un nouveau dossier.</p>
            {(searchQuery || statusFilter !== 'All' || locationFilter) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setLocationFilter('');
                }}
                className="mt-4 text-blue-600 font-bold text-sm hover:underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTenders.map((ao) => (
              <div 
                key={ao.id} 
                onClick={() => navigate(`/ao/${ao.id}`)}
                className="p-6 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between border-l-4 border-transparent hover:border-blue-600"
              >
                <div className="flex gap-5 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    {ao.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                      {ao.name}
                      <ArrowUpRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </h3>
                    <div className="flex gap-4 text-xs text-slate-500 mt-1.5 font-medium">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {ao.location}</span>
                      <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">Client: {ao.moa}</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Euro size={12} />
                        {formatCurrency(ao.estimatedValue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-widest font-black">Remise le</span>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 justify-end mt-0.5">
                      <Clock size={14} className={new Date(ao.deadline).getTime() - new Date().getTime() < 604800000 ? "text-red-500" : "text-amber-500"} /> 
                      {new Date(ao.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${getStatusStyles(ao.status)}`}>
                    {ao.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TendersList;
