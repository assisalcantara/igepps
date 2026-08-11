import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { safeGetItem, safeSetItem } from '../lib/storage';

export default function AvaliacaoCurso() {
  const router = useRouter();
  const { cursoId } = router.query;

  const [usuario, setUsuario] = useState(null);
  const [curso, setCurso] = useState(null);
  const [avaliacao, setAvaliacao] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const usuarioStr = safeGetItem('usuario');
    if (!usuarioStr) {
      router.push('/login');
      return;
    }

    const u = JSON.parse(usuarioStr);
    setUsuario(u);

    if (cursoId) {
      carregarCursoEAvaliacao(u.id);
    }
  }, [cursoId]);

  const carregarCursoEAvaliacao = async (alunoId) => {
    setCarregando(true);
    try {
      const response = await fetch('/api/cursos');
      const cursos = await response.json();
      const cursoEncontrado = cursos.find(c => c.id === parseInt(cursoId));

      if (cursoEncontrado) {
        setCurso(cursoEncontrado);
        if (cursoEncontrado.avaliacao) {
          setAvaliacao(cursoEncontrado.avaliacao);
        }

        // Verificar se já existe resultado salvo no localStorage
        const resultadoSalvo = safeGetItem(`resultado_avaliacao_${cursoId}_${alunoId}`);
        if (resultadoSalvo) {
          setResultado(JSON.parse(resultadoSalvo));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar avaliação do curso:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSelecionarOpcao = (questaoId, opcaoIndex) => {
    if (resultado) return; // Impedir alteração após envio
    setRespostas(prev => ({
      ...prev,
      [questaoId]: opcaoIndex
    }));
  };

  const handleSubmeterAvaliacao = (e) => {
    e.preventDefault();
    if (!avaliacao || !avaliacao.questoes) return;

    // Verificar se respondeu todas as questões
    const questoesNaoRespondidas = avaliacao.questoes.filter(q => respostas[q.id] === undefined);
    if (questoesNaoRespondidas.length > 0) {
      alert(`Por favor, responda todas as questões antes de enviar. Faltam ${questoesNaoRespondidas.length} questão(ões).`);
      return;
    }

    setEnviando(true);

    // Calcular Nota
    let acertos = 0;
    const detalhamento = avaliacao.questoes.map(q => {
      const respostaDada = respostas[q.id];
      const correta = q.respostaCorreta === respostaDada;
      if (correta) acertos++;
      return {
        questaoId: q.id,
        enunciado: q.enunciado,
        respostaDada,
        respostaCorreta: q.respostaCorreta,
        correta
      };
    });

    const totalQuestoes = avaliacao.questoes.length;
    const notaFinal = Math.round((acertos / totalQuestoes) * 100);
    const notaMinima = avaliacao.notaMinima || 70;
    const aprovado = notaFinal >= notaMinima;

    const resObj = {
      dataEnvio: new Date().toISOString(),
      acertos,
      totalQuestoes,
      notaFinal,
      notaMinima,
      aprovado,
      detalhamento
    };

    setResultado(resObj);
    safeSetItem(`resultado_avaliacao_${cursoId}_${usuario?.id}`, JSON.stringify(resObj));
    setEnviando(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefazerAvaliacao = () => {
    setResultado(null);
    setRespostas({});
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-semibold">Carregando avaliação EDEP...</div>
      </div>
    );
  }

  if (!curso || !avaliacao) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <span className="text-4xl mb-4 block">📝</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Avaliação não encontrada</h2>
          <p className="text-gray-600 text-sm mb-6">Este curso ainda não possui uma avaliação final cadastrada.</p>
          <Link href={`/assistir/${cursoId}`}>
            <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition text-sm font-semibold">
              ← Voltar para as Aulas
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Institucional EDEP */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/igepps-logo2.png" alt="EDEP" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold">EDEP - Escola Digital de Educação Previdenciária</h1>
              <p className="text-xs text-blue-200">Avaliação Online do Curso</p>
            </div>
          </div>
          <Link href={`/assistir/${cursoId}`}>
            <button className="bg-blue-800 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition">
              ← Voltar às Aulas
            </button>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto w-full p-4 lg:p-8 flex-1">
        
        {/* Banner do Curso */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Avaliação Oficial
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{avaliacao.titulo}</h2>
          <p className="text-sm text-gray-600 mb-4">{curso.titulo}</p>
          
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <span>📋 Total de Questões: <strong>{avaliacao.questoes?.length || 0}</strong></span>
            <span>🎯 Nota Mínima para Aprovação: <strong>{avaliacao.notaMinima}%</strong></span>
            <span>⏱️ Tempo Sugerido: <strong>{avaliacao.duracaoMinutos || 30} minutos</strong></span>
          </div>
        </div>

        {/* EXIBIÇÃO DO RESULTADO (Se já enviado) */}
        {resultado && (
          <div className={`rounded-2xl shadow-md p-6 mb-8 text-white transition-all ${
            resultado.aprovado 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700' 
              : 'bg-gradient-to-r from-amber-600 to-red-700'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                {resultado.aprovado ? '🎉' : '⚠️'}
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {resultado.aprovado ? 'Parabéns! Você foi Aprovado(a)!' : 'Aprovação Não Atingida'}
                </h3>
                <p className="text-sm opacity-90">
                  {resultado.aprovado 
                    ? 'Sua nota atendeu ao critério mínimo de aproveitamento da EDEP.' 
                    : `Sua nota foi ${resultado.notaFinal}%. A nota mínima exigida é ${resultado.notaMinima}%.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-xl p-4 text-center mt-4">
              <div>
                <p className="text-xs opacity-80">Nota Final</p>
                <p className="text-3xl font-extrabold">{resultado.notaFinal}%</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Acertos</p>
                <p className="text-3xl font-extrabold">{resultado.acertos} / {resultado.totalQuestoes}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Status</p>
                <p className="text-sm font-bold uppercase mt-2">
                  {resultado.aprovado ? 'APROVADO' : 'REPROVADO'}
                </p>
              </div>
            </div>

            {!resultado.aprovado && (
              <button 
                onClick={handleRefazerAvaliacao}
                className="mt-6 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition shadow text-sm"
              >
                🔄 Tentar Novamente
              </button>
            )}
          </div>
        )}

        {/* QUESTÕES */}
        <form onSubmit={handleSubmeterAvaliacao} className="space-y-6">
          {avaliacao.questoes?.map((q, idx) => {
            const detalhe = resultado?.detalhamento?.find(d => d.questaoId === q.id);
            
            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-blue-900 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    Questão {idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 flex-1">
                    {q.enunciado}
                  </h3>
                </div>

                <div className="space-y-2.5 pl-2">
                  {q.opcoes?.map((opcao, opIdx) => {
                    const selecionado = respostas[q.id] === opIdx;
                    let estilosOpcao = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50';

                    if (resultado) {
                      if (opIdx === q.respostaCorreta) {
                        estilosOpcao = 'border-green-500 bg-green-50 text-green-900 font-semibold';
                      } else if (selecionado && !detalhe?.correta) {
                        estilosOpcao = 'border-red-500 bg-red-50 text-red-900';
                      } else {
                        estilosOpcao = 'border-gray-200 opacity-60';
                      }
                    } else if (selecionado) {
                      estilosOpcao = 'border-blue-600 bg-blue-50 text-blue-900 font-medium shadow-sm';
                    }

                    return (
                      <label
                        key={opIdx}
                        onClick={() => handleSelecionarOpcao(q.id, opIdx)}
                        className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all text-sm ${estilosOpcao}`}
                      >
                        <input
                          type="radio"
                          name={`questao_${q.id}`}
                          checked={selecionado}
                          onChange={() => {}}
                          disabled={!!resultado}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="flex-1">{opcao}</span>
                        {resultado && opIdx === q.respostaCorreta && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold">Correta</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!resultado && (
            <div className="flex justify-end pt-4 mb-8">
              <button
                type="submit"
                disabled={enviando}
                className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-slate-900 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-base"
              >
                {enviando ? "Processando Nota..." : "Enviar Avaliação"}
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
