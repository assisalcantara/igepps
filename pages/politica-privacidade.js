import Link from 'next/link';
import { useState } from 'react';

export default function PoliticaPrivacidade() {
  const [expandido, setExpandido] = useState(null);

  const secoes = [
    {
      id: 'introducao',
      titulo: '1. Introdução',
      conteudo: `A presente Política de Privacidade foi elaborada para informar sobre como a EAD IGEPPS coleta, utiliza, armazena e protege os dados pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).`
    },
    {
      id: 'dados-coletados',
      titulo: '2. Dados Coletados',
      conteudo: `Coletamos os seguintes tipos de dados pessoais:

• Dados de Identificação: Nome completo, CPF, email, telefone
• Dados Acadêmicos: Cursos inscritos, progresso, avaliações, certificados
• Dados de Localização: Estado e cidade
• Dados Educacionais: Escolaridade, profissão, data de nascimento
• Dados de Navegação: IP, tipo de navegador, páginas acessadas, tempo de sessão
• Fotos de Perfil: Imagens enviadas voluntariamente
• Documentos: Arquivos enviados para avaliação`
    },
    {
      id: 'finalidade',
      titulo: '3. Finalidade do Uso de Dados',
      conteudo: `Utilizamos seus dados para:

• Criar e gerenciar sua conta
• Fornecer acesso aos cursos e materiais educacionais
• Processar avaliações e emitir certificados
• Enviar comunicações sobre cursos e atualizações
• Melhorar nossos serviços e experiência do usuário
• Cumprir obrigações legais
• Prevenir fraudes e abuso do sistema
• Personalizar o conteúdo e recomendações`
    },
    {
      id: 'compartilhamento',
      titulo: '4. Compartilhamento de Dados',
      conteudo: `Seus dados NÃO são compartilhados com terceiros, exceto:

• Quando obrigado por lei ou decisão judicial
• Com prestadores de serviço (hospedagem, análise de dados) sob contrato de confidencialidade
• Com sua permissão explícita
• Para fins de segurança e prevenção de fraudes`
    },
    {
      id: 'armazenamento',
      titulo: '5. Armazenamento e Segurança',
      conteudo: `Implementamos medidas de segurança técnicas e administrativas para proteger seus dados:

• Criptografia de dados em trânsito (HTTPS/SSL)
• Controle de acesso baseado em permissões
• Backups regulares
• Monitoramento de atividades suspeitas
• Política de retenção de dados conforme LGPD

Os dados são armazenados em servidores seguros e apenas pessoal autorizado tem acesso.`
    },
    {
      id: 'direitos',
      titulo: '6. Seus Direitos LGPD',
      conteudo: `Você tem direito a:

• ACESSO: Solicitar cópia de seus dados
• RETIFICAÇÃO: Corrigir informações imprecisas
• EXCLUSÃO: Solicitar remoção de dados (direito ao esquecimento)
• PORTABILIDADE: Receber dados em formato estruturado
• OPOSIÇÃO: Se opor ao processamento de dados
• REVOGAÇÃO DE CONSENTIMENTO: Revogar permissão a qualquer momento

Para exercer esses direitos, entre em contato conosco.`
    },
    {
      id: 'cookies',
      titulo: '7. Cookies e Rastreamento',
      conteudo: `Utilizamos cookies para:

• Manter você conectado na plataforma
• Salvar preferências de idioma e tema
• Rastrear progresso nos cursos (localStorage)
• Análise anônima de uso (Google Analytics)

Você pode desabilitar cookies nas configurações do navegador, mas isso pode afetar a funcionalidade da plataforma.`
    },
    {
      id: 'retencao',
      titulo: '8. Retenção de Dados',
      conteudo: `Os dados são retidos conforme necessário para:

• Fornecer nossos serviços
• Cumprir obrigações legais (5-7 anos para registros acadêmicos)
• Resolver disputas

Após a exclusão da conta, dados serão deletados em até 30 dias, salvo quando houver obrigação legal de retenção.`
    },
    {
      id: 'menores',
      titulo: '9. Proteção de Menores',
      conteudo: `Não coletamos dados de menores de 18 anos sem consentimento dos pais/responsáveis. Se descobrirmos que um menor forneceu dados sem consentimento, deletaremos imediatamente.`
    },
    {
      id: 'alteracoes',
      titulo: '10. Alterações na Política',
      conteudo: `Esta Política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas por email ou aviso destacado no site. O uso continuado do serviço após alterações constitui aceitação das novas condições.

Última atualização: 09 de dezembro de 2025`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <Link href="/">
            <button className="flex items-center gap-2 hover:opacity-80 transition mb-4">
              <span>←</span> Voltar
            </button>
          </Link>
          <h1 className="text-4xl font-bold">Política de Privacidade</h1>
          <p className="text-blue-100 mt-2">IGEPPS Academy - Lei Geral de Proteção de Dados (LGPD)</p>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Aviso LGPD */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded">
            <div className="flex gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h2 className="font-bold text-yellow-900 mb-2">Sua Privacidade é Importante</h2>
                <p className="text-yellow-800 text-sm">
                  Esta plataforma opera em conformidade com a Lei Geral de Proteção de Dados (LGPD). 
                  Você tem direitos específicos sobre seus dados pessoais. Leia atentamente esta política.
                </p>
              </div>
            </div>
          </div>

          {/* Índice */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Índice de Seções</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {secoes.map((secao) => (
                <button
                  key={secao.id}
                  onClick={() => setExpandido(expandido === secao.id ? null : secao.id)}
                  className="text-left p-3 rounded hover:bg-blue-50 transition text-blue-600 hover:text-blue-800 font-medium"
                >
                  {secao.titulo}
                </button>
              ))}
            </div>
          </div>

          {/* Seções */}
          <div className="space-y-4">
            {secoes.map((secao) => (
              <div
                key={secao.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <button
                  onClick={() => setExpandido(expandido === secao.id ? null : secao.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <h2 className="text-xl font-bold text-gray-800">{secao.titulo}</h2>
                  <span className="text-2xl">{expandido === secao.id ? '−' : '+'}</span>
                </button>

                {expandido === secao.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {secao.conteudo}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contato */}
          <div className="bg-blue-50 rounded-lg p-8 mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📞 Dúvidas sobre sua Privacidade?</h2>
            <p className="text-gray-700 mb-4">
              Se você tem dúvidas sobre esta Política de Privacidade ou deseja exercer seus direitos LGPD, entre em contato:
            </p>
            <div className="bg-white p-4 rounded border border-blue-200">
              <p className="font-semibold text-gray-800">📧 Email:</p>
              <p className="text-blue-600 mb-4">privacidade@igepps.com.br</p>
              
              <p className="font-semibold text-gray-800">⏱️ Tempo de Resposta:</p>
              <p className="text-gray-700">Até 15 dias úteis para solicitudes LGPD</p>
            </div>
          </div>

          {/* Links Relacionados */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Documentos Relacionados</h3>
            <div className="flex gap-4">
              <Link href="/termos-de-uso">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                  📋 Termos de Uso
                </button>
              </Link>
              <Link href="/">
                <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition">
                  🏠 Início
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 IGEPPS Academy. Todos os direitos reservados. | 
            <Link href="/politica-privacidade" className="text-blue-400 hover:text-blue-300 mx-1">Privacidade</Link> | 
            <Link href="/termos-de-uso" className="text-blue-400 hover:text-blue-300 mx-1">Termos</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
