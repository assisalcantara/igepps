import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AdminEmails from '../../components/AdminEmails';
import { safeGetItem } from '../../lib/storage';

export default function EmailsPage() {
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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 min-w-0">
        <AdminHeader usuario={usuario} isCollapsed={isCollapsed} />
        <main className="p-8 pt-20">
          <AdminEmails />
        </main>
      </div>
    </div>
  );
}
