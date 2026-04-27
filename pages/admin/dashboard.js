import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import { safeGetItem } from '@/lib/storage';

export default function AdminDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalProfessores: 0,
    totalCursos: 0,
    totalTopicos: 0,
    totalNoticias: 0,
    cursosAtivos: 0,
    alunosAtivos: 0,
    topicosPorCurso: [],
    cursosRecentes: [],
    atividadeRecente: []
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const usu = safeGetItem("usuario");
    if (!usu) { router.push("/login"); return; }
    const u = JSON.parse(usu);
    if (u.tipo !== "admin") { router.push("/dashboard"); return; }
    setUsuario(u);
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    setCarregando(true);
    try {
      // Buscar dados de todas as APIs
      const [alunosRes, professoresRes, cursosRes, forumRes, noticiasRes] = await Promise.all([
        fetch('/api/alunos'),
        fetch('/api/professores'),
        fetch('/api/cursos'),
        fetch('/api/forum'),
        fetch('/api/noticias')
      ]);

      const alunos = await alunosRes.json();
      const professores = await professoresRes.json();
      const cursos = await cursosRes.json();
      const topicos = await forumRes.json();
      const noticias = await noticiasRes.json();

      // Calcular estatísticas
      const cursosAtivos = cursos.filter(c => c.ativo).length;
      
      // Tópicos por curso
      const topicosPorCurso = cursos.map(curso => ({
        titulo: curso.titulo,
        total: topicos.filter(t => t.cursoId === curso.id).length
      })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

      // Cursos mais recentes
      const cursosRecentes = cursos
        .sort((a, b) => new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0))
        .slice(0, 5);

      // Atividade recente (últimos tópicos)
      const atividadeRecente = topicos
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
        .slice(0, 10)
        .map(topico => {
          const curso = cursos.find(c => c.id === topico.cursoId);
          return {
            ...topico,
            cursoTitulo: curso?.titulo || 'Curso não encontrado'
          };
        });

      setStats({
        totalAlunos: alunos.length,
        totalProfessores: professores.length,
        totalCursos: cursos.length,
        totalTopicos: topicos.length,
        totalNoticias: noticias.length,
        cursosAtivos,
        alunosAtivos: alunos.filter(a => a.ativo !== false).length,
        topicosPorCurso,
        cursosRecentes,
        atividadeRecente
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
    setCarregando(false);
  };

  if (!usuario) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader usuario={usuario} />
          <main className="p-8 bg-gradient-to-b from-gray-100 to-gray-50">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h2>
              <p className="text-sm text-gray-500">Visão geral do sistema IGEPPS Academy</p>
            </div>

          {carregando ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Carregando estatísticas...</div>
            </div>
          ) : (
            <>
              {/* Cards de Estatísticas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎓</span>
                    </div>
                    <div className="flex gap-0.5 items-end h-8">
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '40%'}}></div>
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '70%'}}></div>
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '50%'}}></div>
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '90%'}}></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Total de Alunos</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalAlunos}</h3>
                </div>

                <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      <span className="text-xl">👥</span>
                    </div>
                    <div className="w-16 h-8">
                      <svg viewBox="0 0 60 30" className="w-full h-full">
                        <path d="M0,15 Q15,5 30,15 T60,15" stroke="#374151" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Professores</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalProfessores}</h3>
                </div>

                <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="flex gap-0.5 items-end h-8">
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '60%'}}></div>
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '80%'}}></div>
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '45%'}}></div>
                      <div className="w-1.5 bg-gray-800 rounded-full" style={{height: '75%'}}></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Cursos</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalCursos}</h3>
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200 text-slate-900">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <div className="w-16 h-8">
                      <svg viewBox="0 0 60 30" className="w-full h-full">
                        <path d="M0,25 L15,20 L30,15 L45,10 L60,5" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.5" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs opacity-80 mb-1">Fórum - Tópicos</p>
                  <h3 className="text-3xl font-bold">{stats.totalTopicos}</h3>
                </div>
              </div>

              {/* Cards secundários */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs text-gray-600 mb-2">Notícias</h3>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalNoticias}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs text-gray-600 mb-2">Taxa de Ativação</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalCursos > 0 ? Math.round((stats.cursosAtivos / stats.totalCursos) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs text-gray-600 mb-2">Média Tópicos/Curso</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.cursosAtivos > 0 ? (stats.totalTopicos / stats.cursosAtivos).toFixed(1) : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Tópicos por Curso */}
              {stats.topicosPorCurso.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 text-gray-900">Engajamento no Fórum</h3>
                  <div className="space-y-4">
                    {stats.topicosPorCurso.map((item, index) => {
                      const maxTopicos = Math.max(...stats.topicosPorCurso.map(i => i.total));
                      const largura = (item.total / maxTopicos) * 100;
                      
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">
                              {item.titulo}
                            </span>
                            <span className="text-sm font-bold text-blue-600">{item.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${largura}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Cursos Recentes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Cursos Recentes</h3>
                  {stats.cursosRecentes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum curso cadastrado</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.cursosRecentes.map((curso) => (
                        <div key={curso.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          {curso.thumbnail ? (
                            <img src={curso.thumbnail} alt={curso.titulo} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white">
                              📚
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{curso.titulo}</h4>
                            <p className="text-xs text-gray-500">
                              {curso.dataCriacao ? new Date(curso.dataCriacao).toLocaleDateString('pt-BR') : 'Data não disponível'}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${curso.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {curso.ativo ? '✓ Ativo' : 'Inativo'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Atividade Recente no Fórum */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Atividade Recente</h3>
                  {stats.atividadeRecente.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma atividade no fórum</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.atividadeRecente.map((topico) => (
                        <div key={topico.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{topico.titulo}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-600 truncate flex-1">
                              {topico.cursoTitulo}
                            </p>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(topico.dataCriacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>👁️ {topico.visualizacoes}</span>
                            <span>💬 {topico.respostas?.length || 0}</span>
                            <span className="text-blue-600">Por: {topico.autorNome}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Links Rápidos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/usuarios" className="group bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-slate-700 group-hover:to-slate-800 transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">👤</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Usuários</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Gerenciar alunos e admins</p>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/professores" className="group bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-slate-700 group-hover:to-slate-800 transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">🎓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Professores</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Cadastrar e gerenciar</p>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/forum" className="group bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-slate-700 group-hover:to-slate-800 transition-all">
                      <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Fórum</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Moderar discussões</p>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
          </main>
        </div>
      </div>
    </div>
  );
}
