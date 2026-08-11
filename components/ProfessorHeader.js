import { useRouter } from "next/router";
import Link from "next/link";
import { safeRemoveItem } from '../lib/storage';

export default function ProfessorHeader({ usuario }) {
  const router = useRouter();

  const handleLogout = () => {
    safeRemoveItem("token");
    safeRemoveItem("usuario");
    router.push("/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white shadow-md border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
        <Link href="/professor/dashboard" className="flex items-center gap-3 group">
          <img src="/images/igepps-logo2.png" alt="EDEP" className="h-10 md:h-12 w-auto drop-shadow" />
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg md:text-xl leading-tight group-hover:text-yellow-400 transition">EDEP</span>
            <span className="text-blue-200 text-xs font-medium">Escola Digital de Educação Previdenciária</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-blue-100 text-sm font-medium">
            <strong>{usuario?.nomeCompleto || usuario?.nome}</strong>
          </span>
          <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            👨‍🏫 Professor
          </span>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
