import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { safeSetItem } from '../lib/storage';
import { supabase } from '../lib/supabase';

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
      // 1. Caminho Principal: Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (!authError && authData?.user) {
        const authUser = authData.user;
        
        // Consultar perfil funcional em public.usuarios pelo UUID do usuário autenticado
        const { data: perfilData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const usuarioFinal = {
          id: authUser.id,
          email: authUser.email,
          nomeCompleto: perfilData?.nome_completo || authUser.user_metadata?.nome || authUser.email.split('@')[0],
          tipo: perfilData?.tipo || authUser.user_metadata?.tipo || 'aluno',
          status: perfilData?.status || 'ativo'
        };

        safeSetItem("token", authData.session?.access_token || ("token_" + authUser.id));
        safeSetItem("usuario", JSON.stringify(usuarioFinal));

        // Redirecionamento por tipo
        if (usuarioFinal.tipo === "admin") {
          router.push("/admin/dashboard");
        } else if (usuarioFinal.tipo === "professor") {
          router.push("/professor/dashboard");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      // 2. Fallback temporário para o banco local de demonstração
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

      if (usuarioEncontrado.tipo === "admin") {
        router.push("/admin/dashboard");
      } else if (usuarioEncontrado.tipo === "professor") {
        router.push("/professor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErro("Erro ao conectar ao servidor de autenticação");
      setCarregando(false);
    }
  };

  const handlePreencherAcesso = (emailPreencher, senhaPreencher) => {
    setEmail(emailPreencher);
    setSenha(senhaPreencher);
    setErro("");
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between items-center p-4 lg:p-8 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/bg01.png')" }}
    >
      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0"></div>

      {/* Topo institucional sutil */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 mb-4 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/images/igepps-logo3.fw.png" alt="EDEP" className="h-10 md:h-12 w-auto drop-shadow" />
          <div>
            <span className="text-white font-bold text-lg md:text-xl block group-hover:text-yellow-400 transition">EDEP</span>
            <span className="text-blue-200 text-xs hidden md:block">Escola Digital de Educação Previdenciária</span>
          </div>
        </Link>

        <Link href="/">
          <button className="text-blue-100 hover:text-white text-xs md:text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition border border-white/20">
            ← Voltar para a Home
          </button>
        </Link>
      </header>

      {/* Grid Principal: Form + Card de Demonstração */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto relative z-10">
        
        {/* Lado Esquerdo: Form de Login EDEP */}
        <div className="md:col-span-7 bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-2xl font-bold text-blue-950">Acessar Plataforma</h2>
            <p className="text-sm text-gray-500 mt-1">Digite suas credenciais corporativas para entrar na EDEP</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">E-mail Cadastrado</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@igepps.pa.gov.br"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                Lembrar neste navegador
              </label>
              <Link href="/recuperar-senha" className="text-blue-700 hover:text-blue-900 font-semibold hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-xs font-semibold">
                ⚠️ {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-950 hover:to-blue-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm mt-2"
            >
              {carregando ? "Autenticando..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>

        {/* Lado Direito: Card Discreto de Demonstração Institucional */}
        <div className="md:col-span-5 bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-700 text-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-3 mb-4">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-bold text-sm text-yellow-400">Acessos para demonstração</h3>
              <p className="text-[11px] text-slate-300">Selecione um perfil para preencher os dados</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* ADMIN */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-blue-500/30">
                    Admin
                  </span>
                </div>
                <p className="font-mono text-slate-200 text-[11px]">admin@igepps.com</p>
                <p className="text-[10px] text-slate-400">Senha: <span className="font-mono text-slate-300">admin123</span></p>
              </div>
              <button
                type="button"
                onClick={() => handlePreencherAcesso("admin@igepps.com", "admin123")}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap shadow-sm"
              >
                Usar acesso
              </button>
            </div>

            {/* PROFESSOR */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-emerald-500/30">
                    Professor
                  </span>
                </div>
                <p className="font-mono text-slate-200 text-[11px]">joao@igepps.com</p>
                <p className="text-[10px] text-slate-400">Senha: <span className="font-mono text-slate-300">prof123</span></p>
              </div>
              <button
                type="button"
                onClick={() => handlePreencherAcesso("joao@igepps.com", "prof123")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap shadow-sm"
              >
                Usar acesso
              </button>
            </div>

            {/* ALUNO */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-purple-500/30">
                    Aluno
                  </span>
                </div>
                <p className="font-mono text-slate-200 text-[11px]">maria@igepps.com</p>
                <p className="text-[10px] text-slate-400">Senha: <span className="font-mono text-slate-300">aluno123</span></p>
              </div>
              <button
                type="button"
                onClick={() => handlePreencherAcesso("maria@igepps.com", "aluno123")}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap shadow-sm"
              >
                Usar acesso
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="w-full text-center py-3 text-xs text-blue-200 opacity-80 relative z-10">
        © {new Date().getFullYear()} EDEP - Escola Digital de Educação Previdenciária / IGEPPS
      </footer>
    </div>
  );
}
