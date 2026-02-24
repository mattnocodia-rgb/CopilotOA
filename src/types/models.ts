
export type AOStatus = 'Analyse' | 'Rédaction' | 'Déposé' | 'Gagné' | 'Perdu' | 'Abandonné';

export interface TenderOffer {
  id: string;
  companyId: string; // Partitionnement multi-tenant
  name: string;
  moa: string; // Maître d'Ouvrage
  deadline: string;
  status: AOStatus;
  budget?: string;
  estimatedValue?: number;
  location: string;
  description: string;
  createdAt: string;
  files: TenderFile[];
  synthesis?: Synthesis;
}

export interface TenderFile {
  id: string;
  name: string;
  type: 'PDF' | 'ZIP' | 'DOCX' | 'XLSX';
  size: string;
  uploadedAt: string;
  content?: string; // Simulated extracted text
  storagePath?: string;
  publicUrl?: string;
}

export interface Synthesis {
  summary: string;
  keyDates: string[];
  requirements: string[];
  risks: string[];
  criteria: { label: string; weight: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  siret: string;
  address: string;
  certifications: string[];
  resources: string;
  references: CompanyReference[];
  templates: CompanyTemplate[];
}

export interface CompanyReference {
  id: string;
  title: string;
  client: string;
  year: string;
  amount: string;
  description: string;
}

export interface CompanyTemplate {
  id: string;
  name: string;
  type: 'MEMOIRE' | 'CV' | 'REFERENCES';
  lastUpdated: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  plan: 'FREE' | 'PAID';
}

export type WidgetType = 'STATS' | 'PRIORITY_TENDERS' | 'LATEST_SUCCESS' | 'REVENUE_CHART' | 'INSIGHTS_PROMO' | 'CHATBOT';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  order: number;
  width: 'full' | 'half';
}
