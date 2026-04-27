import { useState, useEffect } from 'react';
import Link from 'next/link';
import RichTextEditor from './RichTextEditor';

export default function Forum({ usuario }) {
  const [cursos, setCursos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [topicoSelecionado, setTopicoSelecionado] = useState(null);
  const [criandoTopico, setCriandoTopico] = useState(false);
  const [formTopico, setFormTopico] = useState({ titulo: '', conteudo: '' });
  const [formResposta, setFormResposta] = useState('');

  useEffect(() => {
    carregarCursos();
    carregarProfessores();
    carregarTopicos();
  }, []);

  const carregarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      setCursos(data.filter(c => c.ativo));
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const carregarProfessores = async () => {
    try {
      const response = await fetch('/api/professores');
      const data = await response.json();
      setProfessores(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
  };

  const carregarTopicos = async (cursoId = null) => {
    try {
      const url = cursoId ? `/api/forum?cursoId=${cursoId}` : '/api/forum';
      const response = await fetch(url);
      const data = await response.json();
      setTopicos(data);
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
    }
  };

  const selecionarCurso = (curso) => {
    setCursoSelecionado(curso);
    setTopicoSelecionado(null);
    setCriandoTopico(false);
    carregarTopicos(curso.id);
  };

  const voltarParaCursos = () => {
    setCursoSelecionado(null);
    setTopicoSelecionado(null);
    setCriandoTopico(false);
    carregarTopicos();
  };

  const abrirTopico = async (topico) => {
    // Incrementar visualizações
    await fetch(`/api/forum?id=${topico.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'visualizar' })
    });
    
    setTopicoSelecionado(topico);
    setCriandoTopico(false);
  };

  const criarTopico = async (e) => {
    e.preventDefault();
    
    if (!formTopico.titulo || !formTopico.conteudo) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: cursoSelecionado.id,
          autorId: usuario.id,
          autorNome: usuario.nomeCompleto || usuario.nome,
          autorTipo: usuario.tipo,
          titulo: formTopico.titulo,
          conteudo: formTopico.conteudo
        })
      });

      if (response.ok) {
        alert('Tópico criado com sucesso!');
        setFormTopico({ titulo: '', conteudo: '' });
        setCriandoTopico(false);
        carregarTopicos(cursoSelecionado.id);
      } else {
        alert('Erro ao criar tópico');
      }
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      alert('Erro ao criar tópico');
    }
  };

  const responderTopico = async (e) => {
    e.preventDefault();
    
    if (!formResposta.trim()) {
      alert('Digite uma resposta');
      return;
    }

    try {
      const response = await fetch(`/api/forum?id=${topicoSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'responder',
          autorId: usuario.id,
          autorNome: usuario.nomeCompleto || usuario.nome,
          autorTipo: usuario.tipo,
          conteudo: formResposta
        })
      });

      if (response.ok) {
        const topicoAtualizado = await response.json();
        setTopicoSelecionado(topicoAtualizado);
        setFormResposta('');
        carregarTopicos(cursoSelecionado.id);
      } else {
        alert('Erro ao responder tópico');
      }
    } catch (error) {
      console.error('Erro ao responder:', error);
      alert('Erro ao responder tópico');
    }
  };

  const toggleFixar = async (topicoId) => {
    try {
      await fetch(`/api/forum?id=${topicoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'fixar' })
      });
      carregarTopicos(cursoSelecionado.id);
    } catch (error) {
      console.error('Erro ao fixar/desafixar:', error);
    }
  };

  const toggleFechar = async (topicoId) => {
    try {
      await fetch(`/api/forum?id=${topicoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'fechar' })
      });
      carregarTopicos(cursoSelecionado.id);
      if (topicoSelecionado?.id === topicoId) {
        const topicoAtualizado = topicos.find(t => t.id === topicoId);
        setTopicoSelecionado({...topicoAtualizado, fechado: !topicoAtualizado.fechado});
      }
    } catch (error) {
      console.error('Erro ao fechar/abrir:', error);
    }
  };

  const excluirTopico = async (topicoId) => {
    if (!confirm('Deseja realmente excluir este tópico?')) return;

    try {
      await fetch(`/api/forum?id=${topicoId}`, { method: 'DELETE' });
      alert('Tópico excluído com sucesso!');
      setTopicoSelecionado(null);
      carregarTopicos(cursoSelecionado?.id);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir tópico');
    }
  };

  const getProfessorResponsavel = (cursoId) => {
    const prof = professores.find(p => p.cursosResponsaveis?.includes(cursoId));
    return prof ? prof.nome : 'Sem professor';
  };

  const ehModerador = (cursoId) => {
    if (usuario.tipo === 'admin') return true;
    if (usuario.tipo === 'professor') {
      const prof = professores.find(p => p.email === usuario.email);
      return prof?.cursosResponsaveis?.includes(cursoId);
    }
    return false;
  };

  // Vista: Seleção de Curso
  if (!cursoSelecionado) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">💬 Fórum de Discussões</h2>
        <p className="text-gray-600 mb-8">Selecione um curso para participar das discussões</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => {
            const topicosCurso = topicos.filter(t => t.cursoId === curso.id);
            const professorNome = getProfessorResponsavel(curso.id);

            return (
              <div
                key={curso.id}
                onClick={() => selecionarCurso(curso)}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start gap-3 mb-4">
                  {curso.thumbnail ? (
                    <img src={curso.thumbnail} alt={curso.titulo} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded flex items-center justify-center text-white text-2xl">
                      📚
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{curso.titulo}</h3>
                    <p className="text-xs text-blue-600 mt-1">👨‍🏫 {professorNome}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <span className="text-gray-600">
                    💬 {topicosCurso.length} {topicosCurso.length === 1 ? 'tópico' : 'tópicos'}
                  </span>
                  <span className="text-blue-600 font-semibold">Acessar →</span>
                </div>
              </div>
            );
          })}
        </div>

        {cursos.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            Nenhum curso disponível no momento.
          </div>
        )}
      </div>
    );
  }

  // Vista: Lista de Tópicos do Curso
  if (!topicoSelecionado && !criandoTopico) {
    const topicosFiltrados = topicos.filter(t => t.cursoId === cursoSelecionado.id);
    const topicosFixados = topicosFiltrados.filter(t => t.fixado);
    const topicosNormais = topicosFiltrados.filter(t => !t.fixado);

    return (
      <div>
        <button
          onClick={voltarParaCursos}
          className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Voltar aos Cursos
        </button>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-start gap-4">
            {cursoSelecionado.thumbnail && (
              <img src={cursoSelecionado.thumbnail} alt={cursoSelecionado.titulo} className="w-20 h-20 object-cover rounded" />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{cursoSelecionado.titulo}</h2>
              <p className="text-sm text-gray-600 mt-1">
                👨‍🏫 Moderador: {getProfessorResponsavel(cursoSelecionado.id)}
              </p>
            </div>
            <button
              onClick={() => setCriandoTopico(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              ➕ Novo Tópico
            </button>
          </div>
        </div>

        {/* Tópicos Fixados */}
        {topicosFixados.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">📌 Tópicos Fixados</h3>
            {topicosFixados.map((topico) => (
              <div
                key={topico.id}
                onClick={() => abrirTopico(topico)}
                className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-3 hover:bg-yellow-100 cursor-pointer transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      📌 {topico.titulo}
                      {topico.fechado && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">🔒 Fechado</span>}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Por <strong>{topico.autorNome}</strong> • {new Date(topico.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div>👁️ {topico.visualizacoes}</div>
                    <div>💬 {topico.respostas.length}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tópicos Normais */}
        <h3 className="text-lg font-bold text-gray-700 mb-3">💬 Discussões</h3>
        {topicosNormais.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            Nenhum tópico ainda. Seja o primeiro a iniciar uma discussão!
          </div>
        ) : (
          topicosNormais.map((topico) => (
            <div
              key={topico.id}
              onClick={() => abrirTopico(topico)}
              className="bg-white p-4 rounded-lg shadow mb-3 hover:shadow-lg cursor-pointer transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {topico.titulo}
                    {topico.fechado && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">🔒 Fechado</span>}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Por <strong>{topico.autorNome}</strong> • {new Date(topico.dataCriacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <div>👁️ {topico.visualizacoes}</div>
                  <div>💬 {topico.respostas.length}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Vista: Criar Novo Tópico
  if (criandoTopico) {
    return (
      <div>
        <button
          onClick={() => setCriandoTopico(false)}
          className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Voltar
        </button>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">➕ Criar Novo Tópico</h2>
          
          <form onSubmit={criarTopico}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formTopico.titulo}
                onChange={(e) => setFormTopico({ ...formTopico, titulo: e.target.value })}
                placeholder="Ex: Dúvida sobre o módulo 2..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formTopico.conteudo}
                onChange={(content) => setFormTopico({ ...formTopico, conteudo: content })}
                placeholder="Descreva sua dúvida ou inicie uma discussão..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                ✅ Publicar Tópico
              </button>
              <button
                type="button"
                onClick={() => setCriandoTopico(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Vista: Tópico Aberto com Respostas
  return (
    <div>
      <button
        onClick={() => setTopicoSelecionado(null)}
        className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Voltar aos Tópicos
      </button>

      {/* Tópico Principal */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {topicoSelecionado.fixado && '📌'}
              {topicoSelecionado.titulo}
              {topicoSelecionado.fechado && (
                <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded">🔒 Fechado</span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Por <strong>{topicoSelecionado.autorNome}</strong> • {new Date(topicoSelecionado.dataCriacao).toLocaleString('pt-BR')}
            </p>
          </div>
          
          {ehModerador(cursoSelecionado.id) && (
            <div className="flex gap-2">
              <button
                onClick={() => toggleFixar(topicoSelecionado.id)}
                className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                title={topicoSelecionado.fixado ? 'Desafixar' : 'Fixar'}
              >
                {topicoSelecionado.fixado ? '📌 Desafixar' : '📌 Fixar'}
              </button>
              <button
                onClick={() => toggleFechar(topicoSelecionado.id)}
                className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200"
                title={topicoSelecionado.fechado ? 'Reabrir' : 'Fechar'}
              >
                {topicoSelecionado.fechado ? '🔓 Reabrir' : '🔒 Fechar'}
              </button>
              <button
                onClick={() => excluirTopico(topicoSelecionado.id)}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
              >
                🗑️ Excluir
              </button>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{topicoSelecionado.conteudo}</p>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
          <span>👁️ {topicoSelecionado.visualizacoes} visualizações</span>
          <span>💬 {topicoSelecionado.respostas.length} respostas</span>
        </div>
      </div>

      {/* Respostas */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        💬 Respostas ({topicoSelecionado.respostas.length})
      </h3>

      {topicoSelecionado.respostas.map((resposta, index) => (
        <div key={resposta.id} className="bg-gray-50 p-4 rounded-lg mb-3 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div>
              <strong className="text-gray-800">{resposta.autorNome}</strong>
              {resposta.autorTipo === 'professor' && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">👨‍🏫 Professor</span>
              )}
              {resposta.autorTipo === 'admin' && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">👑 Admin</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(resposta.dataCriacao).toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-line">{resposta.conteudo}</p>
        </div>
      ))}

      {topicoSelecionado.respostas.length === 0 && (
        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 mb-6">
          Seja o primeiro a responder!
        </div>
      )}

      {/* Formulário de Resposta */}
      {!topicoSelecionado.fechado ? (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h4 className="font-bold text-gray-800 mb-4">✍️ Adicionar Resposta</h4>
          <form onSubmit={responderTopico}>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows="4"
              value={formResposta}
              onChange={(e) => setFormResposta(e.target.value)}
              placeholder="Digite sua resposta..."
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              📤 Enviar Resposta
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-800">
          🔒 Este tópico está fechado e não aceita mais respostas.
        </div>
      )}
    </div>
  );
}
