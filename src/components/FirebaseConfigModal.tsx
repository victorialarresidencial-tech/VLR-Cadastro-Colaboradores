import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Server
} from 'lucide-react';
import {
  DEFAULT_PROJECT_ID,
  getActiveFirebaseConfig,
  saveUserCredentials,
  clearUserCredentials,
  testarConexaoFirestore
} from '../lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID);
  const [appId, setAppId] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getActiveFirebaseConfig();
      setApiKey(config.apiKey);
      setProjectId(config.projectId || DEFAULT_PROJECT_ID);
      setAppId(config.appId || '');
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      saveUserCredentials(apiKey, appId, projectId);
      const res = await testarConexaoFirestore();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err?.message || 'Falha ao testar conexão com o Firestore.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveUserCredentials(apiKey, appId, projectId);
    setSavedSuccess(true);
    setTimeout(() => {
      onConfigSaved();
    }, 1200);
  };

  const handleClear = () => {
    clearUserCredentials();
    setApiKey('');
    setAppId('');
    setProjectId(DEFAULT_PROJECT_ID);
    setTestResult({
      ok: true,
      message: 'Credenciais removidas. O sistema continuará operando com backup local.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#143d30] text-white px-6 py-4 flex items-center justify-between border-b border-[#214f3b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#dfb842]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-brand text-lg font-bold">
                Conexão Firestore Victoria Lar
              </h3>
              <p className="text-xs text-stone-200">
                Coleção de Funcionários: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">/funcionarios</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-700 text-sm">
          {/* Target Database Link */}
          <div className="bg-[#f7f5ed] border border-[#e1d9c2] rounded-xl p-4 flex items-start gap-3">
            <Server className="w-5 h-5 text-[#143d30] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-[#143d30] text-sm flex items-center gap-2">
                Banco de Dados Firestore Oficial
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Os dados de cadastro alimentam em tempo real a coleção <strong className="font-mono text-[#143d30]">/funcionarios</strong> no banco de dados da Victoria Lar Residencial:
              </p>
              <a
                href={`https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/data`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#143d30] hover:text-[#cda45e] transition-colors underline"
              >
                Abrir Firestore no Firebase Console
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Como obter a Chave Web API (Secrets ou Campo abaixo)
            </div>
            <ol className="text-xs text-amber-950/80 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Acesse o <strong>Firebase Console</strong> no seu projeto <em>{projectId}</em>.</li>
              <li>Clique na engrenagem ⚙️ (Configurações do Projeto) &gt; aba <strong>Geral</strong>.</li>
              <li>Na seção <strong>Seus aplicativos</strong>, selecione ou adicione um app <strong>Web (&lt;/&gt;)</strong>.</li>
              <li>Copie o valor de <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">apiKey</code> e cole no campo abaixo (ou configure a variável de ambiente <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_FIREBASE_API_KEY</code>).</li>
            </ol>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Chave de API do Firebase (Web API Key) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143d30] focus:border-transparent font-mono"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                A chave é armazenada com segurança em seu navegador ou carregada via secret <code>VITE_FIREBASE_API_KEY</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  ID do Projeto Firebase
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143d30] font-mono text-stone-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  App ID (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="1:456322168913:web:..."
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143d30] font-mono text-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">
                  {testResult.ok ? 'Conexão Estabelecida com Sucesso!' : 'Não foi possível conectar:'}
                </span>
                {testResult.message}
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Configurações salvas! Atualizando conexão...
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-700 font-medium px-2 py-1.5 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar credenciais
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing || !apiKey}
              onClick={handleTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#143d30] bg-[#143d30]/10 hover:bg-[#143d30]/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Testar Conexão
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#143d30] hover:bg-[#1a4d3d] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#dfb842]" />
              Salvar Credenciais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
