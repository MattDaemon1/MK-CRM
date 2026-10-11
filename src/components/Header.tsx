import React, { useRef } from 'react';
import {
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Search,
  LogOut,
  UserCheck
} from 'lucide-react';
import { CrmDatabase } from '../types/crm';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNewProspect: () => void;
  onNewTicket: () => void;
  onExport: () => void;
  onImport: (content: string) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  database: CrmDatabase;
  currentUser?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onNewProspect,
  onNewTicket,
  onExport,
  onImport,
  onReset,
  searchQuery,
  onSearchChange,
  database,
  currentUser = 'Matt',
  onLogout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo: MK CRM */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm shadow-indigo-500/20">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                MK CRM
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Local
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
              Pilotage Freelance & Agence
            </p>
          </div>
        </div>

        {/* Global Fast Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Recherche rapide (client, MP41, devis, ticket...)"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Quick Add Buttons */}
          <button
            onClick={onNewProspect}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            title="Créer un nouveau prospect ou une nouvelle opportunité"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouveau Lead</span>
          </button>

          <button
            onClick={onNewTicket}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Créer un ticket support ou maintenance"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ticket</span>
          </button>

          {/* Backup & JSON management */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

          <button
            onClick={onExport}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Exporter la base de données au format JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Importer une sauvegarde JSON"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Réinitialiser avec les données de test par défaut (MP41, etc.)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User profile & Logout */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                {currentUser ? currentUser[0].toUpperCase() : 'M'}
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
                {currentUser}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
