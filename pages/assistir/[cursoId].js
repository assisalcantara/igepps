import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { safeGetItem, safeSetItem } from '../../lib/storage';
import { supabase } from '../../lib/supabase';

export default function AssistirCurso() {
  const router = useRouter();
  const { cursoId } = router.query;
  
  const [usuario, setUsuario] = useState(null);
  const [curso, setCurso] = useState(null);
  const [moduloAtual, setModuloAtual] = useState(null);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [progresso, setProgresso] = useState({});
  const [matriculaId, setMatriculaId] = useState(null);
  const [showRespostas, setShowRespostas] = useState({});
  const [respostasUsuario, setRespostasUsuario] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  const [avaliacaoEstrelas, setAvaliacaoEstrelas] = useState(0);
  const [hoverEstrela, setHoverEstrela] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
  const [sidebarAberta, setSidebarAberta] = useState(false);

  useEffect(() => {
    async function inicializarAssistir() {
      // 1. Obter usuário autenticado via Supabase Auth
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData?.session?.user;

      let u = null;
      const usuarioStr = safeGetItem('usuario');
      if (usuarioStr) {
        u = JSON.parse(usuarioStr);
      }

      const activeUser = u || (authUser ? {
        id: authUser.id,
        email: authUser.email,
        nome: authUser.user_metadata?.nome || authUser.email.split('@')[0],
        tipo: 'aluno'
      } : null);

      if (!activeUser) {
        router.push('/login');
        return;
      }
      
      setUsuario(activeUser);
      
      if (cursoId) {
        carregarCursoEProgresso(activeUser.id);
      }
    }

    inicializarAssistir();
  }, [cursoId]);

  const carregarCursoEProgresso = async (alunoId) => {
    setCarregando(true);
    try {
      // 1. Carregar estrutura do curso via API
      const response = await fetch('/api/cursos');
      const cursos = await response.json();
      const cursoEncontrado = cursos.find(c => String(c.id) === String(cursoId));
      
      if (cursoEncontrado && cursoEncontrado.ativo) {
        setCurso(cursoEncontrado);
        
        let progressoMap = {};
        let currentMatriculaId = null;

        // 2. Buscar matrícula e aulas concluídas em public.progresso_aulas
        if (alunoId) {
          const { data: matriculaDb } = await supabase
            .from('matriculas')
            .select('id')
            .eq('aluno_id', alunoId)
            .eq('curso_id', cursoEncontrado.id)
            .maybeSingle();

          if (matriculaDb) {
            currentMatriculaId = matriculaDb.id;
            setMatriculaId(matriculaDb.id);

            const { data: progressoDb } = await supabase
              .from('progresso_aulas')
              .select('aula_id')
              .eq('matricula_id', matriculaDb.id);

            if (progressoDb && progressoDb.length > 0) {
              progressoDb.forEach(item => {
                progressoMap[item.aula_id] = true;
              });
            }
          }
        }

        // 3. Fallback no localStorage se vazio no Supabase
        if (Object.keys(progressoMap).length === 0) {
          const progressoSalvo = safeGetItem(`progresso_${cursoId}_${alunoId}`);
          if (progressoSalvo) {
            progressoMap = JSON.parse(progressoSalvo);
          }
        }

        setProgresso(progressoMap);
        
        // Selecionar primeiro módulo e primeira aula
        if (cursoEncontrado.modulos && cursoEncontrado.modulos.length > 0) {
          setModuloAtual(cursoEncontrado.modulos[0]);
          if (cursoEncontrado.modulos[0].aulas && cursoEncontrado.modulos[0].aulas.length > 0) {
            setAulaAtual(cursoEncontrado.modulos[0].aulas[0]);
          }
        }
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    }
    setCarregando(false);
  };

  const formatarVideoUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const marcarAulaConcluida = async (aulaId) => {
    if (!aulaId) return;

    const jaConcluido = Boolean(progresso[aulaId]);
    const novoStatus = !jaConcluido;
    const novoProgresso = { ...progresso, [aulaId]: novoStatus };
    setProgresso(novoProgresso);

    // Backup local
    safeSetItem(`progresso_${cursoId}_${usuario?.id}`, JSON.stringify(novoProgresso));

    // Gravar no Supabase public.progresso_aulas
    if (matriculaId) {
      try {
        if (novoStatus) {
          await supabase
            .from('progresso_aulas')
            .upsert(
              { matricula_id: matriculaId, aula_id: aulaId, concluido_em: new Date().toISOString() },
              { onConflict: 'matricula_id,aula_id' }
            );
        } else {
          await supabase
            .from('progresso_aulas')
            .delete()
            .eq('matricula_id', matriculaId)
            .eq('aula_id', aulaId);
        }

        // Recalcular e atualizar percentual na matrícula
        if (curso && curso.modulos) {
          let total = 0;
          let concluidas = 0;
          curso.modulos.forEach(m => {
            (m.aulas || []).forEach(a => {
              total++;
              if (novoProgresso[a.id]) concluidas++;
            });
          });
          const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
          await supabase
            .from('matriculas')
            .update({ progresso_percentual: pct })
            .eq('id', matriculaId);
        }
      } catch (err) {
        console.error('Erro ao atualizar progresso no Supabase:', err);
      }
    }
  };

  const selecionarAula = (modulo, aula) => {
    setModuloAtual(modulo);
    setAulaAtual(aula);
    setAbaAtiva('visao-geral');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const proximaAula = () => {
    if (!moduloAtual || !aulaAtual || !curso) return;
    
    const aulasDoModulo = moduloAtual.aulas || [];
    const indiceAtual = aulasDoModulo.findIndex(a => a.id === aulaAtual.id);
    
    if (indiceAtual < aulasDoModulo.length - 1) {
      // Próxima aula do mesmo módulo
      setAulaAtual(aulasDoModulo[indiceAtual + 1]);
    } else {
      // Próximo módulo
      const indiceModulo = curso.modulos.findIndex(m => m.id === moduloAtual.id);
      if (indiceModulo < curso.modulos.length - 1) {
        const proximoModulo = curso.modulos[indiceModulo + 1];
        setModuloAtual(proximoModulo);
        if (proximoModulo.aulas && proximoModulo.aulas.length > 0) {
          setAulaAtual(proximoModulo.aulas[0]);
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calcularProgressoCurso = () => {
    if (!curso || !curso.modulos) return 0;
    let totalAulas = 0;
    let aulasConcluidas = 0;
    
    curso.modulos.forEach(modulo => {
      if (modulo.aulas) {
        totalAulas += modulo.aulas.length;
        modulo.aulas.forEach(aula => {
          if (progresso[aula.id]) {
            aulasConcluidas++;
          }
        });
      }
    });
    
    return totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;
  };

  const handleResposta = (questaoId, opcao) => {
    setRespostasUsuario({ ...respostasUsuario, [questaoId]: opcao });
  };

  const salvarAvaliacao = async () => {
    try {
      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId,
          aulaId: aulaAtual?.id,
          alunoId: usuario?.id,
          alunoNome: usuario?.nome,
          estrelas: avaliacaoEstrelas,
          comentario: comentarioAvaliacao
        })
      });

      if (response.ok) {
        alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
        setAvaliacaoEstrelas(0);
        setComentarioAvaliacao('');
      } else {
        alert('Erro ao enviar avaliação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  if (carregando || !curso) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Carregando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Overlay Mobile */}
      {sidebarAberta && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 transition text-sm lg:text-base">
            <span>←</span> <span className="hidden sm:inline">Voltar à Área do Aluno</span><span className="sm:hidden">Voltar</span>
          </Link>
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="lg:hidden bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition flex items-center gap-2 text-sm"
          >
            📚 <span>Aulas</span>
          </button>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Progresso: <span className="text-green-500 font-bold">{calcularProgressoCurso()}%</span>
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calcularProgressoCurso()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Player de Vídeo */}
          <div className="bg-black">
            {aulaAtual?.videoUrl ? (
              <div className="aspect-video">
                <iframe
                  src={formatarVideoUrl(aulaAtual.videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  title={aulaAtual.titulo}
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <p className="text-gray-400 mb-2">📹</p>
                  <p className="text-gray-400">Vídeo não disponível</p>
                </div>
              </div>
            )}
          </div>

          {/* Informações da Aula */}
          <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-start justify-between mb-4 gap-3">
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                  <span className="bg-green-500 text-black px-3 py-1 rounded text-sm font-bold">
                    ✓ Concluído
                  </span>
                  {moduloAtual && (
                    <span className="text-gray-400 text-sm">{moduloAtual.titulo}</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{aulaAtual?.titulo}</h1>
                <p className="text-gray-400">{aulaAtual?.descricao}</p>
              </div>
            </div>

            {/* Abas */}
            <div className="border-b border-gray-700 mb-6">
              <div className="flex gap-6">
                <button 
                  onClick={() => setAbaAtiva('visao-geral')}
                  className={`pb-3 border-b-2 font-semibold transition ${
                    abaAtiva === 'visao-geral' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Visão Geral
                </button>
                <button 
                  onClick={() => setAbaAtiva('materiais')}
                  className={`pb-3 border-b-2 font-semibold transition ${
                    abaAtiva === 'materiais' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  📎 Materiais {aulaAtual?.materiais?.length > 0 && `(${aulaAtual.materiais.length})`}
                </button>
                <button 
                  onClick={() => setAbaAtiva('avaliacao')}
                  className={`pb-3 border-b-2 font-semibold transition ${
                    abaAtiva === 'avaliacao' 
                      ? 'border-green-500 text-green-500' 
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  ⭐ Avaliar Aula
                </button>
                <Link href={`/avaliacao/${cursoId}`}>
                  <button className="pb-3 border-b-2 border-transparent font-semibold text-yellow-400 hover:text-yellow-300 transition flex items-center gap-1.5">
                    📝 Avaliação do Curso
                  </button>
                </Link>
              </div>
            </div>

            {/* Conteúdo da Aba: Visão Geral */}
            {abaAtiva === 'visao-geral' && (
              <>
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Sobre esta aula</h3>
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: aulaAtual?.conteudo || aulaAtual?.descricao }}
                  />
                </div>

                {/* Questões na Visão Geral */}
                {aulaAtual?.questoes && aulaAtual.questoes.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">📝 Questões de Fixação</h3>
                    <div className="space-y-6">
                      {aulaAtual.questoes.map((questao, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-5">
                          <p className="font-semibold mb-4">{idx + 1}. {questao.pergunta}</p>
                          <div className="space-y-2">
                            {questao.opcoes.map((opcao, opcaoIdx) => {
                              const letra = String.fromCharCode(65 + opcaoIdx);
                              const isRespondida = showRespostas[questao.id];
                              const isCorreta = letra === questao.respostaCorreta;
                              const isSelecionada = respostasUsuario[questao.id] === letra;
                              
                              return (
                                <button
                                  key={opcaoIdx}
                                  onClick={() => handleResposta(questao.id, letra)}
                                  disabled={isRespondida}
                                  className={`w-full text-left p-4 rounded-lg transition ${
                                    isRespondida
                                      ? isCorreta
                                        ? 'bg-green-600 border-2 border-green-400'
                                        : isSelecionada
                                        ? 'bg-red-600 border-2 border-red-400'
                                        : 'bg-gray-600'
                                      : isSelecionada
                                      ? 'bg-blue-600 border-2 border-blue-400'
                                      : 'bg-gray-600 hover:bg-gray-500'
                                  }`}
                                >
                                  <span className="font-semibold mr-2">{letra}.</span> {opcao}
                                </button>
                              );
                            })}
                          </div>
                          {!showRespostas[questao.id] && respostasUsuario[questao.id] && (
                            <button
                              onClick={() => setShowRespostas({ ...showRespostas, [questao.id]: true })}
                              className="mt-4 bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded-lg transition"
                            >
                              Verificar Resposta
                            </button>
                          )}
                          {showRespostas[questao.id] && (
                            <div className={`mt-4 p-4 rounded-lg ${
                              respostasUsuario[questao.id] === questao.respostaCorreta
                                ? 'bg-green-900/50 border border-green-500'
                                : 'bg-red-900/50 border border-red-500'
                            }`}>
                              <p className="font-semibold mb-2">
                                {respostasUsuario[questao.id] === questao.respostaCorreta
                                  ? '✓ Correto!'
                                  : '✗ Incorreto'}
                              </p>
                              {questao.explicacao && (
                                <p className="text-sm text-gray-300">{questao.explicacao}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Conteúdo da Aba: Materiais */}
            {abaAtiva === 'materiais' && (
              <div className="bg-gray-800 rounded-lg p-6">
                {aulaAtual?.materiais && aulaAtual.materiais.length > 0 ? (
                  <>
                    <h3 className="text-xl font-bold mb-4">📎 Materiais de Apoio</h3>
                    <p className="text-gray-400 mb-6">Baixe os materiais complementares para esta aula</p>
                    <div className="space-y-3">
                      {aulaAtual.materiais.map((material, idx) => (
                        <a
                          key={idx}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-5 bg-gray-700 rounded-lg hover:bg-gray-600 transition group"
                        >
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg mb-1">{material.titulo}</p>
                            <p className="text-sm text-gray-400">{material.tipo || 'Documento'}</p>
                          </div>
                          <div className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold group-hover:bg-green-400 transition flex items-center gap-2">
                            <span>↓</span> Download
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-50">📎</div>
                    <p className="text-gray-400 text-lg">Nenhum material disponível para esta aula</p>
                    <p className="text-gray-500 text-sm mt-2">Volte mais tarde para verificar novos materiais</p>
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo da Aba: Avaliação */}
            {abaAtiva === 'avaliacao' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">⭐ Avalie esta Aula</h3>
                <p className="text-gray-400 mb-8">Sua opinião é muito importante para melhorarmos o conteúdo</p>
                
                <div className="bg-gray-700 rounded-lg p-8 text-center">
                  <p className="text-lg font-semibold mb-6">Como você avalia esta aula?</p>
                  
                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((estrela) => (
                      <button
                        key={estrela}
                        onClick={() => setAvaliacaoEstrelas(estrela)}
                        onMouseEnter={() => setHoverEstrela(estrela)}
                        onMouseLeave={() => setHoverEstrela(0)}
                        className="transition-transform hover:scale-125"
                      >
                        <span className={`text-6xl ${
                          estrela <= (hoverEstrela || avaliacaoEstrelas)
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }`}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>

                  {avaliacaoEstrelas > 0 && (
                    <div className="space-y-4">
                      <p className="text-gray-300">
                        Você selecionou: <span className="text-yellow-400 font-bold text-xl">{avaliacaoEstrelas} estrela{avaliacaoEstrelas > 1 ? 's' : ''}</span>
                      </p>
                      
                      <textarea
                        value={comentarioAvaliacao}
                        onChange={(e) => setComentarioAvaliacao(e.target.value)}
                        placeholder="Deixe um comentário (opcional)"
                        className="w-full bg-gray-600 text-white p-4 rounded-lg border-2 border-gray-500 focus:border-green-500 focus:outline-none resize-none"
                        rows="4"
                      />
                      
                      <button
                        onClick={salvarAvaliacao}
                        className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-lg transition"
                      >
                        Enviar Avaliação
                      </button>
                    </div>
                  )}
                </div>

                {avaliacaoEstrelas === 0 && (
                  <p className="text-center text-gray-500 text-sm mt-4">
                    Clique nas estrelas acima para avaliar
                  </p>
                )}
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => marcarAulaConcluida(aulaAtual?.id)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {progresso[aulaAtual?.id] ? '✓ Concluído' : 'Marcar como Concluído'}
              </button>
              <button
                onClick={proximaAula}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                Ir para o próximo módulo →
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar - Lista de Aulas */}
        <aside className={`w-80 lg:w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto h-screen fixed lg:sticky top-0 right-0 z-50 transition-transform duration-300 ${sidebarAberta ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold text-lg mb-1">{curso.titulo}</h2>
            <p className="text-sm text-gray-400">Aulas • {curso.modulos?.reduce((acc, m) => acc + (m.aulas?.length || 0), 0)} Conteúdos</p>
          </div>

          <div className="p-4">
            {curso.modulos?.map((modulo, moduloIdx) => (
              <div key={modulo.id} className="mb-4">
                <div className="bg-gray-700 rounded-lg p-3 mb-2">
                  <h3 className="font-semibold text-sm">{modulo.titulo}</h3>
                  <p className="text-xs text-gray-400 mt-1">{modulo.aulas?.length || 0} aulas</p>
                </div>

                <div className="space-y-2 ml-2">
                  {modulo.aulas?.map((aula, aulaIdx) => (
                    <button
                      key={aula.id}
                      onClick={() => selecionarAula(modulo, aula)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        aulaAtual?.id === aula.id
                          ? 'bg-purple-600 border-2 border-purple-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          progresso[aula.id] ? 'bg-green-500 text-black' : 'bg-gray-600'
                        }`}>
                          {progresso[aula.id] ? '✓' : aulaIdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{aula.titulo}</p>
                          {aula.duracao && (
                            <p className="text-xs text-gray-400">{aula.duracao} min</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
