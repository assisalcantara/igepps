import { useState, useEffect } from 'react';

export default function AdminAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filtroEstrelas, setFiltroEstrelas] = useState('todas');
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resAvaliacoes, resCursos] = await Promise.all([
        fetch('/api/avaliacoes'),
        fetch('/api/cursos')
      ]);
      
      const dataAvaliacoes = await resAvaliacoes.json();
      const dataCursos = await resCursos.json();
      
      setAvaliacoes(dataAvaliacoes);
      setCursos(dataCursos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const getNomeCurso = (cursoId) => {
    const curso = cursos.find(c => c.id === cursoId);
    return curso?.titulo || 'Curso não encontrado';
  };

  const getNomeAula = (cursoId, aulaId) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return 'Aula não encontrada';
    
    for (const modulo of curso.modulos || []) {
      const aula = modulo.aulas?.find(a => a.id === aulaId);
      if (aula) return aula.titulo;
    }
    return 'Aula não encontrada';
  };

  const calcularMediaCurso = (cursoId) => {
    const avaliacoesCurso = avaliacoes.filter(a => a.cursoId === cursoId);
    if (avaliacoesCurso.length === 0) return 0;
    const soma = avaliacoesCurso.reduce((acc, a) => acc + a.estrelas, 0);
    return (soma / avaliacoesCurso.length).toFixed(1);
  };

  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
    const filtroEstrelasOk = filtroEstrelas === 'todas' || avaliacao.estrelas === parseInt(filtroEstrelas);
    const filtroCursoOk = filtroCurso === 'todos' || avaliacao.cursoId === filtroCurso;
    return filtroEstrelasOk && filtroCursoOk;
  });

  const renderEstrelas = (quantidade) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`text-2xl ${i <= quantidade ? 'text-yellow-400' : 'text-gray-400'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando avaliações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">⭐ Avaliações dos Cursos</h2>
        <p className="text-yellow-100">Acompanhe o feedback dos alunos sobre as aulas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-yellow-600">{avaliacoes.length}</div>
          <div className="text-gray-600 text-sm">Total de Avaliações</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">
            {avaliacoes.length > 0 
              ? (avaliacoes.reduce((acc, a) => acc + a.estrelas, 0) / avaliacoes.length).toFixed(1)
              : '0.0'}
          </div>
          <div className="text-gray-600 text-sm">Média Geral</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">
            {avaliacoes.filter(a => a.estrelas === 5).length}
          </div>
          <div className="text-gray-600 text-sm">Avaliações 5 Estrelas</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-red-600">
            {avaliacoes.filter(a => a.estrelas <= 2).length}
          </div>
          <div className="text-gray-600 text-sm">Avaliações Baixas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Curso
            </label>
            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="todos">Todos os Cursos</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.titulo} ({avaliacoes.filter(a => a.cursoId === curso.id).length} avaliações)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Estrelas
            </label>
            <select
              value={filtroEstrelas}
              onChange={(e) => setFiltroEstrelas(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="todas">Todas as Avaliações</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 estrelas)</option>
              <option value="4">⭐⭐⭐⭐ (4 estrelas)</option>
              <option value="3">⭐⭐⭐ (3 estrelas)</option>
              <option value="2">⭐⭐ (2 estrelas)</option>
              <option value="1">⭐ (1 estrela)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Média por Curso */}
      {cursos.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">📊 Média por Curso</h3>
          <div className="space-y-3">
            {cursos.map(curso => {
              const media = calcularMediaCurso(curso.id);
              const quantidade = avaliacoes.filter(a => a.cursoId === curso.id).length;
              return (
                <div key={curso.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{curso.titulo}</p>
                    <p className="text-sm text-gray-600">{quantidade} avaliações</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-yellow-600">{media}</span>
                    {renderEstrelas(Math.round(parseFloat(media)))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Avaliações */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold">
            📝 Avaliações Recentes ({avaliacoesFiltradas.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {avaliacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nenhuma avaliação encontrada com os filtros selecionados
            </div>
          ) : (
            avaliacoesFiltradas.map(avaliacao => (
              <div key={avaliacao.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-gray-800">
                        {avaliacao.alunoNome}
                      </span>
                      {renderEstrelas(avaliacao.estrelas)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Curso:</strong> {getNomeCurso(avaliacao.cursoId)}</p>
                      <p><strong>Aula:</strong> {getNomeAula(avaliacao.cursoId, avaliacao.aulaId)}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(avaliacao.data).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {avaliacao.comentario && (
                  <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-700 italic">"{avaliacao.comentario}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
