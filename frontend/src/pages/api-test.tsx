import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

interface Instance {
  id: string;
  name: string;
  status: string;
  apiKey: string | null;
}

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  response?: any;
  error?: string;
  time?: number;
}

interface EndpointCategory {
  name: string;
  icon: string;
  endpoints: { method: string; path: string; desc: string; body?: any }[];
}

const CATEGORIES: EndpointCategory[] = [
  {
    name: 'Contatos',
    icon: '👥',
    endpoints: [
      { method: 'GET', path: '/api/contacts/groups', desc: 'Listar todos os grupos' },
      { method: 'GET', path: '/api/contacts/all', desc: 'Listar todos os contatos' },
      { method: 'GET', path: '/api/contacts/newsletters', desc: 'Listar canais seguidos' },
      { method: 'GET', path: '/api/contacts/groups/{groupId}/participants', desc: 'Participantes do grupo' },
    ],
  },
  {
    name: 'Mensagens',
    icon: '💬',
    endpoints: [
      { method: 'POST', path: '/api/send/text', desc: 'Enviar texto', body: { to: '5500000000000', text: 'Mensagem teste' } },
      { method: 'POST', path: '/api/send/image', desc: 'Enviar imagem', body: { to: '5500000000000', url: 'https://...', caption: 'Legenda' } },
      { method: 'POST', path: '/api/send/audio', desc: 'Enviar áudio', body: { to: '5500000000000', url: 'https://...' } },
      { method: 'POST', path: '/api/send/video', desc: 'Enviar vídeo', body: { to: '5500000000000', url: 'https://...', caption: 'Legenda' } },
      { method: 'POST', path: '/api/send/document', desc: 'Enviar documento', body: { to: '5500000000000', url: 'https://...', filename: 'arquivo.pdf' } },
      { method: 'POST', path: '/api/send/contact', desc: 'Enviar contato', body: { to: '5500000000000', name: 'Nome', phone: '5500000000000' } },
      { method: 'POST', path: '/api/send/location', desc: 'Enviar localização', body: { to: '5500000000000', lat: -23.5505, lng: -46.6333 } },
      { method: 'POST', path: '/api/send/sticker', desc: 'Enviar sticker', body: { to: '5500000000000', url: 'https://...' } },
      { method: 'POST', path: '/api/send/poll', desc: 'Enviar enquete', body: { to: '5500000000000', title: 'Pergunta?', options: ['Sim', 'Não'] } },
    ],
  },
  {
    name: 'Ações de Mensagem',
    icon: '⚡',
    endpoints: [
      { method: 'POST', path: '/api/message/delete', desc: 'Apagar mensagem', body: { to: '5500000000000', messageId: 'ID_DA_MENSAGEM' } },
      { method: 'POST', path: '/api/message/react', desc: 'Reagir mensagem', body: { to: '5500000000000', messageId: 'ID_DA_MENSAGEM', emoji: '👍' } },
      { method: 'POST', path: '/api/send/mention', desc: 'Enviar com menções', body: { to: 'GRUPO_ID', text: '@todos Olá!', mentions: ['5500000000000'] } },
    ],
  },
  {
    name: 'Grupos',
    icon: '👨‍👩‍👧‍👦',
    endpoints: [
      { method: 'POST', path: '/api/group/create', desc: 'Criar grupo', body: { name: 'Nome do Grupo', participants: ['5500000000000'] } },
      { method: 'POST', path: '/api/group/add', desc: 'Adicionar participantes', body: { groupId: 'GRUPO_ID', participants: ['5500000000000'] } },
      { method: 'POST', path: '/api/group/remove', desc: 'Remover participantes', body: { groupId: 'GRUPO_ID', participants: ['5500000000000'] } },
      { method: 'POST', path: '/api/group/promote', desc: 'Promover a admin', body: { groupId: 'GRUPO_ID', participants: ['5500000000000'] } },
      { method: 'POST', path: '/api/group/demote', desc: 'Rebaixar admin', body: { groupId: 'GRUPO_ID', participants: ['5500000000000'] } },
      { method: 'POST', path: '/api/group/subject', desc: 'Alterar nome', body: { groupId: 'GRUPO_ID', subject: 'Novo Nome' } },
      { method: 'POST', path: '/api/group/description', desc: 'Alterar descrição', body: { groupId: 'GRUPO_ID', description: 'Nova descrição' } },
      { method: 'POST', path: '/api/group/leave', desc: 'Sair do grupo', body: { groupId: 'GRUPO_ID' } },
      { method: 'GET', path: '/api/group/{groupId}/invite', desc: 'Obter link convite' },
      { method: 'POST', path: '/api/group/revoke-invite', desc: 'Revogar link', body: { groupId: 'GRUPO_ID' } },
    ],
  },
  {
    name: 'Newsletter / Canais',
    icon: '📢',
    endpoints: [
      { method: 'GET', path: '/api/newsletter', desc: 'Info newsletters' },
      { method: 'GET', path: '/api/newsletter/{id}', desc: 'Metadados do canal' },
      { method: 'GET', path: '/api/newsletter/{id}/subscribers', desc: 'Número de inscritos' },
      { method: 'GET', path: '/api/newsletter/{id}/messages', desc: 'Mensagens do canal' },
      { method: 'POST', path: '/api/newsletter/create', desc: 'Criar canal', body: { name: 'Nome do Canal', description: 'Descrição' } },
      { method: 'POST', path: '/api/newsletter/follow', desc: 'Seguir canal', body: { newsletterId: 'CANAL_ID' } },
      { method: 'POST', path: '/api/newsletter/unfollow', desc: 'Deixar de seguir', body: { newsletterId: 'CANAL_ID' } },
      { method: 'POST', path: '/api/newsletter/mute', desc: 'Silenciar canal', body: { newsletterId: 'CANAL_ID' } },
      { method: 'POST', path: '/api/newsletter/unmute', desc: 'Dessilenciar', body: { newsletterId: 'CANAL_ID' } },
      { method: 'POST', path: '/api/newsletter/text', desc: 'Enviar texto p/ canal', body: { newsletterId: 'CANAL_ID', text: 'Mensagem' } },
      { method: 'POST', path: '/api/newsletter/image', desc: 'Enviar imagem p/ canal', body: { newsletterId: 'CANAL_ID', url: 'https://...', caption: 'Legenda' } },
      { method: 'POST', path: '/api/newsletter/video', desc: 'Enviar vídeo p/ canal', body: { newsletterId: 'CANAL_ID', url: 'https://...', caption: 'Legenda' } },
    ],
  },
];

// Detecta se deve usar proxy interno (evita CORS) ou API direta
const getApiConfig = () => {
  if (typeof window === 'undefined') return { useProxy: false, baseUrl: '' };
  
  const currentHost = window.location.hostname;
  
  // Localhost: chamar API diretamente
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return { useProxy: false, baseUrl: 'http://localhost:3001' };
  }
  
  // Produção: usar proxy interno do Next.js para evitar CORS
  // O proxy está em /api/proxy/* e redireciona para a API backend
  return { useProxy: true, baseUrl: '' };
};

export default function ApiTest() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [useProxy, setUseProxy] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customBody, setCustomBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    // Detectar configuração da API
    if (typeof window !== 'undefined') {
      const config = getApiConfig();
      setUseProxy(config.useProxy);
      setBaseUrl(config.baseUrl);
    }
    
    // Carregar instâncias
    api.get('/instances').then(({ data }) => {
      const arr = Array.isArray(data) ? data : [];
      setInstances(arr);
      if (arr.length > 0) {
        setSelectedInstance(arr[0].id);
        if (arr[0].apiKey) setApiKey(arr[0].apiKey);
      }
    }).catch(() => setInstances([]));
  }, []);

  useEffect(() => {
    const inst = instances.find(i => i.id === selectedInstance);
    if (inst?.apiKey) setApiKey(inst.apiKey);
  }, [selectedInstance, instances]);

  const testEndpoint = async (method: string, path: string, body?: any): Promise<TestResult> => {
    const start = Date.now();
    try {
      // Se usar proxy, converter /api/xxx para /api/proxy/xxx
      // O proxy interno do Next.js evita problemas de CORS
      let url: string;
      if (useProxy) {
        // Remove /api do início e usa o proxy
        const cleanPath = path.startsWith('/api/') ? path.slice(5) : path.slice(1);
        url = `/api/proxy/${cleanPath}`;
      } else {
        url = `${baseUrl}${path}`;
      }
      
      console.log('Testing:', method, url);
      
      const response = await fetch(url, {
        method,
        headers: { 
          'x-api-key': apiKey, 
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json().catch(() => ({}));
      
      return {
        endpoint: path,
        method,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        response: data,
        time: Date.now() - start,
      };
    } catch (error: any) {
      return {
        endpoint: path,
        method,
        status: 'error',
        error: error.message,
        time: Date.now() - start,
      };
    }
  };

  const runAllTests = async () => {
    if (!apiKey) {
      alert('API Key necessária');
      return;
    }
    
    setTesting(true);
    setResults([]);
    
    const getEndpoints = CATEGORIES.flatMap(c => c.endpoints).filter(e => e.method === 'GET' && !e.path.includes('{'));
    const newResults: TestResult[] = [];
    
    for (const ep of getEndpoints) {
      const result = await testEndpoint(ep.method, ep.path);
      newResults.push(result);
      setResults([...newResults]);
    }
    
    setTesting(false);
    
    const success = newResults.filter(r => r.status === 'success').length;
    const failed = newResults.filter(r => r.status === 'error').length;
    alert(`Testes concluídos: ${success} sucesso, ${failed} falhas`);
  };

  const runCustomTest = async () => {
    if (!apiKey || !customEndpoint) {
      alert('Preencha API Key e Endpoint');
      return;
    }
    
    setTesting(true);
    
    let body = undefined;
    if (customBody && customMethod !== 'GET') {
      try {
        body = JSON.parse(customBody);
      } catch {
        alert('JSON inválido no body');
        setTesting(false);
        return;
      }
    }
    
    const result = await testEndpoint(customMethod, customEndpoint, body);
    setResults([result]);
    setTesting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectEndpoint = (ep: { method: string; path: string; body?: any }) => {
    setCustomEndpoint(ep.path);
    setCustomMethod(ep.method);
    if (ep.body) {
      setCustomBody(JSON.stringify(ep.body, null, 2));
    } else {
      setCustomBody('');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">🧪 Teste de API</h2>
        <p className="text-slate-400 text-lg">Teste todos os endpoints da API com sua API Key.</p>
      </div>

      {/* Configuração */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">⚙️ Configuração</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Modo de Conexão</label>
            <div className="w-full h-12 px-4 bg-[#2a2a2a] text-white border border-[#444] rounded-xl flex items-center">
              {useProxy ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Proxy Interno (sem CORS)
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Direto: {baseUrl}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {useProxy ? 'Requisições passam pelo servidor Next.js' : 'Requisições diretas para a API'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Instância</label>
            <select
              value={selectedInstance}
              onChange={(e) => setSelectedInstance(e.target.value)}
              className="w-full h-12 px-4 bg-[#2a2a2a] text-white border border-[#444] rounded-xl focus:outline-none focus:border-primary"
            >
              {instances.length === 0 && <option value="">Nenhuma instância</option>}
              {instances.map((i) => (
                <option key={i.id} value={i.id}>{i.name} {i.status === 'CONNECTED' ? '🟢' : '🔴'}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 h-12 px-4 bg-[#2a2a2a] text-white border border-[#444] rounded-xl focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="Sua API Key"
            />
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>
      </div>

      {/* Teste Rápido */}
      <div className="rounded-2xl border border-primary/30 bg-surface-dark p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">🚀 Teste Rápido</h3>
          <button
            onClick={runAllTests}
            disabled={testing || !apiKey}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {testing ? 'Testando...' : '▶ Testar Todos GET'}
          </button>
        </div>
        <p className="text-slate-400 text-sm">Testa automaticamente os endpoints GET (sem enviar mensagens).</p>
      </div>

      {/* Teste Customizado */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">🔧 Teste Customizado</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Método</label>
            <select
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value)}
              className="w-full h-12 px-4 bg-[#2a2a2a] text-white border border-[#444] rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Endpoint</label>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              className="w-full h-12 px-4 bg-[#2a2a2a] text-white border border-[#444] rounded-xl focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="/api/contacts/groups"
            />
          </div>
        </div>
        {customMethod !== 'GET' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Body (JSON)</label>
            <textarea
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-[#2a2a2a] text-white border border-[#444] rounded-xl focus:outline-none focus:border-primary font-mono text-sm resize-none"
              placeholder='{"to": "5500000000000", "text": "Teste"}'
            />
          </div>
        )}
        <button
          onClick={runCustomTest}
          disabled={testing || !apiKey || !customEndpoint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
        >
          📤 Enviar Requisição
        </button>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden mb-6">
          <div className="p-4 border-b border-border-dark">
            <h3 className="text-xl font-bold text-white">📊 Resultados</h3>
          </div>
          <div className="divide-y divide-border-dark">
            {results.map((result, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      result.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      result.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {result.method}
                    </span>
                    <span className="text-white font-mono text-sm">{result.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.time && <span className="text-slate-500 text-sm">{result.time}ms</span>}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {result.status === 'success' ? '✓' : '✗'} {result.statusCode || 'erro'}
                    </span>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                    {JSON.stringify(result.response || result.error, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoints por Categoria */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark p-6">
        <h3 className="text-xl font-bold text-white mb-4">📋 Endpoints Disponíveis</h3>
        
        <div className="space-y-4">
          {CATEGORIES.map((category) => (
            <div key={category.name} className="border border-border-dark rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
                className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] hover:bg-[#222] transition-all"
              >
                <span className="text-white font-bold flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
                  <span className="text-slate-500 font-normal text-sm">({category.endpoints.length})</span>
                </span>
                <span className="text-slate-400">{activeCategory === category.name ? '▼' : '▶'}</span>
              </button>
              
              {activeCategory === category.name && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.endpoints.map((ep, i) => (
                    <div
                      key={i}
                      onClick={() => selectEndpoint(ep)}
                      className="flex items-center gap-3 p-3 bg-[#252525] rounded-lg cursor-pointer hover:bg-[#2a2a2a] transition-all"
                    >
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ep.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ep.method}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-mono text-xs truncate">{ep.path}</p>
                        <p className="text-slate-500 text-xs">{ep.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 border-t border-border-dark/50 pt-6 text-center">
        <p className="text-sm text-slate-600">© 2025 GO-API todos direitos reservados.</p>
      </div>
    </Layout>
  );
}
