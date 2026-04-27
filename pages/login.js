import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { safeSetItem } from '../lib/storage';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/usuarios");
      const usuarios = await res.json();

      const usuarioEncontrado = usuarios.find(
        (u) => u.email === email && u.senha === senha
      );

      if (!usuarioEncontrado) {
        setErro("Email ou senha inválidos");
        setCarregando(false);
        return;
      }

      safeSetItem("token", "token_" + usuarioEncontrado.id);
      safeSetItem("usuario", JSON.stringify(usuarioEncontrado));

      // Redireciona conforme tipo de usuário
      if (usuarioEncontrado.tipo === "admin") {
        router.push("/admin/dashboard");
      } else if (usuarioEncontrado.tipo === "professor") {
        router.push("/professor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErro("Erro ao conectar ao servidor");
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-blue-600">EAD IGEPPS</h1>
          <Link href="/">
            <button className="text-gray-500 hover:text-gray-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Link>
        </div>
        <p className="text-center text-gray-600 mb-8">Plataforma de Educação a Distância</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
          
        <Link href="/">
          <button
            type="button"
            className="w-full bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition border border-gray-300 mt-4"
          >
            ← Voltar para Home
          </button>
        </Link>

        <div className="mt-6 pt-6 border-t border-gray-300">
          <p className="text-center text-gray-600 text-sm mb-4">Credenciais de Teste:</p>
          <div className="space-y-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <p className="font-semibold text-blue-800">Admin:</p>
              <p className="text-gray-700">admin@igepps.com / admin123</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="font-semibold text-green-800">Professor:</p>
              <p className="text-gray-700">joao@igepps.com / prof123</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <p className="font-semibold text-purple-800">Aluno:</p>
              <p className="text-gray-700">maria@igepps.com / aluno123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
