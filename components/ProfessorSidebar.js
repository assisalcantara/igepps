import Link from "next/link";
import { useRouter } from "next/router";

export default function ProfessorSidebar() {
  const router = useRouter();
  const isActive = (path) => router.pathname === path ? "bg-blue-600 text-white" : "hover:bg-gray-100";

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <nav className="p-6 space-y-2">
        <h3 className="text-gray-500 text-xs font-bold uppercase mb-4">Menu</h3>

        <Link href="/professor/dashboard" className={`block px-4 py-2 rounded ${isActive("/professor/dashboard")}`}>
          📊 Dashboard
        </Link>

        <Link href="/professor/cursos" className={`block px-4 py-2 rounded ${isActive("/professor/cursos")}`}>
          📚 Meus Cursos
        </Link>

        <Link href="/professor/aulas" className={`block px-4 py-2 rounded ${isActive("/professor/aulas")}`}>
          🎓 Aulas
        </Link>

        <Link href="/professor/alunos" className={`block px-4 py-2 rounded ${isActive("/professor/alunos")}`}>
          👥 Alunos
        </Link>

        <Link href="/professor/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-700">
          💬 Fórum
        </Link>

        <hr className="my-4" />

        <h3 className="text-gray-500 text-xs font-bold uppercase mb-4">Outros</h3>

        <Link href="/professor/mensagens" className={`block px-4 py-2 rounded ${isActive("/professor/mensagens")}`}>
          💬 Mensagens
        </Link>

        <Link href="/professor/configuracoes" className={`block px-4 py-2 rounded ${isActive("/professor/configuracoes")}`}>
          ⚙️ Configurações
        </Link>
      </nav>
    </aside>
  );
}
