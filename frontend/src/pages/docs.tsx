import { useState } from 'react';
import Layout from '@/components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goapi-go-api.pdjn0h.easypanel.host';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  body?: string;
  headers?: string;
  response?: string;
  examples?: { lang: string; code: string }[];
}

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  endpoints: Endpoint[];
}

const sections: Section[] = [
  {
    id: 'auth',
    title: 'Autenticação',
    icon: 'lock',
    color: 'blue',
    description: 'Login e gerenciamento de tokens JWT',
    endpoints: [
      { method: 'POST', path: '/auth/login', description: 'Fazer login e obter token JWT', body: '{\n  "email": "seu@email.com",\n  "password": "sua_senha"\n}', response: '{\n  "access_token": "eyJhbGciOiJIUzI1NiIs...",\n  "user": { "id": "uuid", "email": "seu@email.com" }\n}',
        examples: [
          { lang: 'cURL', code: `curl -X POST "${API_URL}/auth/login" -H "Content-Type: application/json" -d '{"email": "seu@email.com", "password": "sua_senha"}'` },
          { lang: 'JavaScript', code: `await fetch("${API_URL}/auth/login", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ email: "seu@email.com", password: "sua_senha" })\n});` },
        ]
      },
      { method: 'POST', path: '/auth/register', description: 'Registrar novo usuário', body: '{\n  "email": "novo@email.com",\n  "password": "senha_segura",\n  "name": "Nome"\n}' },
      { method: 'POST', path: '/auth/shared-token', description: 'Criar token compartilhado para QR Code', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "expiresInHours": 24\n}' },
    ],
  },
  {
    id: 'instances',
    title: 'Instâncias',
    icon: 'smartphone',
    color: 'green',
    description: 'Gerenciamento de conexões WhatsApp',
    endpoints: [
      { method: 'GET', path: '/instances', description: 'Listar todas as instâncias', headers: 'Authorization: Bearer {token}' },
      { method: 'POST', path: '/instances', description: 'Criar nova instância', headers: 'Authorization: Bearer {token}', body: '{\n  "name": "Minha Instância"\n}' },
      { method: 'GET', path: '/instances/:id', description: 'Buscar detalhes de uma instância', headers: 'Authorization: Bearer {token}' },
      { method: 'PUT', path: '/instances/:id', description: 'Atualizar nome da instância', headers: 'Authorization: Bearer {token}', body: '{\n  "name": "Novo Nome"\n}' },
      { method: 'DELETE', path: '/instances/:id', description: 'Deletar instância', headers: 'Authorization: Bearer {token}' },
      { method: 'GET', path: '/instances/:id/qr', description: 'Obter QR Code (base64)', headers: 'Authorization: Bearer {token}' },
      { method: 'POST', path: '/instances/:id/connect', description: 'Iniciar conexão', headers: 'Authorization: Bearer {token}' },
      { method: 'POST', path: '/instances/:id/disconnect', description: 'Desconectar (logout)', headers: 'Authorization: Bearer {token}' },
      { method: 'POST', path: '/instances/:id/restart', description: 'Reiniciar sem QR', headers: 'Authorization: Bearer {token}' },
    ],
  },
  {
    id: 'messages-jwt',
    title: 'Mensagens (JWT)',
    icon: 'chat',
    color: 'purple',
    description: 'Envio de mensagens com autenticação JWT',
    endpoints: [
      { method: 'POST', path: '/messages/text', description: 'Enviar texto', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "text": "Olá!"\n}',
        examples: [
          { lang: 'cURL', code: `curl -X POST "${API_URL}/messages/text" -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"instanceId": "uuid", "to": "5511999999999", "text": "Olá!"}'` },
          { lang: 'JavaScript', code: `await fetch("${API_URL}/messages/text", {\n  method: "POST",\n  headers: { "Authorization": "Bearer TOKEN", "Content-Type": "application/json" },\n  body: JSON.stringify({ instanceId: "uuid", to: "5511999999999", text: "Olá!" })\n});` },
        ]
      },
      { method: 'POST', path: '/messages/image', description: 'Enviar imagem', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "imageUrl": "https://...",\n  "caption": "Legenda"\n}' },
      { method: 'POST', path: '/messages/audio', description: 'Enviar áudio', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "audioUrl": "https://...",\n  "ptt": true\n}' },
      { method: 'POST', path: '/messages/video', description: 'Enviar vídeo', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "videoUrl": "https://...",\n  "caption": "Legenda"\n}' },
      { method: 'POST', path: '/messages/document', description: 'Enviar documento', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "documentUrl": "https://...",\n  "filename": "arquivo.pdf"\n}' },
      { method: 'POST', path: '/messages/contact', description: 'Enviar contato', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "contactName": "João",\n  "contactPhone": "5511988887777"\n}' },
      { method: 'POST', path: '/messages/location', description: 'Enviar localização', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "latitude": -23.5505,\n  "longitude": -46.6333\n}' },
      { method: 'POST', path: '/messages/poll', description: 'Enviar enquete', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "to": "5511999999999",\n  "question": "Pergunta?",\n  "options": ["Op1", "Op2"]\n}' },
    ],
  },
  {
    id: 'api-key',
    title: 'API Externa (API Key)',
    icon: 'key',
    color: 'amber',
    description: 'Envio de mensagens usando API Key da instância',
    endpoints: [
      { method: 'POST', path: '/api/send/text', description: 'Enviar texto', headers: 'x-api-key: {api_key}', body: '{\n  "to": "5511999999999",\n  "text": "Olá!"\n}',
        examples: [
          { lang: 'cURL', code: `curl -X POST "${API_URL}/api/send/text" -H "x-api-key: SUA_API_KEY" -H "Content-Type: application/json" -d '{"to": "5511999999999", "text": "Olá!"}'` },
          { lang: 'PHP', code: `<?php\n$ch = curl_init("${API_URL}/api/send/text");\ncurl_setopt($ch, CURLOPT_POST, true);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["to" => "5511999999999", "text" => "Olá!"]));\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["x-api-key: SUA_API_KEY", "Content-Type: application/json"]);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);` },
          { lang: 'Python', code: `import requests\nresponse = requests.post("${API_URL}/api/send/text", headers={"x-api-key": "SUA_API_KEY"}, json={"to": "5511999999999", "text": "Olá!"})` },
        ]
      },
      { method: 'POST', path: '/api/send/image', description: 'Enviar imagem', headers: 'x-api-key: {api_key}', body: '{\n  "to": "5511999999999",\n  "imageUrl": "https://...",\n  "caption": "Legenda"\n}' },
      { method: 'POST', path: '/api/send/audio', description: 'Enviar áudio', headers: 'x-api-key: {api_key}', body: '{\n  "to": "5511999999999",\n  "audioUrl": "https://...",\n  "ptt": true\n}' },
      { method: 'POST', path: '/api/send/video', description: 'Enviar vídeo', headers: 'x-api-key: {api_key}', body: '{\n  "to": "5511999999999",\n  "videoUrl": "https://...",\n  "caption": "Legenda"\n}' },
      { method: 'POST', path: '/api/send/document', description: 'Enviar documento', headers: 'x-api-key: {api_key}', body: '{\n  "to": "5511999999999",\n  "documentUrl": "https://...",\n  "filename": "arquivo.pdf"\n}' },
      { method: 'POST', path: '/api/send/sticker', description: 'Enviar sticker', headers: 'x-api-key: {api_key}', body: '{\n  "to": "5511999999999",\n  "stickerUrl": "https://..."\n}' },
    ],
  },
  {
    id: 'groups',
    title: 'Grupos',
    icon: 'groups',
    color: 'indigo',
    description: 'Gerenciamento de grupos WhatsApp',
    endpoints: [
      { method: 'GET', path: '/instances/:id/contacts/groups', description: 'Listar grupos', headers: 'Authorization: Bearer {token}' },
      { method: 'POST', path: '/api/group/create', description: 'Criar grupo', headers: 'x-api-key: {api_key}', body: '{\n  "name": "Meu Grupo",\n  "participants": ["5511999999999"]\n}' },
      { method: 'POST', path: '/api/group/add', description: 'Adicionar participantes', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us",\n  "participants": ["5511999999999"]\n}' },
      { method: 'POST', path: '/api/group/remove', description: 'Remover participantes', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us",\n  "participants": ["5511999999999"]\n}' },
      { method: 'POST', path: '/api/group/promote', description: 'Promover a admin', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us",\n  "participants": ["5511999999999"]\n}' },
      { method: 'POST', path: '/api/group/demote', description: 'Rebaixar admin', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us",\n  "participants": ["5511999999999"]\n}' },
      { method: 'POST', path: '/api/group/subject', description: 'Alterar nome', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us",\n  "subject": "Novo Nome"\n}' },
      { method: 'POST', path: '/api/group/description', description: 'Alterar descrição', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us",\n  "description": "Nova descrição"\n}' },
      { method: 'GET', path: '/api/group/:groupId/invite', description: 'Obter link de convite', headers: 'x-api-key: {api_key}' },
      { method: 'POST', path: '/api/group/leave', description: 'Sair do grupo', headers: 'x-api-key: {api_key}', body: '{\n  "groupId": "120363...@g.us"\n}' },
      { method: 'POST', path: '/api/send/mention', description: 'Enviar com menções', headers: 'x-api-key: {api_key}', body: '{\n  "to": "120363...@g.us",\n  "text": "Olá @João!",\n  "mentions": ["5511999999999"]\n}' },
    ],
  },
  {
    id: 'newsletter',
    title: 'Newsletter/Canais',
    icon: 'campaign',
    color: 'pink',
    description: 'Gerenciamento completo de canais/newsletters do WhatsApp',
    endpoints: [
      { method: 'GET', path: '/api/newsletter', description: 'Informações sobre endpoints disponíveis', headers: 'x-api-key: {api_key}' },
      { method: 'GET', path: '/api/newsletter/:newsletterId', description: 'Buscar metadados de uma newsletter', headers: 'x-api-key: {api_key}' },
      { method: 'GET', path: '/api/newsletter/:newsletterId/subscribers', description: 'Obter número de inscritos', headers: 'x-api-key: {api_key}' },
      { method: 'GET', path: '/api/newsletter/:newsletterId/messages', description: 'Buscar mensagens da newsletter', headers: 'x-api-key: {api_key}' },
      { method: 'POST', path: '/api/newsletter/create', description: 'Criar nova newsletter', headers: 'x-api-key: {api_key}', body: '{\n  "name": "Meu Canal",\n  "description": "Descrição do canal"\n}',
        examples: [
          { lang: 'cURL', code: `curl -X POST "${API_URL}/api/newsletter/create" -H "x-api-key: SUA_API_KEY" -H "Content-Type: application/json" -d '{"name": "Meu Canal", "description": "Descrição"}'` },
        ]
      },
      { method: 'POST', path: '/api/newsletter/follow', description: 'Seguir uma newsletter', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter"\n}' },
      { method: 'POST', path: '/api/newsletter/unfollow', description: 'Deixar de seguir newsletter', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter"\n}' },
      { method: 'POST', path: '/api/newsletter/mute', description: 'Silenciar notificações', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter"\n}' },
      { method: 'POST', path: '/api/newsletter/unmute', description: 'Dessilenciar notificações', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter"\n}' },
      { method: 'POST', path: '/api/newsletter/text', description: 'Enviar texto (admin)', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter",\n  "text": "Nova atualização!"\n}',
        examples: [
          { lang: 'cURL', code: `curl -X POST "${API_URL}/api/newsletter/text" -H "x-api-key: SUA_API_KEY" -H "Content-Type: application/json" -d '{"newsletterId": "120363...@newsletter", "text": "Olá seguidores!"}'` },
          { lang: 'JavaScript', code: `await fetch("${API_URL}/api/newsletter/text", {\n  method: "POST",\n  headers: { "x-api-key": "SUA_API_KEY", "Content-Type": "application/json" },\n  body: JSON.stringify({ newsletterId: "120363...@newsletter", text: "Olá!" })\n});` },
        ]
      },
      { method: 'POST', path: '/api/newsletter/image', description: 'Enviar imagem (admin)', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter",\n  "imageUrl": "https://...",\n  "caption": "Legenda"\n}' },
      { method: 'POST', path: '/api/newsletter/video', description: 'Enviar vídeo (admin)', headers: 'x-api-key: {api_key}', body: '{\n  "newsletterId": "120363...@newsletter",\n  "videoUrl": "https://...",\n  "caption": "Legenda"\n}' },
    ],
  },
  {
    id: 'actions',
    title: 'Ações de Mensagem',
    icon: 'touch_app',
    color: 'cyan',
    description: 'Deletar, reagir e outras ações',
    endpoints: [
      { method: 'POST', path: '/api/message/delete', description: 'Deletar mensagem', headers: 'x-api-key: {api_key}', body: '{\n  "remoteJid": "5511999999999@s.whatsapp.net",\n  "messageId": "3EB0B430A...",\n  "forEveryone": true\n}' },
      { method: 'POST', path: '/api/message/react', description: 'Reagir com emoji', headers: 'x-api-key: {api_key}', body: '{\n  "remoteJid": "5511999999999@s.whatsapp.net",\n  "messageId": "3EB0B430A...",\n  "emoji": "👍"\n}' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrações',
    icon: 'extension',
    color: 'teal',
    description: 'Typebot, n8n e Chatwoot',
    endpoints: [
      { method: 'POST', path: '/integrations/typebot', description: 'Configurar Typebot', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "enabled": true,\n  "apiUrl": "https://typebot.io",\n  "publicName": "meu-bot"\n}' },
      { method: 'POST', path: '/integrations/n8n', description: 'Configurar n8n', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "enabled": true,\n  "webhookUrl": "https://n8n.../webhook"\n}' },
      { method: 'POST', path: '/integrations/chatwoot', description: 'Configurar Chatwoot', headers: 'Authorization: Bearer {token}', body: '{\n  "instanceId": "uuid",\n  "enabled": true,\n  "url": "https://chatwoot...",\n  "accountId": "1",\n  "token": "token"\n}' },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
};

export default function Docs() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['auth']);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('cURL');

  const toggleSection = (id: string) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-white mb-2">Documentação da API</h2>
        <p className="text-slate-400 text-lg font-light">Referência completa dos endpoints disponíveis</p>
      </div>

      {/* API Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="rounded-xl border border-border-dark bg-surface-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">link</span>
            <span className="text-sm text-slate-400">Base URL</span>
          </div>
          <code className="text-primary font-mono text-sm break-all">{API_URL}</code>
        </div>
        <div className="rounded-xl border border-border-dark bg-surface-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-blue-400">phone</span>
            <span className="text-sm text-slate-400">Telefone</span>
          </div>
          <code className="text-blue-400 font-mono text-sm">5511999999999</code>
        </div>
        <div className="rounded-xl border border-border-dark bg-surface-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-green-400">group</span>
            <span className="text-sm text-slate-400">ID Grupo</span>
          </div>
          <code className="text-green-400 font-mono text-sm">120363...@g.us</code>
        </div>
        <div className="rounded-xl border border-border-dark bg-surface-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-pink-400">campaign</span>
            <span className="text-sm text-slate-400">ID Newsletter</span>
          </div>
          <code className="text-pink-400 font-mono text-sm">120363...@newsletter</code>
        </div>
        <div className="rounded-xl border border-border-dark bg-surface-dark p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-400">key</span>
            <span className="text-sm text-slate-400">API Key</span>
          </div>
          <code className="text-amber-400 font-mono text-sm">x-api-key: KEY</code>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-400">warning</span>
          <div>
            <p className="text-amber-400 font-medium text-sm">Cada instância tem sua própria API Key</p>
            <p className="text-slate-400 text-xs mt-1">Encontre a API Key na página de Instâncias, ao lado do ID.</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const colors = colorClasses[section.color] || colorClasses.blue;
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <div key={section.id} className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-surface-light/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${colors.text} text-xl`}>{section.icon}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                    <p className="text-slate-500 text-sm">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 bg-surface-light px-2 py-1 rounded-lg">{section.endpoints.length} endpoints</span>
                  <span className={`material-symbols-outlined text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="border-t border-border-dark">
                  {section.endpoints.map((endpoint, idx) => {
                    const endpointId = `${section.id}-${idx}`;
                    const isEndpointExpanded = expandedEndpoint === endpointId;
                    
                    return (
                      <div key={idx} className="border-b border-border-dark/50 last:border-b-0">
                        {/* Endpoint Row */}
                        <button
                          onClick={() => setExpandedEndpoint(isEndpointExpanded ? null : endpointId)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-surface-light/20 transition-colors text-left"
                        >
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${methodColors[endpoint.method]}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-slate-300 font-mono text-sm flex-1">{endpoint.path}</code>
                          <span className="text-slate-500 text-sm hidden md:block">{endpoint.description}</span>
                          <span className={`material-symbols-outlined text-slate-600 text-lg transition-transform ${isEndpointExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {/* Endpoint Details */}
                        {isEndpointExpanded && (
                          <div className="px-4 pb-4 space-y-4 bg-[#0d0d0d]">
                            <p className="text-slate-400 text-sm md:hidden">{endpoint.description}</p>
                            
                            {endpoint.headers && (
                              <div>
                                <p className="text-xs text-slate-500 mb-2">Headers</p>
                                <code className="block p-3 bg-surface-dark rounded-lg text-xs text-slate-300 font-mono">{endpoint.headers}</code>
                              </div>
                            )}
                            
                            {endpoint.body && (
                              <div>
                                <p className="text-xs text-slate-500 mb-2">Body</p>
                                <pre className="p-3 bg-surface-dark rounded-lg text-xs text-slate-300 font-mono overflow-x-auto">{endpoint.body}</pre>
                              </div>
                            )}
                            
                            {endpoint.response && (
                              <div>
                                <p className="text-xs text-slate-500 mb-2">Response</p>
                                <pre className="p-3 bg-surface-dark rounded-lg text-xs text-green-400 font-mono overflow-x-auto">{endpoint.response}</pre>
                              </div>
                            )}

                            {endpoint.examples && endpoint.examples.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs text-slate-500">Exemplos</p>
                                  <div className="flex gap-1">
                                    {endpoint.examples.map((ex) => (
                                      <button
                                        key={ex.lang}
                                        onClick={(e) => { e.stopPropagation(); setSelectedLang(ex.lang); }}
                                        className={`px-2 py-1 rounded text-xs transition-colors ${selectedLang === ex.lang ? 'bg-primary text-black' : 'bg-surface-light text-slate-400 hover:text-white'}`}
                                      >
                                        {ex.lang}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {endpoint.examples.filter(ex => ex.lang === selectedLang).map((ex, i) => (
                                  <div key={i} className="relative">
                                    <pre className="p-3 bg-surface-dark rounded-lg text-xs text-slate-300 font-mono overflow-x-auto pr-12">{ex.code}</pre>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); copyCode(ex.code, `${endpointId}-${ex.lang}`); }}
                                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-light hover:bg-primary/20 text-slate-400 hover:text-primary transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">{copiedCode === `${endpointId}-${ex.lang}` ? 'check' : 'content_copy'}</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Swagger Link */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">api</span>
            <div>
              <p className="text-white font-semibold">Swagger UI</p>
              <p className="text-slate-400 text-sm">Documentação interativa completa</p>
            </div>
          </div>
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Abrir Swagger
          </a>
        </div>
      </div>

      <div className="mt-12 border-t border-border-dark/50 pt-6 text-center">
        <p className="text-sm text-slate-600">© 2025 GO-API todos direitos reservados.</p>
      </div>
    </Layout>
  );
}
