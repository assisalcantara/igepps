import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CertificadoDocumento() {
  const router = useRouter();
  const { codigo } = router.query;

  const [certificado, setCertificado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (codigo) {
      carregarCertificado();
    }
  }, [codigo]);

  const carregarCertificado = async () => {
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch(`/api/certificados?codigo=${codigo}`);
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Certificado não encontrado.');
      } else {
        setCertificado(data);
      }
    } catch (err) {
      setErro('Erro ao carregar o certificado.');
    } finally {
      setCarregando(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-semibold">Gerando Certificado Digital EDEP...</div>
      </div>
    );
  }

  if (erro || !certificado) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Certificado Não Encontrado</h2>
          <p className="text-gray-600 text-sm mb-6">{erro || 'O código de validação informado é inválido.'}</p>
          <Link href="/validar-certificado">
            <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition text-sm font-semibold">
              ← Tentar Outro Código
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const dataFormatada = new Date(certificado.dataEmissao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Botões de Ação na Tela (Ocultos na Impressão) */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-6 print:hidden">
        <Link href="/dashboard">
          <button className="bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2 shadow-sm">
            ← Voltar ao Dashboard
          </button>
        </Link>

        <div className="flex gap-3">
          <Link href={`/validar-certificado?codigo=${certificado.codigoValidacao}`}>
            <button className="bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm flex items-center gap-2 shadow-sm">
              🔍 Validar Online
            </button>
          </Link>
          <button
            onClick={handleImprimir}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg shadow transition text-sm flex items-center gap-2"
          >
            🖨️ Imprimir / Baixar PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO DO CERTIFICADO INSTITUCIONAL */}
      <div className="bg-white max-w-4xl w-full p-8 md:p-14 rounded-2xl shadow-2xl border-8 border-double border-blue-900 relative overflow-hidden print:border-4 print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Marca d'água de fundo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/images/igepps-logo2.png" alt="Marca D'água" className="w-96 h-auto" />
        </div>

        {/* Header do Certificado */}
        <div className="flex justify-between items-center border-b-2 border-yellow-500 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/igepps-logo2.png" alt="EDEP" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-black text-blue-950 tracking-wider">EDEP</h1>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Escola Digital de Educação Previdenciária</p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-yellow-100 border border-yellow-400 text-yellow-900 font-mono text-xs font-bold px-3 py-1 rounded-full inline-block">
              {certificado.codigoValidacao}
            </span>
            <p className="text-[10px] text-gray-500 mt-1">Validação Oficial EDEP/IGEPPS</p>
          </div>
        </div>

        {/* Título Principal */}
        <div className="text-center my-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 uppercase tracking-widest font-serif mb-2">
            CERTIFICADO DE CONCLUSÃO
          </h2>
          <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
        </div>

        {/* Corpo do Texto */}
        <div className="text-center my-10 space-y-6 text-gray-800 leading-relaxed font-sans px-4">
          <p className="text-base md:text-lg">
            Certificamos que <strong className="text-xl md:text-2xl font-extrabold text-blue-950 block my-2 underline decoration-yellow-500 underline-offset-4">{certificado.alunoNome}</strong>
            concluiu com êxito o curso de capacitação profissional em
          </p>

          <div className="bg-blue-50 border-y-2 border-blue-900 py-4 my-4">
            <h3 className="text-xl md:text-2xl font-bold text-blue-900">{certificado.cursoTitulo}</h3>
            <p className="text-xs text-blue-700 font-semibold mt-1">Carga Horária Total: {certificado.cargaHoraria} Horas Aula</p>
          </div>

          <p className="text-sm md:text-base text-gray-700">
            promovido pela <strong>EDEP - Escola Digital de Educação Previdenciária / IGEPPS</strong>, tendo cumprido integralmente o programa pedagógico e obtido aprovação na avaliação institucional em <strong>{dataFormatada}</strong>.
          </p>
        </div>

        {/* Assinaturas Institucionais */}
        <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t border-gray-300 text-center text-xs text-gray-700">
          <div>
            <div className="w-48 h-0.5 bg-gray-800 mx-auto mb-2"></div>
            <p className="font-bold text-gray-900">Coordenação Pedagógica</p>
            <p className="text-gray-500">EDEP - Educação Previdenciária</p>
          </div>
          <div>
            <div className="w-48 h-0.5 bg-gray-800 mx-auto mb-2"></div>
            <p className="font-bold text-gray-900">Direção Executiva</p>
            <p className="text-gray-500">IGEPPS - Governo do Estado</p>
          </div>
        </div>

        {/* Rodapé de Validação */}
        <div className="mt-12 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-[11px] text-gray-500 gap-2">
          <p>Documento emitido eletronicamente pela Plataforma EDEP.</p>
          <p className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            Código de Autenticidade: <strong>{certificado.codigoValidacao}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
