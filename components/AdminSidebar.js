import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function AdminSidebar() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isActive = (path) => router.pathname === path;
  
  const MenuItem = ({ href, icon, label, badge }) => (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative
        ${isActive(href) 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 shadow-lg font-semibold' 
          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }
      `}
      title={isCollapsed ? label : ''}
    >
      <span className="text-xl min-w-[24px] flex items-center justify-center">{icon}</span>
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && badge && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );

  const SectionTitle = ({ children }) => {
    if (isCollapsed) return <div className="h-px bg-slate-700 my-4"></div>;
    return (
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mt-6 mb-2">
        {children}
      </h3>
    );
  };

  return (
    <aside className={`bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">IGEPPS Academy</h2>
              <p className="text-gray-400 text-xs">Painel Admin</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <span className="text-2xl">🎓</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-slate-700 rounded-lg transition-colors ${isCollapsed ? 'absolute top-6 right-2' : ''}`}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 97px)' }}>
        <SectionTitle>Menu Principal</SectionTitle>
        <div className="space-y-1">
          <MenuItem href="/admin/dashboard" icon="📊" label="Dashboard" />
        </div>

        <SectionTitle>Gestão de Usuários</SectionTitle>
        <div className="space-y-1">
          <MenuItem href="/admin/usuarios" icon="👤" label="Usuários" />
          <MenuItem href="/admin/professores" icon="🎓" label="Professores" />
          <MenuItem href="/admin/alunos" icon="📚" label="Alunos" />
        </div>

        <SectionTitle>Conteúdo</SectionTitle>
        <div className="space-y-1">
          <MenuItem href="/admin/cursos" icon="📖" label="Cursos" />
          <MenuItem href="/admin/slider" icon="🖼️" label="Banner/Slider" />
          <MenuItem href="/admin/blog" icon="📰" label="Notícias" />
        </div>

        <SectionTitle>Comunicação</SectionTitle>
        <div className="space-y-1">
          <MenuItem href="/admin/forum" icon="💬" label="Fórum" />
          <MenuItem href="/admin/emails" icon="✉️" label="E-mails" />
          <MenuItem href="/admin/avaliacoes" icon="⭐" label="Avaliações" />
          <MenuItem href="/admin/documentos" icon="📤" label="Documentos" />
        </div>
      </nav>
    </aside>
  );
}