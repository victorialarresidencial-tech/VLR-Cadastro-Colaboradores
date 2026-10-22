import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import { Funcionario } from '../types/employee';

export const DEFAULT_PROJECT_ID = 'cadastro-de-pacientes-be77f';

const STORAGE_KEY_API_KEY = 'victoria_firebase_api_key';
const STORAGE_KEY_APP_ID = 'victoria_firebase_app_id';
const STORAGE_KEY_AUTH_DOMAIN = 'victoria_firebase_auth_domain';
const STORAGE_KEY_PROJECT_ID = 'victoria_firebase_project_id';
const STORAGE_KEY_LOCAL_FUNCIONARIOS = 'victoria_lar_funcionarios_backup';

export interface SavedFirebaseConfig {
  apiKey: string;
  projectId: string;
  authDomain: string;
  storageBucket: string;
  appId?: string;
  messagingSenderId?: string;
}

export function getActiveFirebaseConfig(): SavedFirebaseConfig {
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || '';
  const storedApiKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_API_KEY) || '' : '';
  const apiKey = envApiKey || storedApiKey;

  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '';
  const storedProjectId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PROJECT_ID) || '' : '';
  const projectId = envProjectId || storedProjectId || DEFAULT_PROJECT_ID;

  const envAuthDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '';
  const storedAuthDomain = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_AUTH_DOMAIN) || '' : '';
  const authDomain = envAuthDomain || storedAuthDomain || `${projectId}.firebaseapp.com`;

  const envAppId = (import.meta as any).env?.VITE_FIREBASE_APP_ID || '';
  const storedAppId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_APP_ID) || '' : '';
  const appId = envAppId || storedAppId || '';

  return {
    apiKey,
    projectId,
    authDomain,
    storageBucket: `${projectId}.firebasestorage.app`,
    appId,
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  };
}

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function initializeFirebase(): { app: FirebaseApp | null; db: Firestore | null; error?: string } {
  const config = getActiveFirebaseConfig();

  if (!config.apiKey || config.apiKey.trim() === '') {
    return {
      app: null,
      db: null,
      error: 'Chave Web API do Firebase não configurada. Configure no painel de conexão ou nos Secrets.',
    };
  }

  try {
    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        appId: config.appId || undefined,
        messagingSenderId: config.messagingSenderId || undefined,
      });
    }

    firestoreInstance = getFirestore(firebaseAppInstance);
    return { app: firebaseAppInstance, db: firestoreInstance };
  } catch (err: any) {
    console.error('Erro ao inicializar Firebase:', err);
    return {
      app: null,
      db: null,
      error: err?.message || 'Falha ao conectar ao Firebase.',
    };
  }
}

export function saveUserCredentials(apiKey: string, appId?: string, projectId?: string) {
  if (typeof window !== 'undefined') {
    if (apiKey) localStorage.setItem(STORAGE_KEY_API_KEY, apiKey.trim());
    if (appId) localStorage.setItem(STORAGE_KEY_APP_ID, appId.trim());
    if (projectId) localStorage.setItem(STORAGE_KEY_PROJECT_ID, projectId.trim());
    firebaseAppInstance = null;
    firestoreInstance = null;
  }
}

export function clearUserCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
    localStorage.removeItem(STORAGE_KEY_APP_ID);
    localStorage.removeItem(STORAGE_KEY_PROJECT_ID);
    localStorage.removeItem(STORAGE_KEY_AUTH_DOMAIN);
    firebaseAppInstance = null;
    firestoreInstance = null;
  }
}

// Initial demo staff for Victoria Lar Residencial
export const INITIAL_SEED_FUNCIONARIOS: Funcionario[] = [
  {
    id: 'func-01',
    matricula: 'VLR-2024-001',
    nomeCompleto: 'Maria Aparecida dos Santos',
    nomeSocial: 'Cida',
    cpf: '123.456.789-01',
    rg: '28.456.789-0 SSP/SP',
    dataNascimento: '1984-06-15',
    idade: 42,
    sexo: 'feminino',
    estadoCivil: 'Casada',
    nacionalidade: 'Brasileira',
    naturalidade: 'São Paulo - SP',
    nomeMae: 'Tereza Francisca dos Santos',
    cargo: 'Cuidador(a) de Idosos',
    departamento: 'Cuidados & Enfermagem',
    registroConselho: 'CBO 5162-10 / Cert. Cuidador ILPI',
    tipoContrato: 'clt_integral',
    escalaTrabalho: '12x36_diurno',
    turno: 'Plantão 12h',
    dataAdmissao: '2022-03-10',
    status: 'ativo',
    salarioBase: 'R$ 2.450,00',
    celularWhatsApp: '(11) 98765-4321',
    email: 'maria.cida@victorialar.com.br',
    cep: '04571-010',
    logradouro: 'Rua das Camélias',
    numero: '342',
    complemento: 'Apto 12',
    bairro: 'Brooklin',
    cidade: 'São Paulo',
    estado: 'SP',
    nomeContatoEmergencia: 'Roberto dos Santos',
    parentescoEmergencia: 'Esposo',
    telefoneEmergencia: '(11) 97654-3210',
    pisPasep: '123.45678.90-1',
    ctpsNumero: '9876543',
    ctpsSerie: '0020-SP',
    banco: 'Banco Itaú (341)',
    agencia: '0452',
    conta: '38291-7',
    tipoChavePix: 'cpf',
    chavePix: '123.456.789-01',
    dataExameAdmissional: '2024-03-05',
    dataValidadeASO: '2027-03-05',
    vacinasEmDia: ['COVID-19 (Doses + Reforço)', 'Influenza / Gripe Anual', 'Hepatite B', 'Dupla Adulto (dT)'],
    alergiasRestricoes: 'Nenhuma conhecida. Apta para esforço físico moderado.',
    tipoSanguineo: 'O+',
    qualificacoesCursos: [
      'Curso de Cuidador de Idosos (160h)',
      'Primeiros Socorros em ILPI (Cruz Vermelha)',
      'Prevenção de Quedas e Lesão por Pressão'
    ],
    observacoesGerais: 'Excelente relacionamento interpessoal com os residentes e familiares. Responsável pelo plantão da Ala A.',
    criadoEm: '2024-03-10T10:00:00.000Z',
    atualizadoEm: '2024-03-10T10:00:00.000Z',
  },
  {
    id: 'func-02',
    matricula: 'VLR-2023-014',
    nomeCompleto: 'Dra. Juliana Mendes da Silva',
    cpf: '234.567.890-12',
    rg: '34.890.123-4 SSP/SP',
    dataNascimento: '1989-11-20',
    idade: 36,
    sexo: 'feminino',
    estadoCivil: 'Solteira',
    nacionalidade: 'Brasileira',
    naturalidade: 'Campinas - SP',
    cargo: 'Enfermeiro(a) Responsável Técnico (RT)',
    departamento: 'Cuidados & Enfermagem',
    registroConselho: 'COREN-SP 456.789-ENF',
    tipoContrato: 'clt_integral',
    escalaTrabalho: '5x2',
    turno: 'Comercial',
    dataAdmissao: '2023-01-15',
    status: 'ativo',
    salarioBase: 'R$ 5.800,00',
    celularWhatsApp: '(11) 99123-4567',
    email: 'juliana.mendes@victorialar.com.br',
    cep: '04101-000',
    logradouro: 'Avenida Domingos de Morais',
    numero: '1200',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    estado: 'SP',
    nomeContatoEmergencia: 'Helena Mendes (Mãe)',
    parentescoEmergencia: 'Mãe',
    telefoneEmergencia: '(19) 98111-2233',
    banco: 'Banco Bradesco (237)',
    agencia: '1234',
    conta: '98765-4',
    tipoChavePix: 'email',
    chavePix: 'juliana.mendes@email.com',
    dataExameAdmissional: '2024-01-10',
    dataValidadeASO: '2027-01-10',
    vacinasEmDia: ['COVID-19 (Doses + Reforço)', 'Influenza / Gripe Anual', 'Hepatite B', 'Tríplice Viral'],
    tipoSanguineo: 'A+',
    qualificacoesCursos: [
      'Pós-Graduação em Gerontologia e Saúde do Idoso',
      'Responsabilidade Técnica em Instituições de Longa Permanência',
      'Protocolos de Farmacovigilância e Aprazamento Medicamentoso'
    ],
    observacoesGerais: 'Responsável técnica pela equipe de cuidadores e técnicos de enfermagem. Gestão de prontuários clínicos.',
    criadoEm: '2023-01-15T09:00:00.000Z',
    atualizadoEm: '2024-01-10T14:30:00.000Z',
  },
  {
    id: 'func-03',
    matricula: 'VLR-2023-022',
    nomeCompleto: 'Lucas de Oliveira Castro',
    cpf: '345.678.901-23',
    rg: '41.234.567-8 SSP/SP',
    dataNascimento: '1992-04-08',
    idade: 34,
    sexo: 'masculino',
    estadoCivil: 'Casado',
    cargo: 'Fisioterapeuta',
    departamento: 'Equipe Multidisciplinar / Saúde',
    registroConselho: 'CREFITO-3 298.411-F',
    tipoContrato: 'pj_prestador',
    escalaTrabalho: 'horista',
    turno: 'Manhã',
    dataAdmissao: '2023-06-01',
    status: 'ativo',
    salarioBase: 'R$ 4.200,00',
    celularWhatsApp: '(11) 97234-8899',
    email: 'lucas.fisiovictoria@gmail.com',
    cep: '04530-001',
    logradouro: 'Rua Joaquim Floriano',
    numero: '466',
    bairro: 'Itaim Bibi',
    cidade: 'São Paulo',
    estado: 'SP',
    nomeContatoEmergencia: 'Camila Castro',
    parentescoEmergencia: 'Esposa',
    telefoneEmergencia: '(11) 97788-9900',
    tipoChavePix: 'cpf',
    chavePix: '345.678.901-23',
    vacinasEmDia: ['COVID-19 (Doses + Reforço)', 'Influenza / Gripe Anual', 'Hepatite B'],
    tipoSanguineo: 'B+',
    qualificacoesCursos: [
      'Especialização em Fisioterapia Neurofuncional e Geriátrica',
      'Treinamento de Marcha e Equilíbrio para Idosos Frágeis'
    ],
    observacoesGerais: 'Atendimentos de reabilitação motora e sessões em grupo de cinesioterapia às terças e quintas-feiras.',
    criadoEm: '2023-06-01T08:00:00.000Z',
    atualizadoEm: '2024-02-15T11:00:00.000Z',
  },
  {
    id: 'func-04',
    matricula: 'VLR-2022-008',
    nomeCompleto: 'Ana Paula Rocha Ribeiro',
    cpf: '456.789.012-34',
    rg: '32.123.456-9 SSP/SP',
    dataNascimento: '1979-09-25',
    idade: 47,
    sexo: 'feminino',
    estadoCivil: 'Divorciada',
    cargo: 'Cozinheiro(a)',
    departamento: 'Cozinha & Nutrição',
    tipoContrato: 'clt_integral',
    escalaTrabalho: '6x1',
    turno: 'Manhã',
    dataAdmissao: '2022-02-01',
    status: 'ativo',
    salarioBase: 'R$ 2.600,00',
    celularWhatsApp: '(11) 96543-2109',
    email: 'anapaula.cozinha@gmail.com',
    cep: '04304-010',
    logradouro: 'Rua Fagundes Filho',
    numero: '512',
    bairro: 'São Judas',
    cidade: 'São Paulo',
    estado: 'SP',
    nomeContatoEmergencia: 'Beatriz Rocha (Filha)',
    parentescoEmergencia: 'Filha',
    telefoneEmergencia: '(11) 96111-4455',
    tipoChavePix: 'telefone',
    chavePix: '11965432109',
    vacinasEmDia: ['COVID-19 (Doses + Reforço)', 'Influenza / Gripe Anual', 'Hepatite B', 'Hepatite A'],
    tipoSanguineo: 'O-',
    qualificacoesCursos: [
      'Boas Práticas de Manipulação de Alimentos (ANVISA)',
      'Preparo de Dietas Pastosas, Brandas e Hipossódicas para Idosos'
    ],
    observacoesGerais: 'Coordena a cozinha e a execução dos cardápios orientados pela nutricionista da Victoria Lar.',
    criadoEm: '2022-02-01T07:30:00.000Z',
    atualizadoEm: '2024-01-20T16:00:00.000Z',
  }
];

function getStoredLocalFuncionarios(): Funcionario[] {
  if (typeof window === 'undefined') return INITIAL_SEED_FUNCIONARIOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_FUNCIONARIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOCAL_FUNCIONARIOS, JSON.stringify(INITIAL_SEED_FUNCIONARIOS));
      return INITIAL_SEED_FUNCIONARIOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_FUNCIONARIOS;
  } catch {
    return INITIAL_SEED_FUNCIONARIOS;
  }
}

function saveLocalFuncionarios(funcionarios: Funcionario[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_LOCAL_FUNCIONARIOS, JSON.stringify(funcionarios));
    } catch (e) {
      console.warn('Erro ao salvar localmente:', e);
    }
  }
}

// REALTIME LISTENER DIRECTLY FROM FIRESTORE OR LOCAL CACHE
export function ouvirFuncionarios(
  onUpdate: (funcionarios: Funcionario[], isOnline: boolean) => void,
  onError?: (error: string) => void
): () => void {
  const { db, error } = initializeFirebase();

  // If no DB or error, fallback to local synchronized cache
  if (!db || error) {
    const localData = getStoredLocalFuncionarios();
    onUpdate(localData, false);
    if (error && onError) onError(error);
    return () => {};
  }

  try {
    const colRef = collection(db, 'funcionarios');
    const q = query(colRef, orderBy('criadoEm', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const funcionarios: Funcionario[] = [];
        snapshot.forEach((docSnapshot) => {
          funcionarios.push({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<Funcionario, 'id'>),
          });
        });
        
        // If firestore is empty, seed with local list or keep empty
        if (funcionarios.length === 0) {
          const localData = getStoredLocalFuncionarios();
          onUpdate(localData, true);
        } else {
          saveLocalFuncionarios(funcionarios);
          onUpdate(funcionarios, true);
        }
      },
      (snapshotError) => {
        console.warn('Erro ao escutar Firestore funcionários, usando armazenamento sincronizado:', snapshotError);
        const localData = getStoredLocalFuncionarios();
        onUpdate(localData, false);
        if (onError) onError(snapshotError.message);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    const localData = getStoredLocalFuncionarios();
    onUpdate(localData, false);
    if (onError) onError(err?.message || 'Erro inesperado ao consultar Firestore.');
    return () => {};
  }
}

// CADASTRO
export async function cadastrarFuncionarioNoFirebase(funcionario: Omit<Funcionario, 'id'>): Promise<{ id: string }> {
  const timestamp = new Date().toISOString();
  const funcionarioCompleto = {
    ...funcionario,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };

  const { db } = initializeFirebase();

  if (db) {
    try {
      const colRef = collection(db, 'funcionarios');
      const docRef = await addDoc(colRef, funcionarioCompleto);
      
      // Update local cache
      const localData = getStoredLocalFuncionarios();
      const novoItem: Funcionario = { ...funcionarioCompleto, id: docRef.id };
      saveLocalFuncionarios([novoItem, ...localData]);
      return { id: docRef.id };
    } catch (firestoreError) {
      console.warn('Erro ao salvar no Firestore, salvando no repositório local:', firestoreError);
    }
  }

  // Fallback to local storage
  const localId = 'func-' + Date.now();
  const novoFuncionario: Funcionario = {
    ...funcionarioCompleto,
    id: localId,
  };
  const current = getStoredLocalFuncionarios();
  saveLocalFuncionarios([novoFuncionario, ...current]);
  return { id: localId };
}

// ATUALIZAR
export async function atualizarFuncionarioNoFirebase(id: string, dados: Partial<Funcionario>): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const dadosAtualizados = {
    ...dados,
    atualizadoEm: timestamp,
  };

  const { db } = initializeFirebase();

  if (db && !id.startsWith('func-')) {
    try {
      const docRef = doc(db, 'funcionarios', id);
      await updateDoc(docRef, dadosAtualizados);
    } catch (e) {
      console.warn('Erro ao atualizar no Firestore:', e);
    }
  }

  // Update local storage
  const current = getStoredLocalFuncionarios();
  const index = current.findIndex((item) => item.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...dadosAtualizados };
    saveLocalFuncionarios([...current]);
  }

  return true;
}

// EXCLUIR
export async function excluirFuncionarioNoFirebase(id: string): Promise<boolean> {
  const { db } = initializeFirebase();

  if (db && !id.startsWith('func-')) {
    try {
      const docRef = doc(db, 'funcionarios', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Erro ao deletar no Firestore:', e);
    }
  }

  // Remove from local storage
  const current = getStoredLocalFuncionarios();
  const filtrados = current.filter((item) => item.id !== id);
  saveLocalFuncionarios(filtrados);

  return true;
}

// TESTE DE CONEXÃO
export async function testarConexaoFirestore(): Promise<{ ok: boolean; message: string; count?: number }> {
  const { db, error } = initializeFirebase();

  if (!db || error) {
    return { ok: false, message: error || 'Firebase não configurado.' };
  }

  try {
    const colRef = collection(db, 'funcionarios');
    const snap = await getDocs(colRef);
    return {
      ok: true,
      message: `Conexão bem-sucedida com o projeto ${DEFAULT_PROJECT_ID}. ${snap.size} registros lidos da coleção 'funcionarios' no Firestore.`,
      count: snap.size,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Falha ao consultar coleção no Firestore.',
    };
  }
}
