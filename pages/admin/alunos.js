import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AdminAlunos from '../../components/AdminAlunos';
import { safeGetItem } from '../../lib/storage';

export default function AlunosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioStorage = safeGetItem('usuario');
    if (usuarioStorage) {
      const usuarioData = JSON.parse(usuarioStorage);
      setUsuario(usuarioData);
      
      if (usuarioData.tipo !== 'admin') {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, []);

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      <AdminHeader usuario={usuario} />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <AdminAlunos />
        </main>
      </div>
    </div>
  );
}
