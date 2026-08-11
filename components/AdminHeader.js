import { useRouter } from "next/router";
import { safeRemoveItem } from '../lib/storage';

export default function AdminHeader({ usuario }) {
  const router = useRouter();
  const handleLogout = () => {
    safeRemoveItem("token");
    safeRemoveItem("usuario");
    router.push("/");
  };
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 right-0 h-16 z-10 transition-all duration-300" style={{ left: '0' }}>
      <div className="flex items-center justify-between h-16" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center transition-all duration-300 px-4" style={{ width: 'var(--sidebar-width, 256px)', height: '64px', marginLeft: 'calc(-1 * var(--sidebar-width, 256px))' }}>
            <img src="/images/igepps-logo2.png" alt="EDEP" className="h-10 w-auto" />
          </div>
          <div className="pl-6">
            <h1 className="text-2xl font-bold text-gray-900">EDEP</h1>
            <p className="text-sm text-gray-500 -mt-1">Escola Digital de Educação Previdenciária — Painel Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-6">
          {/* Avatar com as Iniciais + Nome do Usuário */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 via-blue-800 to-slate-900 text-yellow-400 font-bold text-xs flex items-center justify-center border border-yellow-400/40 shadow-inner">
              {(usuario?.nomeCompleto || usuario?.nome || 'Admin').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {usuario?.nomeCompleto || usuario?.nome || 'Admin Sistema'}
              </span>
            </div>
          </div>

          {/* Badge de Perfil Admin */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm border border-yellow-300">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            <span>Administrador</span>
          </div>

          {/* Botão Sair Estilizado com Ícone */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200/80 px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-sm group"
            title="Encerrar Sessão Administrativa"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
