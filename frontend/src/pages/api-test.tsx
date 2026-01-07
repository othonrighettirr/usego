import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import Swal from 'sweetalert2';

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
      { method: 'GET', path: '/api/contacts', desc: 'Listar todos os contatos' },
      { method: 'GET', path: '/api/contacts/groups', desc: 'Listar todos os grupos' },
      { method: 'GET', path: '/api/contacts/newsletters', desc: 'Listar canais seguidos' },
    ],
  },
  {
    name: 'Newsletter / Canais',
    icon: '📢',
    endpoints: [
      { method: 'GET', path: '/api/newsletter', desc: 'Listar newsletters/canais' },
    ],
  },
];

// Detecta se deve usar proxy interno (evita CORS) ou API direta
const getApiConfig = () => {
  if (typeof window === 'undefined') return { useProxy: false, baseUrl: '' };
  const currentHost = window.location.hostname;
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return { useProxy: false, baseUrl: 'http://localhost:3001' };
  }
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
    if (typeof window !== 'undefined') {
      const config = getApiConfig();
      setUseProxy(config.useProxy);
      setBaseUrl(config.baseUrl);
    }
    
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
      let url: string;
      if (useProxy) {
        const cleanPath = path.startsWith('/api/') ? path.slice(5) : path.slice(1);
        url = `/api/proxy/${cleanPath}`;
      } else {
        url = `${baseUrl}${path}`;
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
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
      Swal.fire({
        icon: 'warning',
        title: 'API Key necessária',
        text: 'Selecione uma instância com API Key válida',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    
    setTesting(true);
    setResults([]);
    
    const allEndpoints = CATEGORIES.flatMap(c => c.endpoints).filter(e => e.method === 'GET');
    const total = allEndpoints.length;
    const newResults: TestResult[] = [];
    
    // Mostrar SweetAlert com progresso
    Swal.fire({
      title: 'Testando Endpoints',
      html: `
        <div style="margin-top: 20px;">
          <div style="background: #2a2a2a; border-radius: 10px; height: 20px; overflow: hidden; margin-bottom: 15px;">
            <div id="progress-bar" style="background: linear-gradient(90deg, #f59e0b, #ea580c); height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 10px;"></div>
          </div>
          <p id="progress-text" style="color: #94a3b8; font-size: 14px;">Iniciando testes...</p>
          <p id="progress-percent" style="color: #f59e0b; font-size: 24px; font-weight: bold; margin-top: 10px;">0%</p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    for (let i = 0; i < allEndpoints.length; i++) {
      const ep = allEndpoints[i];
      const result = await testEndpoint(ep.method, ep.path);
      newResults.push(result);
      setResults([...newResults]);
      
      // Atualizar progresso
      const percent = Math.round(((i + 1) / total) * 100);
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      const progressPercent = document.getElementById('progress-percent');
      
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressText) progressText.textContent = `Testando: ${ep.path}`;
      if (progressPercent) progressPercent.textContent = `${percent}%`;
    }
    
    setTesting(false);
    
    const success = newResults.filter(r => r.status === 'success').length;
    const failed = newResults.filter(r => r.status === 'error').length;
    
    // Mostrar resultado final
    Swal.fire({
      icon: failed === 0 ? 'success' : 'warning',
      title: failed === 0 ? 'Todos os testes passaram!' : 'Testes concluídos',
      html: `
        <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #22c55e;">${success}</div>
            <div style="color: #94a3b8; font-size: 14px;">Sucesso</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #ef4444;">${failed}</div>
            <div style="color: #94a3b8; font-size: 14px;">Falhas</div>
          </div>
        </div>
        <p style="color: #94a3b8; margin-top: 20px; font-size: 14px;">Total de ${total} endpoints testados</p>
      `,
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Ver Resultados',
    });
  };

  const runCustomTest = async () => {
    if (!apiKey || !customEndpoint) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Preencha API Key e Endpoint',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    
    let body = undefined;
    if (customBody && customMethod !== 'GET') {
      try {
        body = JSON.parse(customBody);
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'JSON inválido',
          text: 'Verifique o formato do body',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#f59e0b',
        });
        return;
      }
    }
    
    setTesting(true);
    
    Swal.fire({
      title: 'Enviando requisição...',
      allowOutsideClick: false,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#fff',
      didOpen: () => { Swal.showLoading(); }
    });
    
    const result = await testEndpoint(customMethod, customEndpoint, body);
    setResults([result]);
    setTesting(false);
    
    Swal.fire({
      icon: result.status === 'success' ? 'success' : 'error',
      title: result.status === 'success' ? 'Sucesso!' : 'Erro',
      html: `
        <div style="text-align: left; margin-top: 15px;">
          <p style="color: #94a3b8; font-size: 14px;"><strong>Endpoint:</strong> ${result.endpoint}</p>
          <p style="color: #94a3b8; font-size: 14px;"><strong>Status:</strong> <span style="color: ${result.status === 'success' ? '#22c55e' : '#ef4444'}">${result.statusCode || 'Erro'}</span></p>
          <p style="color: #94a3b8; font-size: 14px;"><strong>Tempo:</strong> ${result.time}ms</p>
        </div>
      `,
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#f59e0b',
    });
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
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">Testar Endpoints</h2>
        <p className="text-slate-400 text-lg">Teste todos os endpoints da API com sua API Key.</p>
      </div>

      {/* Configuração */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">settings</span>
          Configuração
        </h3>
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
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            Teste Rápido
          </h3>
          <button
            onClick={runAllTests}
            disabled={testing || !apiKey}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            {testing ? 'Testando...' : 'Testar Todos'}
          </button>
        </div>
        <p className="text-slate-400 text-sm">Testa automaticamente todos os endpoints GET disponíveis.</p>
      </div>

      {/* Teste Customizado */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">tune</span>
          Teste Customizado
        </h3>
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
          <span className="material-symbols-outlined">send</span>
          Enviar Requisição
        </button>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden mb-6">
          <div className="p-4 border-b border-border-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">analytics</span>
            <h3 className="text-xl font-bold text-white">Resultados</h3>
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
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400">list</span>
          Endpoints Disponíveis
        </h3>
        
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
                <span className="material-symbols-outlined text-slate-400">
                  {activeCategory === category.name ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              
              {activeCategory === category.name && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.endpoints.map((ep, i) => (
                    <div
                      key={i}
                      onClick={() => selectEndpoint(ep)}
                      className="flex items-center gap-3 p-3 bg-[#252525] rounded-lg cursor-pointer hover:bg-[#2a2a2a] hover:border-primary/30 border border-transparent transition-all"
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