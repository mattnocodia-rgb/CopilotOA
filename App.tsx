
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  Menu,
  X,
  Building2,
  ClipboardCheck
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TendersList from './pages/TendersList';
import AODetail from './pages/AODetail';
import CompanyProfilePage from './pages/CompanyProfilePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import NewAOModal from './components/NewAOModal';
import GeneralChatbot from './components/GeneralChatbot';
import { TenderOffer } from './src/types/models';
import { useAppStore } from './src/lib/store/useAppStore';

const queryClient = new QueryClient();

const INITIAL_DATA: TenderOffer[] = [
  {
    id: 'ao-1',
    companyId: 'comp-1',
    name: 'Rénovation de l\'Hôtel de Ville',
    moa: 'Mairie de Lyon',
    deadline: '2025-05-15',
    status: 'Rédaction',
    estimatedValue: 450000,
    location: 'Lyon (69)',
    description: 'Travaux de menuiserie extérieure et isolation thermique par l\'extérieur.',
    createdAt: new Date().toISOString(),
    files: [
      { id: 'f1', name: 'CCTP_Lots_Menuiserie.pdf', type: 'PDF', size: '4.5 MB', uploadedAt: new Date().toISOString() },
      { id: 'f2', name: 'Règlement_Consultation.pdf', type: 'PDF', size: '1.2 MB', uploadedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'ao-2',
    companyId: 'comp-1',
    name: 'Construction Groupe Scolaire',
    moa: 'Région IDF',
    deadline: '2025-04-20',
    status: 'Analyse',
    estimatedValue: 1200000,
    location: 'Nanterre (92)',
    description: 'Construction d\'un ensemble scolaire de 12 classes en structure bois.',
    createdAt: new Date().toISOString(),
    files: [
      { id: 'f3', name: 'Plans_Architecte.zip', type: 'ZIP', size: '45 MB', uploadedAt: new Date().toISOString() }
    ]
  },
  {
    id: 'ao-3',
    companyId: 'comp-1',
    name: 'Aménagement Voirie ZAC',
    moa: 'Grand Paris Aménagement',
    deadline: '2025-03-30',
    status: 'Gagné',
    estimatedValue: 850000,
    location: 'Aubervilliers (93)',
    description: 'Aménagement des espaces publics et réseaux divers.',
    createdAt: new Date().toISOString(),
    files: []
  }
];

const AppContent: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNewAOOpen, setNewAOOpen] = useState(false);
  const { tenders, setTenders, addTender, user, setUser, theme, primaryColor, logo } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    // Theme application
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Primary color application
    root.style.setProperty('--primary-color', primaryColor);
  }, [theme, primaryColor, user]);

  useEffect(() => {
    if (!user) return;
    if (tenders.length === 0) {
      setTenders(INITIAL_DATA);
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddAO = (newAO: TenderOffer) => {
    addTender(newAO);
    setNewAOOpen(false);
  };

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] lg:relative lg:z-50
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-slate-900 text-white transition-all duration-300 flex flex-col shrink-0
      `}>
        <div className="p-6 flex items-center gap-3">
          {logo ? (
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
          ) : (
            <div className="bg-blue-600 p-2 rounded-lg" style={{ backgroundColor: primaryColor }}>
              <ClipboardCheck className="w-6 h-6" />
            </div>
          )}
          {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-xl tracking-tight">COPILOTE AO</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Tableau de bord" collapsed={!isSidebarOpen && !isMobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
          <SidebarLink to="/appels-offres" icon={<FileText size={20} />} label="Mes Appels d'Offres" collapsed={!isSidebarOpen && !isMobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
          <SidebarLink to="/profil" icon={<Building2 size={20} />} label="Mon Entreprise" collapsed={!isSidebarOpen && !isMobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <SidebarLink to="/reglages" icon={<Settings size={20} />} label="Réglages" collapsed={!isSidebarOpen && !isMobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
          <button 
            onClick={() => setUser(null)}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
          >
            <X size={20} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="mt-4 w-full hidden lg:flex items-center justify-center p-2 rounded hover:bg-slate-800 text-slate-400"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-full w-64 xl:w-96 hidden md:flex border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={() => setNewAOOpen(true)}
              className="text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-md active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nouvel AO</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 text-xs lg:text-sm">
              {user?.name.split(' ').map(n => n[0]).join('') || '??'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appels-offres" element={<TendersList />} />
            <Route path="/ao/:id" element={<AODetail />} />
            <Route path="/profil" element={<CompanyProfilePage />} />
            <Route path="/reglages" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      <NewAOModal 
        isOpen={isNewAOOpen} 
        onClose={() => setNewAOOpen(false)} 
        onAdd={handleAddAO} 
      />

      {location.pathname !== '/' && <GeneralChatbot />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, collapsed: boolean, onClick?: () => void }> = ({ to, icon, label, collapsed, onClick }) => {
  const { primaryColor } = useAppStore();
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
        ${isActive ? 'text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
      `}
      style={({ isActive }) => isActive ? { backgroundColor: primaryColor } : {}}
    >
      {icon}
      {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
    </NavLink>
  );
};

export default App;
