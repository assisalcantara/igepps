import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ValidarCertificado() {
  const router = useRouter();
  const { codigo: codigoQuery } = router.query;

  const [codigoInput, setCodigoInput] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (codigoQuery) {
      setCodigoInput(codigoQuery);
      consultarCertificado(codigoQuery);
    }
  }, [codigoQuery]);

  const consultarCertificado = async (cod) => {
    setCarregando(true);
    setErro('');
    setResultado(null);

    try {
      const res = await fetch(`/api/certificados?codigo=${cod.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Certificado não encontrado.');
      } else {
        setResultado(data);
      }
    } catch (err) {
      setErro('Erro ao conectar ao serviço de validação.');
    } finally {
      setCarregando(false);
    }
  };

  const handleValidar = (e) => {
    e.preventDefault();
    if (!codigoInput.trim()) return;
    consultarCertificado(codigoInput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      {/* Header Institucional */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/igepps-logo2.png" alt="EDEP" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold">EDEP - Escola Digital de Educação Previdenciária</h1>
              <p className="text-xs text-blue-200">Portal Público de Validação de Certificados</p>
            </div>
          </div>
          <Link href="/">
            <button className="bg-blue-800 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition">
              ← Ir para a Home
            </button>
          </Link>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-xl mx-auto w-full p-4 lg:p-8 my-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🔍</span>
            <h2 className="text-2xl font-bold text-gray-900">Validar Certificado Digital</h2>
            <p className="text-sm text-gray-600 mt-1">
              Informe o Código de Autenticidade para verificar a veracidade do certificado emitido pela EDEP.
            </p>
          </div>

          <form onSubmit={handleValidar} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Código de Validação
              </label>
              <input
                type="text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                placeholder="EX: EDEP-2026-A8B9C0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center font-mono font-bold tracking-widest uppercase focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-xl shadow transition text-sm disabled:opacity-50"
            >
              {carregando ? "Consultando Base Oficial..." : "Verificar Autenticidade"}
            </button>
          </form>

          {/* MENSAGEM DE ERRO */}
          {erro && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">❌ Certificado Inválido ou Não Encontrado</p>
              <p className="text-xs text-red-600">{erro}</p>
            </div>
          )}

          {/* RESULTADO DA AUTENTICAÇÃO POSITIVA */}
          {resultado && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-emerald-950 space-y-4">
              <div className="flex items-center gap-3 border-b border-emerald-200 pb-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="font-bold text-emerald-900 text-lg">Certificado VÁLIDO e Autêntico</h3>
                  <p className="text-xs text-emerald-700">Emitido oficialmente pela EDEP / IGEPPS</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p><strong>Aluno(a):</strong> <span className="text-sm font-bold text-gray-900 block">{resultado.alunoNome}</span></p>
                <p><strong>Curso:</strong> <span className="font-semibold text-gray-800 block">{resultado.cursoTitulo}</span></p>
                <p><strong>Carga Horária:</strong> {resultado.cargaHoraria} Horas</p>
                <p><strong>Data de Conclusão:</strong> {new Date(resultado.dataEmissao).toLocaleDateString('pt-BR')}</p>
                <p><strong>Código de Autenticidade:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">{resultado.codigoValidacao}</span></p>
              </div>

              <Link href={`/certificado/${resultado.codigoValidacao}`}>
                <button className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow transition text-xs flex items-center justify-center gap-2">
                  📜 Visualizar Certificado Completo
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 text-center text-xs">
        <p>© {new Date().getFullYear()} EDEP - Escola Digital de Educação Previdenciária. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
