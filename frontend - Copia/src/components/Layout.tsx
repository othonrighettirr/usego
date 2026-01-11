import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/auth';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  external?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/instances', label: 'Instâncias', icon: 'smartphone' },
  { href: '/contacts', label: 'Grupos', icon: 'groups' },
];

const systemItems: NavItem[] = [
  { href: '/docs', label: 'Documentação', icon: 'description' },
  { href: '/api-test', label: 'Testar Endpoints', icon: 'science' },
  { href: '/messages', label: 'Testar Envios', icon: 'send' },
  { href: 'https://usego.com.br/members/chat', label: 'Suporte', icon: 'support_agent', external: true },
];

// Contribution Banner Component
const ContributionBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50 transition-all duration-300 opacity-100 translate-y-0">
      <div className="relative flex items-center gap-4 px-5 py-4 bg-[#1a1a1a] border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 min-w-[320px] max-w-[420px]">
        {/* Icon */}
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-black text-xl">volunteer_activism</span>
        </div>
        
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">Faça sua Contribuição</h4>
          <p className="text-slate-400 text-xs mt-0.5">Com sua ajuda o time GO cresce cada vez mais.</p>
        </div>
        
        {/* Button */}
        <a
          href="https://usego.com.br/members/payments"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-4 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold text-sm rounded-xl transition-all whitespace-nowrap"
        >
          Contribuir Agora
        </a>
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-surface-light border border-border-dark flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-dark transition-all"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-border-dark bg-[#111111] md:flex">
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border-dark/50">
          <img
            src="/img/logosite.png"
            alt="GO-API Logo"
            className="h-10 w-auto"
          />
          <span className="text-xs font-bold text-primary/70 bg-primary/10 px-2 py-1 rounded">V1</span>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col justify-between px-4 py-6">
          <nav className="space-y-1.5">
            <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu Principal
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow'
                    : 'text-slate-400 hover:bg-surface-light hover:text-white'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isActive(item.href)
                      ? 'fill-icon'
                      : 'text-slate-500 group-hover:text-primary transition-colors'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}

            <div className="my-4 border-t border-border-dark/50" />

            <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sistema
            </div>
            {systemItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-surface-light hover:text-white"
                >
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">
                    {item.icon}
                  </span>
                  {item.label}
                  <span className="material-symbols-outlined text-xs ml-auto text-slate-600">open_in_new</span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow'
                      : 'text-slate-400 hover:bg-surface-light hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* User Card */}
          <div className="rounded-2xl bg-surface-light/50 border border-border-dark p-4 mt-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-orange-600 p-[2px] shadow-lg shadow-orange-500/10">
                <div className="h-full w-full rounded-full bg-[#111111] flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">person</span>
                </div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">Administrador</span>
                <span className="text-xs text-primary truncate">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto text-slate-500 hover:text-white transition-colors"
                title="Sair"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background-dark relative">
        <div className="fixed top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="fixed bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[100px]" />

        <div className="container mx-auto max-w-7xl px-6 py-10 md:px-10">{children}</div>
      </main>

      {/* Contribution Banner */}
      <ContributionBanner />
    </div>
  );
}
