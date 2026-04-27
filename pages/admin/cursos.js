import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AdminCursos from '../../components/AdminCursos';
import { safeGetItem } from '../../lib/storage';

export default function CursosPage() {
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
    <div className="min-h-screen bg-gray-100">
      <AdminHeader usuario={usuario} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 pt-24">
          <AdminCursos />
        </main>
      </div>
    </div>
  );
}
