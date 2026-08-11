import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function RecuperarSenha() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1); // 1: Solicitar E-mail, 2: Token & Nova Senha, 3: Sucesso
  const [email, setEmail] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenGerado, setTokenGerado] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Pass 1: Solicitar Token via E-mail
  const handleSolicitarToken = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao solicitar recuperação.");
        setCarregando(false);
        return;
      }

      setTokenGerado(data.token);
      setTokenInput(data.token); // Preenche automaticamente para agilizar na apresentação
      setSucesso(`Código de verificação gerado com sucesso!`);
      setEtapa(2);
    } catch (err) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  // Pass 2: Redefinir Senha com Token e Bcryptjs
  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/auth/recuperar-senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: tokenInput,
          novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao redefinir senha.");
        setCarregando(false);
        return;
      }

      setEtapa(3);
    } catch (err) {
      setErro("Erro ao conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        
        {/* Header Institucional EDEP */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img src="/images/igepps-logo2.png" alt="EDEP" className="h-12 w-auto" />
            <h1 className="text-2xl font-bold text-blue-900">EDEP</h1>
          </div>
          <Link href="/login">
            <button className="text-gray-500 hover:text-gray-700 transition" title="Voltar ao Login">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Link>
        </div>
        <p className="text-center text-gray-600 mb-6 text-sm">Recuperação de Acesso — EDEP</p>

        {/* Mensagens de Feedback */}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {sucesso}
          </div>
        )}

        {/* ETAPA 1: Solicitar E-mail */}
        {etapa === 1 && (
          <form onSubmit={handleSolicitarToken} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">E-mail Cadastrado</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              {carregando ? "Gerando código..." : "Enviar Código de Recuperação"}
            </button>
          </form>
        )}

        {/* ETAPA 2: Digitar Token e Redefinir Senha */}
        {etapa === 2 && (
          <form onSubmit={handleRedefinirSenha} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 mb-2">
              <span className="font-bold">Código de Teste: </span>
              <span className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-blue-300 font-bold">{tokenGerado}</span>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Código de Verificação</label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="EX: A1B2C3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm font-mono tracking-widest text-center uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              {carregando ? "Atualizando..." : "Redefinir Senha"}
            </button>
          </form>
        )}

        {/* ETAPA 3: Confirmação de Sucesso */}
        {etapa === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-800">Senha Alterada com Sucesso!</h3>
            <p className="text-sm text-gray-600">Sua nova senha foi atualizada e criptografada com segurança.</p>
            
            <Link href="/login">
              <button
                type="button"
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition text-sm mt-2"
              >
                Ir para o Login
              </button>
            </Link>
          </div>
        )}

        {/* Botão de Retorno */}
        {etapa !== 3 && (
          <Link href="/login">
            <button
              type="button"
              className="w-full bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition border border-gray-300 mt-4 text-sm"
            >
              ← Voltar para o Login
            </button>
          </Link>
        )}

      </div>
    </div>
  );
}
