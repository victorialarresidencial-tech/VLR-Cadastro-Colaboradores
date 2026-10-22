import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  Database,
  ExternalLink,
  Settings,
  CheckCircle2,
  Building2,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { Funcionario } from './types/employee';
import {
  DEFAULT_PROJECT_ID,
  getActiveFirebaseConfig,
  ouvirFuncionarios
} from './lib/firebase';
import { VictoriaLogo } from './components/VictoriaLogo';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cadastro' | 'lista'>('cadastro');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const config = getActiveFirebaseConfig();
    const hasKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);
    setIsFirebaseConnected(hasKey);
    setLoading(true);

    const unsubscribe = ouvirFuncionarios(
      (updatedFuncionarios, isOnline) => {
        setFuncionarios(updatedFuncionarios);
        setIsFirebaseConnected(isOnline);
        setLoading(false);
      },
      (error) => {
        console.warn('Aguardando sincronização Firestore:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleEmployeeRegistered = (novo: Funcionario) => {
    setNotification({
      message: `${novo.nomeCompleto} (${novo.cargo}) foi cadastrado com sucesso!`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRefresh = () => {
    setLoading(true);
    ouvirFuncionarios(
      (updatedFuncionarios, isOnline) => {
        setFuncionarios(updatedFuncionarios);
        setIsFirebaseConnected(isOnline);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-stone-800 flex flex-col font-sans">
      {/* Top Bar for Victoria Lar Residencial (Exact match to target repo layout) */}
      <header className="bg-[#133827] text-white border-b border-[#214f3b] sticky top-0 z-40 shadow-md no-print">
        {/* Upper Brand Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo with exact landing page image */}
          <div className="flex items-center gap-3">
            <VictoriaLogo size="md" />
            <div className="hidden md:flex flex-col border-l border-[#20573e] pl-3 py-0.5">
              <span className="font-serif-brand font-semibold text-xs tracking-wider text-[#dfb842] uppercase">
                Gestão de Funcionários & RH
              </span>
              <span className="text-[11px] text-stone-300">
                Victoria Lar Residencial Geriátrico
              </span>
            </div>
          </div>

          {/* Right Status & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Firebase Status Badge */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isFirebaseConnected
                  ? 'bg-[#1b4834] text-emerald-300 border-emerald-500/50 hover:bg-[#20573e]'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/70'
              }`}
              title="Clique para ver ou configurar a conexão com o Firebase"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isFirebaseConnected
                  ? `Firestore Conectado (${DEFAULT_PROJECT_ID})`
                  : 'Configurar Chave do Firebase'}
              </span>
              <span className="sm:hidden font-mono text-[11px]">
                {isFirebaseConnected ? 'Firestore OK' : 'Configurar'}
              </span>
            </button>

            {/* Direct Link to Firebase Console */}
            <a
              href={`https://console.firebase.google.com/project/${DEFAULT_PROJECT_ID}/firestore/databases/-default-/data`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Abrir Firestore no console do Firebase"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Settings button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Configurações do Firebase"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1c4734]">
          <div className="flex space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('cadastro')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'cadastro'
                  ? 'border-[#dfb842] text-[#dfb842]'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#dfb842]" />
              Novo Cadastro de Funcionário
            </button>
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'lista'
                  ? 'border-[#dfb842] text-[#dfb842]'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-[#dfb842]" />
              Quadro de Colaboradores
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dfb842]/20 text-[#dfb842]">
                {funcionarios.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Floating toast notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#143d30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#dfb842]/40 text-xs sm:text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#dfb842]" />
            <span>{notification.message}</span>
            <button
              onClick={() => {
                setActiveTab('lista');
                setNotification(null);
              }}
              className="ml-2 underline text-[#dfb842] font-semibold text-xs cursor-pointer"
            >
              Ver no Quadro
            </button>
          </div>
        )}

        {/* Content based on tab */}
        {activeTab === 'cadastro' ? (
          <div className="space-y-6">
            <EmployeeForm
              onSuccess={handleEmployeeRegistered}
              onOpenConfig={() => setIsConfigOpen(true)}
              isFirebaseConnected={isFirebaseConnected}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <EmployeeList
              funcionarios={funcionarios}
              isLoading={loading}
              onSelectFuncionario={(f) => setSelectedFuncionario(f)}
              onNewEmployeeClick={() => setActiveTab('cadastro')}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif-brand font-bold text-[#143d30]">Victoria Lar Residencial</span>
            <span>&bull;</span>
            <span>Módulo de Recursos Humanos & Cadastro de Funcionários</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Projeto Firestore: <code className="font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">{DEFAULT_PROJECT_ID}</code>
            </span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-[#143d30] hover:underline font-semibold cursor-pointer"
            >
              Configuração Firebase
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmployeeDetailsModal
        funcionario={selectedFuncionario}
        onClose={() => setSelectedFuncionario(null)}
        onStatusChange={(id, novoStatus) => {
          setFuncionarios((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: novoStatus } : f))
          );
          if (selectedFuncionario && selectedFuncionario.id === id) {
            setSelectedFuncionario({ ...selectedFuncionario, status: novoStatus });
          }
        }}
      />

      <FirebaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => {
          setIsConfigOpen(false);
          const config = getActiveFirebaseConfig();
          setIsFirebaseConnected(Boolean(config.apiKey && config.apiKey.trim().length > 0));
        }}
      />
    </div>
  );
}
