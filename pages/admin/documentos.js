import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AdminDocumentos from '../../components/AdminDocumentos';
import { safeGetItem } from '../../lib/storage';

export default function DocumentosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 min-w-0">
        <AdminHeader usuario={usuario} isCollapsed={isCollapsed} />
        <main className="p-8 pt-20">
          <AdminDocumentos />
        </main>
      </div>
    </div>
  );
}
