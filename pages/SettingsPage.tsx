
import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  Palette, 
  Globe, 
  Shield,
  Save,
  ChevronRight,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { useAppStore } from '../src/lib/store/useAppStore';

const SettingsPage: React.FC = () => {
  const { user, theme, setTheme, primaryColor, setPrimaryColor, logo, setLogo, resetAllData } = useAppStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const CONFIRMATION_TEXT = "SUPPRIMER DÉFINITIVEMENT";

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const colors = [
    { name: 'Bleu', value: '#2563eb' },
    { name: 'Émeraude', value: '#10b981' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Rose', value: '#db2777' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Ardoise', value: '#475569' },
  ];

  const handleStripeCheckout = async () => {
    setIsStripeLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la création de la session Stripe");
      }
    } catch (error) {
      console.error("Stripe error:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setIsStripeLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profil Utilisateur', icon: <User size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', label: 'Sécurité', icon: <Lock size={20} /> },
    { id: 'billing', label: 'Abonnement & Facturation', icon: <CreditCard size={20} /> },
    { id: 'appearance', label: 'Apparence', icon: <Palette size={20} /> },
    { id: 'danger', label: 'Zone de Danger', icon: <Trash2 size={20} className="text-red-500" /> },
  ];

  const handleDeleteAllData = () => {
    setIsDeleting(true);
    // Simulate deletion process
    setTimeout(() => {
      resetAllData();
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
      alert("Toutes les données ont été supprimées avec succès.");
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Réglages</h1>
        <p className="text-slate-500 mt-1">Gérez vos préférences personnelles et les paramètres de votre compte.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between p-4 text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-slate-50 border-l-4' 
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
                style={activeSection === section.id ? { color: primaryColor, borderLeftColor: primaryColor } : {}}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  {section.icon}
                  {section.label}
                </div>
                <ChevronRight size={16} className={activeSection === section.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeSection === 'profile' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-sm">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                    <p className="text-slate-500 text-sm">{user?.role} • {user?.email}</p>
                    <button className="mt-2 text-xs font-bold text-blue-600 hover:underline">Changer la photo</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prénom & Nom</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Professionnel</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Poste / Fonction</label>
                    <input 
                      type="text" 
                      defaultValue={user?.role}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Langue</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                      <option>Français (FR)</option>
                      <option>English (UK)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    className="text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Save size={18} /> Enregistrer les modifications
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-slate-900">Préférences de Notification</h3>
                <div className="space-y-4">
                  <NotificationToggle 
                    title="Nouveaux Appels d'Offres" 
                    description="Recevoir une alerte quand un nouveau DCE est importé ou détecté."
                    defaultChecked={true}
                  />
                  <NotificationToggle 
                    title="Analyses IA Terminées" 
                    description="Être notifié quand la synthèse d'un dossier est prête."
                    defaultChecked={true}
                  />
                  <NotificationToggle 
                    title="Échéances Proches" 
                    description="Rappels 48h et 24h avant la date limite de remise."
                    defaultChecked={true}
                  />
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: user?.plan === 'PAID' ? primaryColor : '#475569' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Plan Actuel</span>
                    <h3 className="text-3xl font-black mt-1">{user?.plan === 'PAID' ? 'Copilote Pro' : 'Plan Gratuit'}</h3>
                    <p className="text-white/80 mt-2 text-sm">
                      {user?.plan === 'PAID' ? '200€ / mois • Facturation mensuelle' : '1 dossier inclus • Fonctionnalités limitées'}
                    </p>
                    <div className="mt-6 flex gap-3">
                      {user?.plan === 'FREE' ? (
                        <button 
                          onClick={() => {
                            setIsStripeLoading(true);
                            setTimeout(() => {
                              useAppStore.getState().setUser({ ...user!, plan: 'PAID' });
                              setIsStripeLoading(false);
                              alert("Félicitations ! Vous êtes maintenant sur le plan Premium.");
                            }, 1500);
                          }}
                          disabled={isStripeLoading}
                          className="bg-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                          style={{ color: '#475569' }}
                        >
                          {isStripeLoading && <Loader2 size={16} className="animate-spin" />}
                          Passer au plan Premium
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={handleStripeCheckout}
                            disabled={isStripeLoading}
                            className="bg-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                            style={{ color: primaryColor }}
                          >
                            {isStripeLoading && <Loader2 size={16} className="animate-spin" />}
                            Gérer l'abonnement
                          </button>
                          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Voir l'historique</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {user?.plan === 'FREE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 border border-slate-200 rounded-2xl space-y-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900">Dossiers Illimités</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Gérez autant d'appels d'offres que vous le souhaitez, sans aucune restriction.</p>
                    </div>
                    <div className="p-6 border border-slate-200 rounded-2xl space-y-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Palette size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900">IA Avancée</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Accédez aux modèles d'IA les plus performants pour vos synthèses et rédactions.</p>
                    </div>
                  </div>
                )}

                {user?.plan === 'PAID' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900">Méthode de Paiement</h4>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400 text-[10px]">VISA</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">•••• •••• •••• 4242</p>
                          <p className="text-xs text-slate-500">Expire le 12/26</p>
                        </div>
                      </div>
                      <button className="text-sm font-bold text-blue-600 hover:underline">Modifier</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="p-8 space-y-10 animate-in slide-in-from-right-4 duration-300">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Thème de l'interface</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ThemeOption 
                      label="Clair" 
                      active={theme === 'light'} 
                      onClick={() => setTheme('light')}
                    />
                    <ThemeOption 
                      label="Sombre" 
                      active={theme === 'dark'} 
                      onClick={() => setTheme('dark')}
                    />
                    <ThemeOption 
                      label="Système" 
                      active={theme === 'system'} 
                      onClick={() => setTheme('system')}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Couleur principale</h3>
                  <p className="text-sm text-slate-500">Choisissez la couleur d'accentuation de votre application.</p>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setPrimaryColor(c.value)}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          primaryColor === c.value ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Logo de l'entreprise</h3>
                  <p className="text-sm text-slate-500">Personnalisez l'application avec votre propre logo.</p>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                      {logo ? (
                        <img src={logo} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <Globe className="text-slate-300" size={32} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input 
                        type="file" 
                        id="logo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <label 
                        htmlFor="logo-upload"
                        className="inline-block bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        Charger un logo
                      </label>
                      {logo && (
                        <button 
                          onClick={() => setLogo(null)}
                          className="block text-xs text-red-500 font-bold hover:underline"
                        >
                          Supprimer le logo
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-slate-900">Sécurité du compte</h3>
                <div className="space-y-6">
                  <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Double Authentification (2FA)</p>
                        <p className="text-xs text-slate-500">Ajoutez une couche de sécurité supplémentaire.</p>
                      </div>
                    </div>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">Activer</button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm">Changer le mot de passe</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <input type="password" placeholder="Mot de passe actuel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                      <input type="password" placeholder="Nouveau mot de passe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
                      <button className="w-fit bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all">Mettre à jour</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'danger' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle size={24} />
                  <h3 className="text-xl font-bold">Zone de Danger</h3>
                </div>
                
                <div className="p-6 border border-red-100 bg-red-50 rounded-2xl space-y-4">
                  <h4 className="font-bold text-red-900">Suppression définitive des données</h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Cette action est irréversible. Elle supprimera définitivement :
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
                    <li>Tous les appels d'offres enregistrés</li>
                    <li>Tous les documents et fichiers importés</li>
                    <li>L'historique des synthèses IA</li>
                    <li>Toutes les conversations avec le Copilote</li>
                  </ul>
                  <div className="pt-4">
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Trash2 size={18} /> Supprimer toutes les données de l'entreprise
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={24} />
                <h2 className="text-lg font-bold">Confirmation Requise</h2>
              </div>
              <button 
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)} 
                className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                Êtes-vous absolument sûr ? Cette action supprimera <strong>définitivement</strong> toutes les données de votre entreprise.
              </p>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Veuillez taper <span className="text-red-600">"{CONFIRMATION_TEXT}"</span> pour confirmer
                </label>
                <input 
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Tapez le texte ici..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-200 transition-all"
                  disabled={isDeleting}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteAllData}
                  disabled={deleteConfirmText !== CONFIRMATION_TEXT || isDeleting}
                  className="flex-[2] bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Confirmer la suppression
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationToggle: React.FC<{ title: string, description: string, defaultChecked: boolean }> = ({ title, description, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);
  const { primaryColor } = useAppStore();
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="max-w-md">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full transition-all relative ${checked ? '' : 'bg-slate-200'}`}
        style={checked ? { backgroundColor: primaryColor } : {}}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );
};

const ThemeOption: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => {
  const { primaryColor } = useAppStore();
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${active ? 'bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
      style={active ? { borderColor: primaryColor } : {}}
    >
      <div className={`h-24 rounded-lg mb-3 ${label === 'Sombre' ? 'bg-slate-900' : label === 'Clair' ? 'bg-slate-100' : 'bg-gradient-to-r from-slate-100 to-slate-900'}`}></div>
      <p className="text-center text-sm font-bold text-slate-800">{label}</p>
    </div>
  );
};

export default SettingsPage;
