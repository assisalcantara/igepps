import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AdminAvaliacoes from '../../components/AdminAvaliacoes';
import { safeGetItem } from '../../lib/storage';

export default function AvaliacoesPage() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const usuarioLogado = safeGetItem('usuario');
    if (!usuarioLogado) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(usuarioLogado);
    if (user.tipo !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    setUsuario(user);
  }, []);

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader usuario={usuario} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 pt-24">
          <AdminAvaliacoes />
        </main>
      </div>
    </div>
  );
}
