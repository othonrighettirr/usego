import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface Instance {
  id: string;
  name: string;
  phone: string | null;
  profilePic: string | null;
  profileName: string | null;
  status: string;
  apiKey: string | null;
}

export default function Instances() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [search, setSearch] = useState('');
  const [qrModal, setQrModal] = useState<{ id: string; name: string; qr: string | null; connected: boolean; connecting: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState<Instance | null>(null);
  const [editName, setEditName] = useState('');
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);

  const loadInstances = async () => {
    try {
      const { data } = await api.get('/instances');
      setInstances(Array.isArray(data) ? data : []);
    } catch {
      setInstances([]);
    }
  };

  useEffect(() => {
    loadInstances();
    const interval = setInterval(loadInstances, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateQrCode = async (id: string, name: string) => {
    setQrModal({ id, name, qr: null, connected: false, connecting: false });
    try {
      await api.post(`/instances/${id}/connect`);
    } catch {}
    pollQrCode(id, name);
  };

  const pollQrCode = async (id: string, name: string) => {
    let shouldPoll = true;
    let pollCount = 0;
    const poll = async () => {
      if (!shouldPoll || pollCount >= 60) return;
      pollCount++;
      try {
        const { data } = await api.get(`/instances/${id}/qr`);
        if (data.qrCode) {
          setQrModal({ id, name, qr: data.qrCode, connected: false, connecting: false });
        }
        if (data.status === 'CONNECTED') {
          shouldPoll = false;
          setQrModal({ id, name, qr: null, connected: false, connecting: true });
          setTimeout(() => {
            setQrModal({ id, name, qr: null, connected: true, connecting: false });
            loadInstances();
            setTimeout(() => setQrModal(null), 2500);
          }, 1500);
          return;
        }
        if (shouldPoll) setTimeout(poll, 3000);
      } catch (error: any) {
        if (error.response?.status === 404) { shouldPoll = false; setQrModal(null); return; }
        if (shouldPoll) setTimeout(poll, 5000);
      }
    };
    poll();
  };

  const copyApiKey = (instanceId: string, apiKey: string | null) => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(instanceId);
    setTimeout(() => setCopiedApiKey(null), 2000);
  };

  const stopInstance = async (id: string) => {
    try {
      Swal.fire({
        title: 'Parando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#fff',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await api.post(`/instances/${id}/disconnect`);
      await loadInstances();
      
      Swal.fire({
        icon: 'success',
        title: 'Desconectado!',
        text: 'A instância foi desconectada.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || 'Não foi possível desconectar.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
    }
  };

  const restartInstance = async (id: string) => {
    try {
      // Mostrar loading
      Swal.fire({
        title: 'Reiniciando...',
        text: 'Aguarde enquanto a instância é reiniciada',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#fff',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await api.post(`/instances/${id}/restart`);
      await loadInstances();
      
      Swal.fire({
        icon: 'success',
        title: 'Reiniciado!',
        text: 'A instância foi reiniciada com sucesso. As novas configurações foram aplicadas.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao reiniciar',
        text: error.response?.data?.message || 'Não foi possível reiniciar a instância.',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
    }
  };

  const confirmDelete = async (instance: Instance) => {
    const result = await Swal.fire({
      title: 'Excluir Instância?',
      html: `Tem certeza que deseja excluir <strong class="text-primary">${instance.name}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: '#1a1a1a',
      color: '#fff',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/instances/${instance.id}`);
        await loadInstances();
        Swal.fire({ title: 'Excluído!', icon: 'success', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f59e0b' });
      } catch {
        Swal.fire({ title: 'Erro!', icon: 'error', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f59e0b' });
      }
    }
  };

  const openSettings = (instance: Instance) => router.push(`/settings/${instance.id}`);
  const openEdit = (instance: Instance) => { setShowEdit(instance); setEditName(instance.name); };
  const saveEditName = async () => {
    if (!showEdit || !editName.trim()) return;
    setLoading(true);
    try { await api.put(`/instances/${showEdit.id}`, { name: editName }); setShowEdit(null); await loadInstances(); } catch {}
    setLoading(false);
  };

  const filteredInstances = instances.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white mb-2">Gerenciamento de Instâncias</h2>
        <p className="text-slate-400">Controle e monitore suas conexões WhatsApp.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 rounded-2xl border border-border-dark bg-surface-dark p-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input type="text" placeholder="Buscar instância..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-transparent py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none" />
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-4">Editar Nome</h3>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-xl border border-border-dark focus:border-primary focus:outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowEdit(null)} className="flex-1 py-2.5 rounded-xl border border-border-dark text-slate-400 hover:text-white">Cancelar</button>
              <button onClick={saveEditName} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary text-black font-bold hover:bg-primary-hover">
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl text-center w-full max-w-sm">
            {qrModal.connecting ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conectando...</h3>
              </>
            ) : qrModal.connected ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-4xl">check</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Conectado!</h3>
                <button onClick={() => setQrModal(null)} className="w-full py-2.5 rounded-xl bg-primary text-black font-bold mt-4">Fechar</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-4">{qrModal.qr ? 'Escaneie o QR Code' : 'Gerando QR Code...'}</h3>
                {qrModal.qr ? (
                  <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                    <img src={qrModal.qr} alt="QR Code" className="w-52 h-52" />
                  </div>
                ) : (
                  <div className="py-8"><div className="w-14 h-14 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                )}
                <button onClick={() => setQrModal(null)} className="w-full py-2.5 rounded-xl border border-border-dark text-slate-400 hover:text-white">Fechar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Instances Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInstances.map((instance) => (
          <div key={instance.id} className="rounded-2xl border border-primary/30 bg-[#0d0d0d] p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {instance.profilePic ? (
                    <img src={instance.profilePic} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-primary/30" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center border-2 border-border-dark">
                      <span className="material-symbols-outlined text-slate-500 text-2xl">person</span>
                    </div>
                  )}
                  {instance.status === 'CONNECTED' && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-[#0d0d0d]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{instance.name}</h3>
                    <button onClick={() => openEdit(instance)} className="text-slate-500 hover:text-primary">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </div>
                  {instance.phone ? (
                    <p className="text-primary font-medium">+{instance.phone}</p>
                  ) : (
                    <p className="text-slate-500 text-sm">Não conectado</p>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                instance.status === 'CONNECTED' ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
              }`}>
                <span className="relative flex h-2.5 w-2.5">
                  {instance.status === 'CONNECTED' && <span className="animate-ping absolute h-full w-full rounded-full bg-success opacity-75" />}
                  <span className={`relative rounded-full h-2.5 w-2.5 ${instance.status === 'CONNECTED' ? 'bg-success' : 'bg-danger'}`} />
                </span>
                <span className="text-xs font-bold uppercase">{instance.status === 'CONNECTED' ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* API Key Section */}
            <div className="mb-4">
              <p className="text-white font-semibold text-sm mb-2">APIKEY</p>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-[#1a1a1a]">
                <span className="material-symbols-outlined text-primary text-xl">key</span>
                <p className="flex-1 text-slate-300 font-mono text-sm truncate" title={instance.apiKey || ''}>
                  {instance.apiKey ? `${instance.apiKey.slice(0, 20)}...` : 'Sem API Key'}
                </p>
                <button onClick={() => copyApiKey(instance.id, instance.apiKey)}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all"
                  title="Copiar API Key">
                  <span className="material-symbols-outlined text-lg">{copiedApiKey === instance.id ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {instance.status === 'CONNECTED' ? (
              <div className="flex gap-3 mb-4">
                <button onClick={() => restartInstance(instance.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold hover:bg-primary hover:text-black transition-all">
                  <span className="material-symbols-outlined">refresh</span>
                  Reiniciar
                </button>
                <button onClick={() => stopInstance(instance.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 bg-danger/10 text-danger font-bold hover:bg-danger hover:text-white transition-all">
                  <span className="material-symbols-outlined">stop_circle</span>
                  Parar
                </button>
              </div>
            ) : (
              <button onClick={() => generateQrCode(instance.id, instance.name)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold hover:bg-primary hover:text-black transition-all mb-4">
                <span className="material-symbols-outlined">qr_code_2</span>
                Gerar QR Code
              </button>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-3">
              <button onClick={() => openSettings(instance)}
                className="flex-1 flex items-center justify-center py-3 rounded-xl bg-surface-light text-slate-400 hover:text-white transition-all">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <button onClick={() => {
                const link = `${window.location.origin}/qr/${instance.id}`;
                navigator.clipboard.writeText(link);
                Swal.fire({ title: 'Link copiado!', icon: 'success', timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' });
              }} className="flex-1 flex items-center justify-center py-3 rounded-xl bg-surface-light text-slate-400 hover:text-white transition-all">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button onClick={() => confirmDelete(instance)}
                className="flex-1 flex items-center justify-center py-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}

        {/* Add Instance Card */}
        <div onClick={() => {
          Swal.fire({
            title: 'Nova Instância',
            input: 'text',
            inputPlaceholder: 'Nome da instância',
            showCancelButton: true,
            confirmButtonText: 'Criar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#f59e0b',
            background: '#1a1a1a',
            color: '#fff',
            inputValidator: (value: string) => !value ? 'Digite um nome' : null
          }).then(async (result: { isConfirmed: boolean; value?: string }) => {
            if (result.isConfirmed && result.value) {
              try {
                await api.post('/instances', { name: result.value });
                await loadInstances();
                Swal.fire({ title: 'Criado!', icon: 'success', timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' });
              } catch {
                Swal.fire({ title: 'Erro!', icon: 'error', background: '#1a1a1a', color: '#fff' });
              }
            }
          });
        }} className="rounded-2xl border-2 border-dashed border-border-dark bg-transparent p-6 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:border-primary/50 transition-all group">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-slate-500 text-3xl group-hover:text-primary">add</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Adicionar Instância</h3>
          <p className="text-slate-500 text-sm text-center">Crie uma nova conexão para começar.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-border-dark/50 pt-6 text-center">
        <p className="text-sm text-slate-600">© 2025 GO-API todos direitos reservados.</p>
      </div>
    </Layout>
  );
}
