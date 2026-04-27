import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProfessorHeader from "@/components/ProfessorHeader";
import ProfessorSidebar from "@/components/ProfessorSidebar";
import { safeGetItem } from '@/lib/storage';

export default function ProfessorDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const usu = safeGetItem("usuario");
    if (!usu) {
      router.push("/login");
      return;
    }

    const u = JSON.parse(usu);
    if (u.tipo !== "professor") {
      router.push("/dashboard");
      return;
    }

    setUsuario(u);
    carregarCursos();
  }, []);

  const carregarCursos = async () => {
    setCarregando(true);
    try {
      const response = await fetch('/api/cursos');
      const todosCursos = await response.json();
      
      // Filtrar apenas cursos ativos para professores
      const cursosAtivos = todosCursos.filter(c => c.ativo !== false).map(curso => ({
        ...curso,
        alunos: Math.floor(Math.random() * 50) + 10, // Simulado
        aulas: curso.modulos?.reduce((total, mod) => total + (mod.aulas?.length || 0), 0) || 0,
        status: "ativo"
      }));
      
      setCursos(cursosAtivos);
    } catch (err) {
      console.error("Erro ao carregar cursos:", err);
    }
    setCarregando(false);
  };

  if (!usuario) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  const totalAlunos = cursos.reduce((sum, c) => sum + c.alunos, 0);
  const totalAulas = cursos.reduce((sum, c) => sum + c.aulas, 0);
  const cursosAtivos = cursos.filter(c => c.status === "ativo").length;

  return (
    <div className="min-h-screen bg-gray-100">
      <ProfessorHeader usuario={usuario} />
      <div className="flex">
        <ProfessorSidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Painel do Professor</h2>
            <p className="text-gray-600 mt-1">Bem-vindo de volta, {usuario.nomeCompleto}!</p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
              <h3 className="text-gray-600 text-sm font-semibold">Meus Cursos</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{cursos.length}</p>
              <p className="text-gray-600 text-xs mt-2">{cursosAtivos} ativos</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
              <h3 className="text-gray-600 text-sm font-semibold">Total de Alunos</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalAlunos}</p>
              <p className="text-gray-600 text-xs mt-2">Inscritos</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
              <h3 className="text-gray-600 text-sm font-semibold">Total de Aulas</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalAulas}</p>
              <p className="text-gray-600 text-xs mt-2">Publicadas</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-600">
              <h3 className="text-gray-600 text-sm font-semibold">Mensagens</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">12</p>
              <p className="text-gray-600 text-xs mt-2">Não lidas</p>
            </div>
          </div>

          {/* Seção de Cursos */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Meus Cursos</h3>
              <Link href="/professor/cursos" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                + Novo Curso
              </Link>
            </div>

            {carregando ? (
              <div className="text-center py-8">Carregando...</div>
            ) : cursos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">Você ainda não tem cursos</p>
                <Link href="/professor/cursos" className="text-blue-600 hover:underline mt-4 inline-block">
                  Criar seu primeiro curso
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursos.map(curso => (
                  <div key={curso.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{curso.titulo}</h4>
                      <p className="text-gray-600 text-sm mb-4">{curso.descricao}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-gray-600">Alunos</p>
                          <p className="text-xl font-bold text-blue-600">{curso.alunos}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-gray-600">Aulas</p>
                          <p className="text-xl font-bold text-purple-600">{curso.aulas}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/professor/cursos/${curso.id}`} className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm">
                          Editar
                        </Link>
                        <button className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 text-sm">
                          Visualizar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Atividades Recentes</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 border-l-4 border-blue-600 bg-blue-50 rounded">
                <span className="text-2xl mr-4">📝</span>
                <div>
                  <p className="font-semibold text-gray-800">Nova aula adicionada</p>
                  <p className="text-sm text-gray-600">Você adicionou aula em "JavaScript Moderno" há 2 horas</p>
                </div>
              </div>

              <div className="flex items-center p-4 border-l-4 border-green-600 bg-green-50 rounded">
                <span className="text-2xl mr-4">👥</span>
                <div>
                  <p className="font-semibold text-gray-800">Novo aluno inscrito</p>
                  <p className="text-sm text-gray-600">João Silva se inscreveu em "React Avançado"</p>
                </div>
              </div>

              <div className="flex items-center p-4 border-l-4 border-yellow-600 bg-yellow-50 rounded">
                <span className="text-2xl mr-4">💬</span>
                <div>
                  <p className="font-semibold text-gray-800">Dúvida de aluno</p>
                  <p className="text-sm text-gray-600">Maria perguntou sobre o módulo 3 de "Node.js"</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
