
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TenderOffer, CompanyProfile, User, DashboardWidget } from '../../types/models';

interface AppState {
  tenders: TenderOffer[];
  companyProfile: CompanyProfile | null;
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  logo: string | null;
  chatMessages: { role: 'user' | 'bot'; content: string }[];
  widgets: DashboardWidget[];
  
  // Actions
  setTenders: (tenders: TenderOffer[]) => void;
  addTender: (tender: TenderOffer) => void;
  updateTender: (id: string, updates: Partial<TenderOffer>) => void;
  deleteTender: (id: string) => void;
  
  setCompanyProfile: (profile: CompanyProfile) => void;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;
  setLogo: (logo: string | null) => void;
  setChatMessages: (messages: { role: 'user' | 'bot'; content: string }[]) => void;
  addChatMessage: (message: { role: 'user' | 'bot'; content: string }) => void;
  resetChat: () => void;
  resetAllData: () => void;
  
  setWidgets: (widgets: DashboardWidget[]) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
}

const INITIAL_COMPANY: CompanyProfile = {
  id: 'comp-1',
  name: 'BTP Solutions France',
  siret: '123 456 789 00012',
  address: '12 Rue de la Construction, 75001 Paris',
  certifications: ['Qualibat 2111', 'ISO 9001', 'RGE'],
  resources: '50 ouvriers qualifiés, 5 conducteurs de travaux, parc matériel complet (grues, pelleteuses).',
  references: [
    { id: 'ref-1', title: 'Rénovation École Primaire', client: 'Ville de Paris', year: '2023', amount: '1.2M€', description: 'Rénovation énergétique complète.' }
  ],
  templates: [
    { id: 'temp-1', name: 'Mémoire Standard Gros Œuvre', type: 'MEMOIRE', lastUpdated: new Date().toISOString() }
  ]
};

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w-stats', type: 'STATS', title: 'Statistiques Clés', visible: true, order: 0, width: 'full' },
  { id: 'w-priority', type: 'PRIORITY_TENDERS', title: 'Dossiers Prioritaires', visible: true, order: 1, width: 'half' },
  { id: 'w-revenue', type: 'REVENUE_CHART', title: 'CA Gagné par Mois', visible: true, order: 2, width: 'half' },
  { id: 'w-success', type: 'LATEST_SUCCESS', title: 'Derniers Succès', visible: true, order: 3, width: 'half' },
  { id: 'w-insights', type: 'INSIGHTS_PROMO', title: 'Optimisation IA', visible: true, order: 4, width: 'half' },
  { id: 'w-chatbot', type: 'CHATBOT', title: 'Assistant Copilote', visible: true, order: 5, width: 'full' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tenders: [],
      companyProfile: INITIAL_COMPANY,
      user: null,
      theme: 'light',
      primaryColor: '#2563eb', // blue-600
      logo: null,
      chatMessages: [
        { role: 'bot', content: 'Bonjour ! Je suis votre assistant Copilote AO. Je peux vous aider à analyser l\'ensemble de vos dossiers en cours. Posez-moi une question sur vos appels d\'offres !' }
      ],
      widgets: DEFAULT_WIDGETS,
      
      setTenders: (tenders) => set({ tenders }),
      addTender: (tender) => set((state) => ({ tenders: [tender, ...state.tenders] })),
      updateTender: (id, updates) => set((state) => ({
        tenders: state.tenders.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      deleteTender: (id) => set((state) => ({
        tenders: state.tenders.filter((t) => t.id !== id)
      })),
      
      setCompanyProfile: (profile) => set({ companyProfile: profile }),
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setLogo: (logo) => set({ logo }),
      setChatMessages: (chatMessages) => set({ chatMessages }),
      addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      resetChat: () => set({
        chatMessages: [
          { role: 'bot', content: 'Bonjour ! Je suis votre assistant Copilote AO. Je peux vous aider à analyser l\'ensemble de vos dossiers en cours. Posez-moi une question sur vos appels d\'offres !' }
        ]
      }),
      resetAllData: () => set({ 
        tenders: [], 
        chatMessages: [
          { role: 'bot', content: 'Bonjour ! Je suis votre assistant Copilote AO. Je peux vous aider à analyser l\'ensemble de vos dossiers en cours. Posez-moi une question sur vos appels d\'offres !' }
        ] 
      }),
      
      setWidgets: (widgets) => set({ widgets }),
      updateWidget: (id, updates) => set((state) => ({
        widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w))
      })),
    }),
    {
      name: 'copilote-ao-storage',
    }
  )
);
