
import React from 'react';
import { X, GripVertical, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardWidgetWrapperProps {
  id: string;
  title: string;
  width: 'full' | 'half';
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleWidth?: () => void;
  isCustomizing: boolean;
  children: React.ReactNode;
  className?: string;
}

const DashboardWidgetWrapper: React.FC<DashboardWidgetWrapperProps> = ({ 
  id,
  title, 
  width,
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  onToggleWidth,
  isCustomizing, 
  children,
  className = ""
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`relative group ${className} ${width === 'full' ? 'lg:col-span-2' : 'lg:col-span-1'}`}
    >
      {isCustomizing && (
        <div className="absolute -top-3 -right-3 z-20 flex gap-1 animate-in zoom-in duration-200">
          <div className="bg-white border border-slate-200 shadow-lg rounded-lg flex items-center overflow-hidden">
            {onToggleWidth && (
              <button 
                onClick={onToggleWidth}
                className="p-1.5 hover:bg-slate-50 text-slate-500 transition-colors border-r border-slate-100"
                title={width === 'full' ? "Réduire la largeur" : "Agrandir la largeur"}
              >
                {width === 'full' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            {onMoveUp && (
              <button 
                onClick={onMoveUp}
                className="p-1.5 hover:bg-slate-50 text-slate-500 transition-colors border-r border-slate-100"
                title="Déplacer vers le haut"
              >
                <ChevronUp size={14} />
              </button>
            )}
            {onMoveDown && (
              <button 
                onClick={onMoveDown}
                className="p-1.5 hover:bg-slate-50 text-slate-500 transition-colors border-r border-slate-100"
                title="Déplacer vers le bas"
              >
                <ChevronDown size={14} />
              </button>
            )}
            <button 
              onClick={onRemove}
              className="p-1.5 hover:bg-red-50 text-red-500 transition-colors"
              title="Supprimer le widget"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      {isCustomizing && (
        <div 
          {...attributes}
          {...listeners}
          className="absolute inset-0 bg-blue-50/30 border-2 border-dashed border-blue-200 rounded-3xl z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
        >
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100 shadow-sm flex items-center gap-2">
            <GripVertical size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{title}</span>
          </div>
        </div>
      )}
      
      <div className={isCustomizing ? 'opacity-40 grayscale-[0.5]' : ''}>
        {children}
      </div>
    </div>
  );
};

export default DashboardWidgetWrapper;
