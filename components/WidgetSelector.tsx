
import React from 'react';
import { X, Plus, BarChart3, Briefcase, TrendingUp, Sparkles, MessageSquare, LayoutDashboard } from 'lucide-react';
import { DashboardWidget, WidgetType } from '../src/types/models';

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: DashboardWidget[];
  onAdd: (id: string) => void;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ isOpen, onClose, availableWidgets, onAdd }) => {
  if (!isOpen) return null;

  const getIcon = (type: WidgetType) => {
    switch (type) {
      case 'STATS': return <LayoutDashboard size={20} />;
      case 'PRIORITY_TENDERS': return <Briefcase size={20} />;
      case 'REVENUE_CHART': return <BarChart3 size={20} />;
      case 'LATEST_SUCCESS': return <TrendingUp size={20} />;
      case 'INSIGHTS_PROMO': return <Sparkles size={20} />;
      case 'CHATBOT': return <MessageSquare size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Ajouter un Widget</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {availableWidgets.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">Tous les widgets sont déjà sur votre tableau de bord.</p>
          ) : (
            availableWidgets.map((w) => (
              <button
                key={w.id}
                onClick={() => onAdd(w.id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    {getIcon(w.type)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">{w.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Widget {w.type}</p>
                  </div>
                </div>
                <div className="p-1 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} />
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-white border border-slate-200 px-6 py-2 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSelector;
