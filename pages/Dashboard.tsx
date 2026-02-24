
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  MapPin, 
  Briefcase,
  Clock,
  ArrowUpRight,
  PieChart,
  CalendarDays,
  Sparkles,
  Euro,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import GeneralChatbot from '../components/GeneralChatbot';
import InsightsModal from '../components/InsightsModal';
import DashboardWidgetWrapper from '../components/DashboardWidgetWrapper';
import WidgetSelector from '../components/WidgetSelector';
import { Settings2, Plus, Check, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tenders, primaryColor, widgets, updateWidget, setWidgets } = useAppStore();
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleWidgets = [...widgets]
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const hiddenWidgets = widgets.filter(w => !w.visible);

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const currentIndex = visibleWidgets.findIndex(w => w.id === id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === visibleWidgets.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newVisibleWidgets = [...visibleWidgets];
    const [movedWidget] = newVisibleWidgets.splice(currentIndex, 1);
    newVisibleWidgets.splice(targetIndex, 0, movedWidget);

    // Update orders for all widgets
    const updatedWidgets = widgets.map(w => {
      const visibleIdx = newVisibleWidgets.findIndex(vw => vw.id === w.id);
      if (visibleIdx !== -1) {
        return { ...w, order: visibleIdx };
      }
      return w;
    });

    setWidgets(updatedWidgets);
  };

  const handleRemoveWidget = (id: string) => {
    updateWidget(id, { visible: false });
  };

  const handleAddWidget = (id: string) => {
    const maxOrder = Math.max(...widgets.map(w => w.order), -1);
    updateWidget(id, { visible: true, order: maxOrder + 1 });
    setIsSelectorOpen(false);
  };

  const handleToggleWidth = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      updateWidget(id, { width: widget.width === 'full' ? 'half' : 'full' });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visibleWidgets.findIndex(w => w.id === active.id);
      const newIndex = visibleWidgets.findIndex(w => w.id === over.id);

      const newVisibleWidgets = arrayMove(visibleWidgets, oldIndex, newIndex);

      // Update orders for all widgets
      const updatedWidgets = widgets.map(w => {
        const visibleIdx = newVisibleWidgets.findIndex(vw => vw.id === w.id);
        if (visibleIdx !== -1) {
          return { ...w, order: visibleIdx };
        }
        return w;
      });

      setWidgets(updatedWidgets);
    }
  };

  // Sort offers by deadline soonest first
  const sortedOffers = [...tenders].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const totalPipelineValue = tenders.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  const wonValue = tenders.filter(o => o.status === 'Gagné').reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  const potentialValue = tenders.filter(o => ['Analyse', 'Rédaction'].includes(o.status)).reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  const stats = [
    { label: 'Valeur Pipeline', value: formatCurrency(totalPipelineValue), color: 'text-blue-600', bg: 'bg-blue-50', icon: <Euro size={22} /> },
    { label: 'Chiffre d\'Affaires Gagné', value: formatCurrency(wonValue), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <TrendingUp size={22} /> },
    { label: 'Taux de Succès', value: tenders.length ? Math.round((tenders.filter(o => o.status === 'Gagné').length / tenders.length) * 100) + '%' : '0%', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Sparkles size={22} /> },
    { label: 'AO Actifs', value: tenders.filter(o => ['Analyse', 'Rédaction'].includes(o.status)).length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Briefcase size={22} /> },
  ];

  // Monthly won revenue data - Last 12 months
  const monthsToShow = 12;
  const lastMonths = Array.from({ length: monthsToShow }, (_, i) => {
    const d = new Date();
    d.setDate(1); // Avoid month-skipping bug
    d.setMonth(d.getMonth() - (monthsToShow - 1 - i));
    return {
      name: d.toLocaleDateString('fr-FR', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      value: 0
    };
  });

  tenders.filter(o => o.status === 'Gagné').forEach(o => {
    const date = new Date(o.deadline);
    const m = date.getMonth();
    const y = date.getFullYear();
    const monthData = lastMonths.find(lm => lm.month === m && lm.year === y);
    if (monthData) {
      monthData.value += (o.estimatedValue || 0);
    }
  });

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return value.toString();
  };

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Performance Commerciale</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm lg:text-base">Suivi financier et opérationnel de vos marchés publics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs lg:text-sm transition-all shadow-sm ${
              isCustomizing 
                ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isCustomizing ? <Check size={18} /> : <Settings2 size={18} />}
            {isCustomizing ? 'Terminer' : 'Personnaliser'}
          </button>
          {isCustomizing && (
            <button 
              onClick={() => setIsSelectorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 border border-blue-600 text-white font-bold text-xs lg:text-sm hover:bg-blue-700 transition-all shadow-sm animate-in slide-in-from-right-2"
            >
              <Plus size={18} />
              Ajouter
            </button>
          )}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs lg:text-sm font-semibold text-slate-600">
            <CalendarDays size={18} style={{ color: primaryColor }} />
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={visibleWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visibleWidgets.map((widget, index) => {
              const commonProps = {
                id: widget.id,
                title: widget.title,
                width: widget.width,
                isCustomizing,
                onRemove: () => handleRemoveWidget(widget.id),
                onMoveUp: index > 0 ? () => handleMoveWidget(widget.id, 'up') : undefined,
                onMoveDown: index < visibleWidgets.length - 1 ? () => handleMoveWidget(widget.id, 'down') : undefined,
                onToggleWidth: () => handleToggleWidth(widget.id),
              };

              switch (widget.type) {
                case 'STATS':
                  return (
                    <DashboardWidgetWrapper key={widget.id} {...commonProps}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((s, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 rounded-full ${s.bg}`}></div>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                            <div className="flex items-end justify-between mt-3">
                              <span className={`text-2xl xl:text-3xl font-black ${s.color}`}>{s.value}</span>
                              <div className={`${s.bg} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(s.icon as React.ReactElement<{ className?: string }>, { className: s.color })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DashboardWidgetWrapper>
                  );
                case 'PRIORITY_TENDERS':
                  return (
                    <DashboardWidgetWrapper key={widget.id} {...commonProps}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase size={20} style={{ color: primaryColor }} />
                            Dossiers Prioritaires
                          </h2>
                          <button 
                            onClick={() => navigate('/appels-offres')}
                            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            Voir tout
                          </button>
                        </div>
                        
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                          {tenders.filter(o => o.status !== 'Gagné' && o.status !== 'Perdu').length === 0 ? (
                            <div className="p-16 text-center">
                              <Briefcase className="text-slate-200 mx-auto mb-4" size={64} />
                              <p className="text-slate-400 font-medium">Aucun dossier actif en cours.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {sortedOffers.filter(o => o.status !== 'Gagné' && o.status !== 'Perdu').slice(0, 5).map((ao) => (
                                <div 
                                  key={ao.id} 
                                  onClick={() => navigate(`/ao/${ao.id}`)}
                                  className="p-5 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between border-l-4 border-transparent hover:border-blue-600"
                                >
                                  <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                      {ao.name.charAt(0)}
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                                        {ao.name}
                                      </h3>
                                      <div className="flex gap-3 text-[10px] text-slate-500 mt-1 font-medium">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {ao.location}</span>
                                        <span className="font-bold text-slate-700">{formatCurrency(ao.estimatedValue || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                      <span className="text-[9px] text-slate-400 block uppercase tracking-widest font-black">Échéance</span>
                                      <span className="text-xs font-bold text-slate-800 mt-0.5">
                                        {new Date(ao.deadline).toLocaleDateString('fr-FR')}
                                      </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${getStatusStyles(ao.status)}`}>
                                      {ao.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </DashboardWidgetWrapper>
                  );
                case 'REVENUE_CHART':
                  return (
                    <DashboardWidgetWrapper key={widget.id} {...commonProps}>
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <TrendingUp size={20} className="text-emerald-600" />
                          CA Gagné par Mois
                        </h2>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lastMonths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                                tickFormatter={formatYAxis}
                              />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '11px' }}
                              />
                              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50">
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-xs text-slate-500 font-medium">Pipeline Potentiel</span>
                             <span className="text-sm font-bold text-slate-800">{formatCurrency(potentialValue)}</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                             <div 
                               className="h-full transition-all duration-1000" 
                               style={{ width: `${(potentialValue / totalPipelineValue) * 100}%`, backgroundColor: primaryColor }}
                             ></div>
                           </div>
                        </div>
                      </div>
                    </DashboardWidgetWrapper>
                  );
                case 'LATEST_SUCCESS':
                  return (
                    <DashboardWidgetWrapper key={widget.id} {...commonProps}>
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <TrendingUp size={20} className="text-emerald-600" />
                          Derniers Succès
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {tenders.filter(o => o.status === 'Gagné').slice(0, 2).map(ao => (
                            <div 
                              key={ao.id}
                              onClick={() => navigate(`/ao/${ao.id}`)}
                              className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                  {ao.name.charAt(0)}
                                </div>
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">GAGNÉ</span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-700 transition-colors">{ao.name}</h3>
                              <p className="text-[10px] text-slate-500 mb-3">{ao.moa}</p>
                              <div className="flex justify-between items-end">
                                <span className="text-lg font-black text-slate-900">{formatCurrency(ao.estimatedValue || 0)}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{new Date(ao.deadline).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          ))}
                          {tenders.filter(o => o.status === 'Gagné').length === 0 && (
                            <div className="col-span-2 bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl text-center">
                              <p className="text-slate-400 text-sm">Aucun marché gagné pour le moment.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DashboardWidgetWrapper>
                  );
                case 'INSIGHTS_PROMO':
                  return (
                    <DashboardWidgetWrapper key={widget.id} {...commonProps}>
                      <div className="p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group h-full flex flex-col justify-center" style={{ backgroundColor: primaryColor }}>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="relative z-10">
                          <Sparkles className="mb-4 text-white/50" size={32} />
                          <h3 className="font-black text-xl mb-2 leading-tight">Optimisez vos chances</h3>
                          <p className="text-white/90 text-sm mb-6 leading-relaxed font-medium">L'IA analyse vos performances pour suggérer les meilleurs partenaires.</p>
                          <button 
                            onClick={() => setIsInsightsOpen(true)}
                            className="w-full bg-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95" 
                            style={{ color: primaryColor }}
                          >
                            Consulter les Insights
                          </button>
                        </div>
                      </div>
                    </DashboardWidgetWrapper>
                  );
                case 'CHATBOT':
                  return (
                    <DashboardWidgetWrapper key={widget.id} {...commonProps}>
                      <div className="w-full h-[600px] overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                        <GeneralChatbot inline={true} />
                      </div>
                    </DashboardWidgetWrapper>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </SortableContext>
      </DndContext>

      <InsightsModal 
        isOpen={isInsightsOpen} 
        onClose={() => setIsInsightsOpen(false)} 
      />

      <WidgetSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        availableWidgets={hiddenWidgets}
        onAdd={handleAddWidget}
      />
    </div>
  );
};

export default Dashboard;
