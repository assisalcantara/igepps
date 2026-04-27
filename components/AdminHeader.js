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
          <div className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center transition-all duration-300" style={{ width: 'var(--sidebar-width, 256px)', height: '64px', marginLeft: 'calc(-1 * var(--sidebar-width, 256px))' }}>
            <img src="/images/igepps-logo.png" alt="IGEPPS" className="h-12 w-auto" />
          </div>
          <div className="pl-6">
            <h1 className="text-2xl font-bold text-gray-900">IGEPPS Academy</h1>
            <p className="text-sm text-gray-500 -mt-1">Dashboard Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{usuario?.nomeCompleto || usuario?.nome}</span>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-semibold text-blue-700">Admin</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
