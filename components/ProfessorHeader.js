import { useRouter } from "next/router";
import { safeRemoveItem } from '../lib/storage';

export default function ProfessorHeader({ usuario }) {
  const router = useRouter();

  const handleLogout = () => {
    safeRemoveItem("token");
    safeRemoveItem("usuario");
    router.push("/login");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">EAD IGEPPS - Professor</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700"><strong>{usuario?.nomeCompleto || usuario?.nome}</strong></span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">👨‍🏫 Professor</span>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
