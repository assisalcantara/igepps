import { useState, useEffect } from 'react';
import { safeGetItem, safeSetItem } from '../lib/storage';

export default function CookieBanner() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já aceitou cookies
    const consentimento = safeGetItem('cookie-consent');
    if (!consentimento) {
      setMostrar(true);
    }
  }, []);

  const aceitarTodos = () => {
    safeSetItem('cookie-consent', JSON.stringify({
      aceito: true,
      data: new Date().toISOString(),
      tipo: 'todos'
    }));
    setMostrar(false);
  };

  const aceitarEssenciais = () => {
    safeSetItem('cookie-consent', JSON.stringify({
      aceito: true,
      data: new Date().toISOString(),
      tipo: 'essenciais'
    }));
    setMostrar(false);
  };

  if (!mostrar) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-6 shadow-2xl border-t-4 border-blue-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍪</span>
              <h3 className="text-lg font-bold">Cookies e Proteção de Dados</h3>
            </div>
            <p className="text-sm text-gray-300">
              Utilizamos cookies para melhorar sua experiência. Alguns são essenciais para o funcionamento do site, 
              enquanto outros nos ajudam a entender como você usa a plataforma.
            </p>
            <div className="mt-2 flex gap-2">
              <a href="/politica-privacidade" className="text-blue-400 hover:text-blue-300 text-xs underline">
                Política de Privacidade
              </a>
              <span className="text-gray-500">•</span>
              <a href="/termos-de-uso" className="text-blue-400 hover:text-blue-300 text-xs underline">
                Termos de Uso
              </a>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={aceitarEssenciais}
              className="flex-1 md:flex-none px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition text-sm font-medium"
            >
              Apenas Essenciais
            </button>
            <button
              onClick={aceitarTodos}
              className="flex-1 md:flex-none px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-sm font-bold"
            >
              Aceitar Todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
