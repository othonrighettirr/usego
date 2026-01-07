import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface Instance { id: string; name: string; status: string; }
interface Group { id: string; name: string; participants: number; }
interface Newsletter { id: string; name: string; description: string; subscribers: number; picture: string | null; }

type TabType = 'groups' | 'channels';

export default function Contacts() {
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/instances').then(({ data }) => {
      const arr = Array.isArray(data) ? data : [];
      setInstances(arr);
      const conn = arr.filter((i: Instance) => i.status === 'CONNECTED');
      if (conn.length > 0) setSelectedInstance(conn[0].id);
      else if (arr.length > 0) setSelectedInstance(arr[0].id);
    }).catch(() => setInstances([]));
  }, []);

  useEffect(() => {
    if (!selectedInstance) return;
    setLoading(true);
    
    if (activeTab === 'groups') {
      setGroups([]);
      api.get(`/instances/${selectedInstance}/contacts/groups`)
        .then(({ data }) => setGroups(data.groups || []))
        .catch(() => setGroups([]))
        .finally(() => setLoading(false));
    } else {
      setNewsletters([]);
      api.get(`/instances/${selectedInstance}/contacts/newsletters`)
        .then(({ data }) => setNewsletters(data.newsletters || []))
        .catch(() => setNewsletters([]))
        .finally(() => setLoading(false));
    }
  }, [selectedInstance, activeTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({ icon: 'success', title: 'Copiado!', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.id.includes(searchTerm)
  );

  const filteredNewsletters = newsletters.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) || n.id.includes(searchTerm)
  );

  const currentStatus = instances.find(i => i.id === selectedInstance)?.status === 'CONNECTED' ? '🟢 Online' : '🔴 Offline';

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
          {activeTab === 'groups' ? 'Grupos' : 'Canais'}
        </h2>
        <p className="text-slate-400 text-lg font-light">
          {activeTab === 'groups' 
            ? 'Visualize e gerencie os grupos das suas instâncias.'
            : 'Visualize os canais (newsletters) que você segue.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('groups'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'groups'
              ? 'bg-primary text-white'
              : 'bg-surface-dark text-slate-400 hover:text-white border border-border-dark'
          }`}
        >
          <span className="material-symbols-outlined text-xl">groups</span>
          Grupos
        </button>
        <button
          onClick={() => { setActiveTab('channels'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'channels'
              ? 'bg-primary text-white'
              : 'bg-surface-dark text-slate-400 hover:text-white border border-border-dark'
          }`}
        >
          <span className="material-symbols-outlined text-xl">campaign</span>
          Canais
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border-dark bg-surface-dark p-5">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${activeTab === 'groups' ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600'} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-2xl">
                {activeTab === 'groups' ? 'groups' : 'campaign'}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                {activeTab === 'groups' ? 'Total de Grupos' : 'Total de Canais'}
              </p>
              <p className="text-2xl font-bold text-white">
                {activeTab === 'groups' ? groups.length : newsletters.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border-dark bg-surface-dark p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">person</span>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                {activeTab === 'groups' ? 'Total de Participantes' : 'Total de Inscritos'}
              </p>
              <p className="text-2xl font-bold text-white">
                {activeTab === 'groups' 
                  ? groups.reduce((acc, g) => acc + g.participants, 0)
                  : newsletters.reduce((acc, n) => acc + n.subscribers, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border-dark bg-surface-dark p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">wifi</span>
            </div>
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <p className="text-2xl font-bold text-white">{currentStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Instância</label>
            <select value={selectedInstance} onChange={(e) => setSelectedInstance(e.target.value)} className="w-full h-12 px-4 bg-[#2a2a2a] text-white border border-[#444] rounded-xl focus:outline-none focus:border-primary">
              {instances.length === 0 && <option value="">Nenhuma instância</option>}
              {instances.map((i) => (<option key={i.id} value={i.id}>{i.name} {i.status === 'CONNECTED' ? '🟢' : '🔴'}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pesquisar</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input 
                type="text" 
                placeholder={activeTab === 'groups' ? 'Buscar grupo...' : 'Buscar canal...'} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full h-12 pl-12 pr-4 bg-[#2a2a2a] text-white placeholder-gray-500 border border-[#444] rounded-xl focus:outline-none focus:border-primary" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Carregando {activeTab === 'groups' ? 'grupos' : 'canais'}...</p>
          </div>
        ) : activeTab === 'groups' ? (
          /* Groups List */
          filteredGroups.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">group_off</span>
              <p className="text-slate-400">{groups.length === 0 ? 'Nenhum grupo encontrado' : 'Nenhum grupo corresponde à pesquisa'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {filteredGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-5 hover:bg-surface-light/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-indigo-400">group</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold truncate">{group.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]" title={group.id}>{group.id}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400">{group.participants} participantes</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(group.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all ml-4 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                    <span className="text-sm font-medium hidden sm:inline">Copiar ID</span>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Newsletters/Channels List */
          filteredNewsletters.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">campaign</span>
              <p className="text-slate-400">{newsletters.length === 0 ? 'Nenhum canal encontrado' : 'Nenhum canal corresponde à pesquisa'}</p>
              {newsletters.length === 0 && (
                <p className="text-slate-500 text-sm mt-2">Siga canais no WhatsApp para vê-los aqui</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border-dark">
              {filteredNewsletters.map((newsletter) => (
                <div key={newsletter.id} className="flex items-center justify-between p-5 hover:bg-surface-light/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 flex-shrink-0 overflow-hidden">
                      {newsletter.picture ? (
                        <img src={newsletter.picture} alt={newsletter.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-purple-400">campaign</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold truncate">{newsletter.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]" title={newsletter.id}>{newsletter.id}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400">{newsletter.subscribers.toLocaleString()} inscritos</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(newsletter.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all ml-4 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                    <span className="text-sm font-medium hidden sm:inline">Copiar ID</span>
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div className="mt-4 text-sm text-slate-500 text-right">
        {activeTab === 'groups' 
          ? `${filteredGroups.length} grupo(s)` 
          : `${filteredNewsletters.length} canal(is)`}
      </div>

      <div className="mt-12 border-t border-border-dark/50 pt-6 text-center">
        <p className="text-sm text-slate-600">© 2025 GO-API todos direitos reservados.</p>
      </div>
    </Layout>
  );
}
