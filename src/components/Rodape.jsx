import React from 'react';

export default function Rodape(){
  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
        <div>
          <img src="/images/igepps-logo2.png" alt="EDEP" className="h-12 mb-4 w-auto" />
          <h3 className="text-xl font-semibold mb-2">EDEP</h3>
          <p className="text-sm text-gray-200 leading-relaxed">Escola Digital de Educação Previdenciária — promovendo a qualificação e o fortalecimento da gestão previdenciária.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Institucional</h4>
          <ul className="space-y-2 text-gray-200">
            <li><a href="#" className="hover:underline">Sobre a EDEP</a></li>
            <li><a href="#" className="hover:underline">Cursos e Programas</a></li>
            <li><a href="/validar-certificado" className="hover:underline text-yellow-300 font-semibold">🔍 Validar Certificado</a></li>
            <li><a href="#" className="hover:underline">Política de Privacidade</a></li>
            <li><a href="#" className="hover:underline">Fale Conosco</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Contato</h4>
          <ul className="space-y-2 text-gray-200">
            <li>E-mail: edep@igepps.pa.gov.br</li>
            <li>Telefone: (91) 0000-0000</li>
            <li>Endereço: Av. Governador Magalhães Barata, Belém - PA</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-700 mt-10 pt-6 text-center text-sm text-gray-300">
        <p>© {new Date().getFullYear()} EDEP - Escola Digital de Educação Previdenciária / IGEPPS. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
